// src/admin-wallet.js
import { db } from './firebase.js';
import { ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

export const adminWalletHTML = `
    <div class="space-y-6 w-full max-w-6xl mx-auto">
        <div class="flex justify-between items-center hidden md:flex mb-6">
            <div>
                <h2 class="text-2xl font-black text-gray-800">Wallet Requests</h2>
                <p class="text-xs text-gray-500 font-bold mt-1">Approve or reject user recharge requests</p>
            </div>
            <div class="px-4 py-2 bg-yellow-50 text-adminGold rounded-xl text-xs font-bold flex items-center gap-2 border border-yellow-100 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-adminGold animate-pulse"></span>
                Live Tracking
            </div>
        </div>

        <div id="admin-wallet-list" class="space-y-4">
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <i class="fa-solid fa-spinner fa-spin text-3xl text-adminPrimary mb-4"></i>
                <p class="text-gray-500 font-bold">Loading pending requests...</p>
            </div>
        </div>
    </div>
`;

export const setupAdminWalletEvents = () => {
    const walletListEl = document.getElementById('admin-wallet-list');
    const walletRef = ref(db, 'wallet_recharges/');

    const showEmptyState = () => {
        walletListEl.innerHTML = `
            <div class="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400 text-3xl border border-gray-100 shadow-sm">
                    <i class="fa-solid fa-inbox"></i>
                </div>
                <h3 class="text-lg font-black text-gray-800">No Pending Requests</h3>
                <p class="text-gray-500 text-xs font-medium mt-1.5">All wallet recharges have been processed.</p>
            </div>`;
    };

    // Pending Wallet Requests Fetch karna
    onValue(walletRef, async (snapshot) => {
        if (!snapshot.exists()) {
            showEmptyState();
            return;
        }

        let pendingRequests = [];

        // Firebase ka structure: wallet_recharges -> {uid} -> {requestId}
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

        // NAYA LOGIC: Bulletproof Data Fetching
        for (let i = 0; i < pendingRequests.length; i++) {
            const req = pendingRequests[i];
            const userSnapshot = await get(ref(db, `users/${req.uid}`));
            const uData = userSnapshot.exists() ? userSnapshot.val() : {};
            
            // Agar profile proper nahi hai (jaise admin account mein), toh fallback use karega
            req.user = {
                fullName: uData.fullName || 'Admin / Unknown User',
                phone: uData.phone || ''
            };
        }

        // Sort by Date (Sabse naya request sabse upar)
        pendingRequests.sort((a, b) => b.requestDate - a.requestDate);

        // HTML generate karo har ek request ke liye
        walletListEl.innerHTML = pendingRequests.map(req => {
            const phoneStr = req.user.phone;
            const waLink = phoneStr ? `https://wa.me/91${phoneStr}?text=Hello%20${encodeURIComponent(req.user.fullName)},%20regarding%20your%20wallet%20recharge%20request%20of%20Rs.${req.amount}...` : '#';

            return `
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-yellow-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group hover:border-adminPrimary transition-colors">
                <div class="absolute top-0 left-0 w-1.5 h-full bg-adminGold group-hover:bg-adminPrimary transition-colors"></div>
                
                <div class="flex items-center gap-4 w-full md:w-auto pl-2">
                    <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl shrink-0 border border-blue-100">
                        <i class="fa-solid fa-wallet"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <h3 class="font-black text-gray-800 text-base">${req.user.fullName}</h3>
                            <span class="bg-yellow-100 text-yellow-700 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Pending</span>
                        </div>
                        
                        <div class="flex items-center gap-3 mt-1">
                            <p class="text-xs text-gray-500 font-medium"><i class="fa-solid fa-phone mr-1 text-gray-400"></i> ${phoneStr || 'No Number'}</p>
                            ${phoneStr ? `
                            <a href="${waLink}" target="_blank" class="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors active:scale-95">
                                <i class="fa-brands fa-whatsapp"></i> Chat
                            </a>` : ''}
                        </div>
                        
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">${new Date(req.requestDate).toLocaleString('en-IN')}</p>
                    </div>
                </div>
                
                <div class="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                    <div class="text-left md:text-right">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Amount Requested</p>
                        <p class="text-2xl font-black text-adminPrimary">₹${req.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn-reject-wallet px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 rounded-xl text-xs font-bold transition-all" data-uid="${req.uid}" data-id="${req.requestId}">
                            <i class="fa-solid fa-xmark mr-1"></i> Reject
                        </button>
                        <button class="btn-approve-wallet px-5 py-2.5 bg-adminPrimary hover:bg-[#0a4d2c] text-white rounded-xl text-xs font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95" data-uid="${req.uid}" data-id="${req.requestId}" data-amount="${req.amount}">
                            <i class="fa-solid fa-check mr-1"></i> Approve
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        // Events
        document.querySelectorAll('.btn-approve-wallet').forEach(btn => btn.addEventListener('click', handleApprove));
        document.querySelectorAll('.btn-reject-wallet').forEach(btn => btn.addEventListener('click', handleReject));
    });

    // --- APPROVE LOGIC ---
    const handleApprove = async (e) => {
        const btn = e.currentTarget;
        const uid = btn.getAttribute('data-uid');
        const reqId = btn.getAttribute('data-id');
        const amount = parseFloat(btn.getAttribute('data-amount'));

        Swal.fire({
            title: 'Approve Recharge?',
            text: `₹${amount} will be added to the user's wallet.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0F6B3F',
            confirmButtonText: 'Yes, Add Funds'
        }).then(async (result) => {
            if(result.isConfirmed) {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                
                try {
                    const userRef = ref(db, `users/${uid}`);
                    const snapshot = await get(userRef);
                    const currentBalance = snapshot.val()?.walletBalance || 0;

                    const updates = {};
                    updates[`users/${uid}/walletBalance`] = currentBalance + amount;
                    updates[`wallet_recharges/${uid}/${reqId}/status`] = 'approved';

                    await update(ref(db), updates);
                    Swal.fire({icon: 'success', title: 'Funds Added!', timer: 1500, showConfirmButton: false});
                } catch(err) {
                    Swal.fire('Error', 'Could not approve request.', 'error');
                    btn.innerHTML = originalHtml;
                }
            }
        });
    };

    // --- REJECT LOGIC ---
    const handleReject = async (e) => {
        const btn = e.currentTarget;
        const uid = btn.getAttribute('data-uid');
        const reqId = btn.getAttribute('data-id');

        Swal.fire({
            title: 'Reject Request?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Reject'
        }).then(async (result) => {
            if(result.isConfirmed) {
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                
                try {
                    await update(ref(db, `wallet_recharges/${uid}/${reqId}`), { status: 'rejected' });
                    Swal.fire({icon: 'success', title: 'Rejected', timer: 1500, showConfirmButton: false});
                } catch(err) {
                    Swal.fire('Error', 'Could not reject request.', 'error');
                    btn.innerHTML = originalHtml;
                }
            }
        });
    };
};
