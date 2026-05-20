// src/admin-withdraw.js
import { db } from './firebase.js';
import { ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

export const adminWithdrawHTML = `
    <div class="space-y-6 w-full max-w-6xl mx-auto pb-10">
        <div class="flex justify-between items-center hidden md:flex mb-6">
            <div>
                <h2 class="text-2xl font-black text-gray-800">Withdrawal Requests</h2>
                <p class="text-xs text-gray-500 font-bold mt-1">Review and process user payout requests</p>
            </div>
            <div class="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-100 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Secure Payouts
            </div>
        </div>

        <div id="admin-withdraw-list" class="space-y-4">
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <i class="fa-solid fa-spinner fa-spin text-3xl text-adminPrimary mb-4"></i>
                <p class="text-gray-500 font-bold">Loading payout requests...</p>
            </div>
        </div>
    </div>
`;

export const setupAdminWithdrawEvents = () => {
    const listEl = document.getElementById('admin-withdraw-list');
    const withdrawRef = ref(db, 'withdrawals/');

    const showEmptyState = () => {
        listEl.innerHTML = `
            <div class="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400 text-3xl border border-gray-100 shadow-sm">
                    <i class="fa-solid fa-money-check-dollar"></i>
                </div>
                <h3 class="text-lg font-black text-gray-800">No Pending Withdrawals</h3>
                <p class="text-gray-500 text-xs font-medium mt-1.5">All users have been paid out.</p>
            </div>`;
    };

    onValue(withdrawRef, async (snapshot) => {
        if (!snapshot.exists()) {
            showEmptyState();
            return;
        }

        let pendingRequests = [];

        // Fetch all pending withdrawals
        snapshot.forEach((userNode) => {
            const uid = userNode.key;
            userNode.forEach((reqNode) => {
                const req = reqNode.val();
                if (req.status === 'pending') {
                    pendingRequests.push({ uid: uid, ...req });
                }
            });
        });

        if (pendingRequests.length === 0) {
            showEmptyState();
            return;
        }

        // Fetch User Details for each request
        for (let i = 0; i < pendingRequests.length; i++) {
            const req = pendingRequests[i];
            const userSnapshot = await get(ref(db, `users/${req.uid}`));
            const uData = userSnapshot.exists() ? userSnapshot.val() : {};
            req.user = {
                fullName: uData.fullName || 'Unknown User',
                phone: uData.phone || ''
            };
        }

        // Sort by Date
        pendingRequests.sort((a, b) => b.requestDate - a.requestDate);

        listEl.innerHTML = pendingRequests.map(req => {
            const phoneStr = req.user.phone;
            const waLink = phoneStr ? `https://wa.me/91${phoneStr}?text=Hello%20${encodeURIComponent(req.user.fullName)},%20regarding%20your%20withdrawal%20request%20of%20Rs.${req.amount}...` : '#';
            
            // Format details view
            let detailsHtml = req.payoutDetails;
            if (req.method === 'Bank') {
                detailsHtml = req.payoutDetails.replace(/\n/g, '<br>');
            }

            // Icon Based on Method
            let iconClass = 'fa-building-columns text-orange-600';
            let bgClass = 'bg-orange-50 border-orange-100';
            if(req.method === 'UPI') { iconClass = 'fa-at text-purple-600'; bgClass = 'bg-purple-50 border-purple-100'; }
            if(req.method === 'Cash') { iconClass = 'fa-money-bill-wave text-green-600'; bgClass = 'bg-green-50 border-green-100'; }

            return `
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden group hover:border-blue-300 transition-colors">
                <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                
                <div class="flex items-start gap-4 w-full md:w-1/3 pl-2">
                    <div class="w-12 h-12 ${bgClass} rounded-full flex items-center justify-center text-xl shrink-0 border">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h3 class="font-black text-gray-800 text-base">${req.user.fullName}</h3>
                        </div>
                        <div class="flex items-center gap-3 mt-1">
                            <p class="text-xs text-gray-500 font-bold"><i class="fa-solid fa-phone mr-1 text-gray-300"></i> ${phoneStr || 'N/A'}</p>
                            ${phoneStr ? `
                            <a href="${waLink}" target="_blank" class="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 transition-colors active:scale-95">
                                <i class="fa-brands fa-whatsapp"></i> Chat
                            </a>` : ''}
                        </div>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">${new Date(req.requestDate).toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div class="w-full md:w-1/3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">${req.method} Details</p>
                    <p class="text-xs font-bold text-gray-700 leading-relaxed">${detailsHtml}</p>
                </div>
                
                <div class="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-2">
                    <div class="text-left md:text-right">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Payout Amount</p>
                        <p class="text-2xl font-black text-gray-800">₹${req.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn-reject-withdraw px-4 py-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 rounded-lg text-xs font-bold transition-all" data-uid="${req.uid}" data-id="${req.withdrawalId}" data-amount="${req.amount}">
                            Reject & Refund
                        </button>
                        <button class="btn-approve-withdraw px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all active:scale-95" data-uid="${req.uid}" data-id="${req.withdrawalId}">
                            Mark as Paid <i class="fa-solid fa-check ml-1"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        // Attach Events
        document.querySelectorAll('.btn-approve-withdraw').forEach(btn => btn.addEventListener('click', handleApprove));
        document.querySelectorAll('.btn-reject-withdraw').forEach(btn => btn.addEventListener('click', handleReject));
    });

    // --- APPROVE (MARK AS PAID) LOGIC ---
    const handleApprove = async (e) => {
        const btn = e.currentTarget;
        const uid = btn.getAttribute('data-uid');
        const reqId = btn.getAttribute('data-id');

        Swal.fire({
            title: 'Mark as Paid?',
            text: `Are you sure you have successfully sent the money to the user's account?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563EB', // Blue
            confirmButtonText: 'Yes, Mark as Paid'
        }).then(async (result) => {
            if(result.isConfirmed) {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                
                try {
                    // Sirf status change karna hai, balance already minus ho chuka hai User Panel se
                    await update(ref(db, `withdrawals/${uid}/${reqId}`), { status: 'approved' });
                    Swal.fire({icon: 'success', title: 'Payout Complete!', timer: 1500, showConfirmButton: false});
                } catch(err) {
                    Swal.fire('Error', 'Could not update status.', 'error');
                    btn.innerHTML = originalHtml;
                }
            }
        });
    };

    // --- REJECT & REFUND LOGIC ---
    const handleReject = async (e) => {
        const btn = e.currentTarget;
        const uid = btn.getAttribute('data-uid');
        const reqId = btn.getAttribute('data-id');
        const amount = parseFloat(btn.getAttribute('data-amount'));

        Swal.fire({
            title: 'Reject & Refund?',
            text: `₹${amount} will be refunded back to the user's wallet.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Refund'
        }).then(async (result) => {
            if(result.isConfirmed) {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                
                try {
                    // User ka current balance fetch karo
                    const userRef = ref(db, `users/${uid}`);
                    const snapshot = await get(userRef);
                    const currentBalance = snapshot.val()?.walletBalance || 0;

                    // Atomically refund wallet AND change status to rejected
                    const updates = {};
                    updates[`users/${uid}/walletBalance`] = currentBalance + amount;
                    updates[`withdrawals/${uid}/${reqId}/status`] = 'rejected';

                    await update(ref(db), updates);

                    Swal.fire({icon: 'success', title: 'Refunded!', text: 'Money has been returned to user wallet.', timer: 1500, showConfirmButton: false});
                } catch(err) {
                    Swal.fire('Error', 'Could not process refund.', 'error');
                    btn.innerHTML = originalHtml;
                }
            }
        });
    };
};
