// src/admin-users.js
import { db } from './firebase.js';
// NAYA: 'remove' import kiya gaya hai user delete karne ke liye
import { ref, onValue, update, get, push, set, serverTimestamp, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

export const adminUsersHTML = `
    <div class="space-y-6 w-full max-w-6xl mx-auto pb-10">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-black text-gray-800">Users & KYC Management</h2>
                <p class="text-xs text-gray-500 font-bold mt-1">Manage platform users, update balances, edit profiles and control access</p>
            </div>
            
            <div class="flex gap-2 w-full md:w-auto">
                <input type="text" id="user-search-input" placeholder="Search by name or phone..." class="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium outline-none focus:border-adminPrimary transition-colors w-full md:w-64 shadow-sm">
                <select id="user-kyc-filter" class="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-adminPrimary transition-colors shadow-sm">
                    <option value="all">All Users</option>
                    <option value="reviewing">🔄 KYC Reviewing</option>
                    <option value="approved">✅ KYC Approved</option>
                    <option value="pending">⏳ KYC Pending</option>
                </select>
            </div>
        </div>

        <div id="admin-users-list" class="space-y-4">
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <i class="fa-solid fa-spinner fa-spin text-3xl text-adminPrimary mb-4"></i>
                <p class="text-gray-500 font-bold">Loading users data...</p>
            </div>
        </div>
    </div>
`;

export const setupAdminUsersEvents = () => {
    const usersListEl = document.getElementById('admin-users-list');
    const searchInput = document.getElementById('user-search-input');
    const kycFilter = document.getElementById('user-kyc-filter');
    const usersRef = ref(db, 'users/');

    let allUsers = [];

    const renderUsersList = (usersToRender) => {
        if(usersToRender.length === 0) {
            usersListEl.innerHTML = `
                <div class="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400 text-2xl border border-gray-100 shadow-sm">
                        <i class="fa-solid fa-users-slash"></i>
                    </div>
                    <h3 class="text-lg font-black text-gray-800">No Users Found</h3>
                    <p class="text-gray-500 text-xs font-medium mt-1.5">No users matched your search or filter criteria.</p>
                </div>`;
            return;
        }

        usersListEl.innerHTML = usersToRender.map(user => {
            const kyc = user.kycStatus || 'pending';
            const isBlocked = user.isBlocked === true; // Block status check
            let kycBadge = '';
            let kycBoxHtml = '';

            if (kyc === 'approved') {
                kycBadge = '<span class="bg-green-100 text-green-700 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Verified</span>';
            } else if (kyc === 'reviewing') {
                kycBadge = '<span class="bg-blue-100 text-blue-700 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm animate-pulse">Reviewing</span>';
                kycBoxHtml = `
                    <div class="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div class="space-y-1">
                            <p class="text-xs font-bold text-gray-700"><span class="text-gray-400 uppercase text-[10px] tracking-wider mr-1">Aadhaar:</span> ${user.aadharNo || 'N/A'}</p>
                            <p class="text-xs font-bold text-gray-700"><span class="text-gray-400 uppercase text-[10px] tracking-wider mr-1">PAN:</span> ${user.panNo || 'N/A'}</p>
                        </div>
                        <div class="flex gap-2 w-full sm:w-auto justify-end">
                            <button class="btn-reject-kyc px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 rounded-lg text-[11px] font-bold transition-all" data-uid="${user.uid}">
                                <i class="fa-solid fa-xmark mr-1"></i> Reject
                            </button>
                            <button class="btn-approve-kyc px-3 py-1.5 bg-adminPrimary text-white hover:bg-[#0a4d2c] rounded-lg text-[11px] font-bold shadow-md transition-all" data-uid="${user.uid}">
                                <i class="fa-solid fa-check mr-1"></i> Approve
                            </button>
                        </div>
                    </div>
                `;
            } else {
                kycBadge = '<span class="bg-gray-100 text-gray-500 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Pending</span>';
            }

            // Blocked Badge
            const blockBadge = isBlocked ? '<span class="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm ml-1">Blocked</span>' : '';

            const phoneStr = user.phone || '';
            const waLink = phoneStr ? `https://wa.me/91${phoneStr}` : '#';
            const walletBal = user.walletBalance || 0;
            const totalRet = user.totalReturns || 0;

            let photoHtml = user.photoURL 
                ? `<img src="${user.photoURL}" class="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm shrink-0 ${isBlocked ? 'grayscale opacity-50' : ''}">`
                : `<div class="w-12 h-12 rounded-full ${isBlocked ? 'bg-red-100 text-red-500' : 'bg-adminSidebar text-white'} flex items-center justify-center font-black text-base border border-gray-100 shadow-sm shrink-0">${(user.fullName || 'U').charAt(0).toUpperCase()}</div>`;

            return `
                <div class="bg-white p-5 rounded-2xl shadow-sm border ${isBlocked ? 'border-red-200' : 'border-gray-100'} flex flex-col gap-4 relative overflow-hidden group hover:border-gray-300 transition-colors">
                    ${isBlocked ? '<div class="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>' : ''}
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        
                        <div class="flex items-center gap-4 pl-1">
                            ${photoHtml}
                            <div>
                                <div class="flex items-center gap-1 flex-wrap">
                                    <h3 class="font-black ${isBlocked ? 'text-gray-400 line-through' : 'text-gray-800'} text-base tracking-tight">${user.fullName || 'No Name'}</h3>
                                    ${kycBadge}
                                    ${blockBadge}
                                </div>
                                <p class="text-xs text-gray-400 font-semibold mt-0.5">${user.email || 'No Email'}</p>
                                
                                <div class="flex items-center gap-3 mt-1.5">
                                    <p class="text-xs text-gray-500 font-bold"><i class="fa-solid fa-phone mr-1 text-gray-300"></i> ${phoneStr || 'N/A'}</p>
                                    ${phoneStr && !isBlocked ? `
                                    <a href="${waLink}" target="_blank" class="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 transition-colors active:scale-95">
                                        <i class="fa-brands fa-whatsapp"></i> Chat
                                    </a>` : ''}
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col items-start sm:items-end justify-between w-full sm:w-auto gap-3 border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0">
                            <div class="flex gap-4 sm:text-right">
                                <div>
                                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Wallet Balance</p>
                                    <p class="text-sm font-black text-adminPrimary">₹${walletBal.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Returns</p>
                                    <p class="text-sm font-black text-adminGold">₹${totalRet.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            
                            <div class="flex flex-wrap items-center gap-2 mt-2 w-full sm:w-auto justify-end">
                                <button class="btn-edit-user px-2.5 py-1.5 bg-gray-50 text-blue-600 hover:bg-blue-50 hover:border-blue-200 border border-gray-100 rounded text-[10px] font-bold transition-all" data-uid="${user.uid}" data-name="${user.fullName || ''}" data-phone="${user.phone || ''}">
                                    <i class="fa-solid fa-user-pen"></i> Edit
                                </button>

                                <button class="btn-toggle-status px-2.5 py-1.5 ${isBlocked ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-gray-50 text-orange-500 border-gray-100 hover:bg-orange-50 hover:border-orange-200'} border rounded text-[10px] font-bold transition-all" data-uid="${user.uid}" data-blocked="${isBlocked}">
                                    <i class="fa-solid ${isBlocked ? 'fa-unlock' : 'fa-ban'}"></i> ${isBlocked ? 'Unblock' : 'Block'}
                                </button>

                                <button class="btn-delete-user px-2.5 py-1.5 bg-gray-50 text-red-500 hover:bg-red-50 hover:border-red-200 border border-gray-100 rounded text-[10px] font-bold transition-all" data-uid="${user.uid}">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>

                                <button class="btn-manage-funds px-3 py-1.5 bg-adminPrimary text-white hover:bg-[#0a4d2c] rounded text-[10px] font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1" data-uid="${user.uid}" data-name="${user.fullName || 'User'}" data-wallet="${walletBal}" data-returns="${totalRet}">
                                    <i class="fa-solid fa-coins"></i> Funds
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    ${kycBoxHtml}
                </div>
            `;
        }).join('');

        // Attach logic events
        document.querySelectorAll('.btn-manage-funds').forEach(btn => btn.addEventListener('click', handleManageFunds));
        document.querySelectorAll('.btn-approve-kyc').forEach(btn => btn.addEventListener('click', handleApproveKyc));
        document.querySelectorAll('.btn-reject-kyc').forEach(btn => btn.addEventListener('click', handleRejectKyc));
        
        // NAYA EVENTS Attach karna
        document.querySelectorAll('.btn-edit-user').forEach(btn => btn.addEventListener('click', handleEditUser));
        document.querySelectorAll('.btn-toggle-status').forEach(btn => btn.addEventListener('click', handleToggleStatus));
        document.querySelectorAll('.btn-delete-user').forEach(btn => btn.addEventListener('click', handleDeleteUser));
    };

    const filterAndSearchUsers = () => {
        const queryStr = searchInput.value.toLowerCase().trim();
        const filterVal = kycFilter.value;

        let filtered = allUsers;

        if (filterVal !== 'all') {
            filtered = filtered.filter(u => (u.kycStatus || 'pending') === filterVal);
        }

        if (queryStr) {
            filtered = filtered.filter(u => 
                (u.fullName || '').toLowerCase().includes(queryStr) || 
                (u.phone || '').includes(queryStr) ||
                (u.email || '').toLowerCase().includes(queryStr)
            );
        }

        renderUsersList(filtered);
    };

    // Firebase database observer
    onValue(usersRef, (snapshot) => {
        if(!snapshot.exists()) {
            allUsers = [];
            renderUsersList([]);
            return;
        }

        allUsers = [];
        snapshot.forEach(child => {
            if (child.key !== "2OcCMmUcVORQyXMMXuk94rLwP1G2") {
                allUsers.push({ uid: child.key, ...child.val() });
            }
        });

        filterAndSearchUsers();
    });

    searchInput.addEventListener('input', filterAndSearchUsers);
    kycFilter.addEventListener('change', filterAndSearchUsers);

    // --- NAYA: EDIT USER PROFILE LOGIC ---
    function handleEditUser(e) {
        const btn = e.currentTarget;
        const uid = btn.getAttribute('data-uid');
        const currentName = btn.getAttribute('data-name');
        const currentPhone = btn.getAttribute('data-phone');

        Swal.fire({
            title: 'Edit User Profile',
            html: `
                <div class="space-y-4 text-left mt-4">
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Full Name</label>
                        <input type="text" id="edit-name" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all" value="${currentName}">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Phone Number</label>
                        <input type="tel" id="edit-phone" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all" value="${currentPhone}">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Details',
            confirmButtonColor: '#2563EB',
            preConfirm: () => {
                const nameInput = document.getElementById('edit-name').value.trim();
                const phoneInput = document.getElementById('edit-phone').value.trim();
                if(!nameInput) {
                    Swal.showValidationMessage('Name cannot be empty');
                    return false;
                }
                return { fullName: nameInput, phone: phoneInput };
            }
        }).then(async (result) => {
            if(result.isConfirmed) {
                try {
                    await update(ref(db, `users/${uid}`), result.value);
                    Swal.fire({icon: 'success', title: 'Profile Updated', timer: 1500, showConfirmButton: false});
                } catch(err) {
                    Swal.fire('Error', 'Failed to update profile.', 'error');
                }
            }
        });
    }

    // --- NAYA: BLOCK / UNBLOCK LOGIC ---
    function handleToggleStatus(e) {
        const btn = e.currentTarget;
        const uid = btn.getAttribute('data-uid');
        const isBlocked = btn.getAttribute('data-blocked') === 'true';
        
        const actionText = isBlocked ? 'Unblock' : 'Block';
        const confirmColor = isBlocked ? '#16A34A' : '#F97316'; // Green for Unblock, Orange for Block

        Swal.fire({
            title: `${actionText} User?`,
            text: isBlocked ? "This user will regain access to the platform." : "This user will be restricted from accessing their account.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: confirmColor,
            confirmButtonText: `Yes, ${actionText}`
        }).then(async (result) => {
            if(result.isConfirmed) {
                try {
                    await update(ref(db, `users/${uid}`), { isBlocked: !isBlocked });
                    Swal.fire({icon: 'success', title: `User ${actionText}ed`, timer: 1500, showConfirmButton: false});
                } catch(err) {
                    Swal.fire('Error', `Failed to ${actionText.toLowerCase()} user.`, 'error');
                }
            }
        });
    }

    // --- NAYA: DELETE USER LOGIC ---
    function handleDeleteUser(e) {
        const uid = e.currentTarget.getAttribute('data-uid');

        Swal.fire({
            title: 'Delete User?',
            text: "Warning: This permanently removes the user's data from the database. This action cannot be undone.",
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Yes, Delete Permanently'
        }).then(async (result) => {
            if(result.isConfirmed) {
                try {
                    await remove(ref(db, `users/${uid}`));
                    Swal.fire({icon: 'success', title: 'Deleted', text: 'User removed from database.', timer: 1500, showConfirmButton: false});
                } catch(err) {
                    Swal.fire('Error', 'Failed to delete user.', 'error');
                }
            }
        });
    }

    // --- SMART MANAGE FUNDS LOGIC (With Auto Transaction History) ---
    function handleManageFunds(e) {
        const btn = e.currentTarget;
        const uid = btn.getAttribute('data-uid');
        const name = btn.getAttribute('data-name');
        const currentWallet = parseFloat(btn.getAttribute('data-wallet')) || 0;
        const currentReturns = parseFloat(btn.getAttribute('data-returns')) || 0;

        Swal.fire({
            title: `Manage Funds - ${name}`,
            html: `
                <div class="space-y-4 text-left mt-4">
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Wallet Balance (₹)</label>
                        <input type="number" id="swal-edit-wallet" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-adminPrimary transition-all" value="${currentWallet}">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Total Estimated Returns (₹)</label>
                        <input type="number" id="swal-edit-returns" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-adminPrimary transition-all" value="${currentReturns}">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Update Details',
            confirmButtonColor: '#0F6B3F',
            preConfirm: () => {
                const walletInput = document.getElementById('swal-edit-wallet').value;
                const returnsInput = document.getElementById('swal-edit-returns').value;
                if(walletInput === '' || returnsInput === '') {
                    Swal.showValidationMessage('Fields cannot be empty');
                    return false;
                }
                return {
                    walletBalance: parseFloat(walletInput),
                    totalReturns: parseFloat(returnsInput)
                };
            }
        }).then(async (result) => {
            if(result.isConfirmed) {
                try {
                    const newWalletBal = result.value.walletBalance;
                    const amountDifference = newWalletBal - currentWallet;

                    await update(ref(db, `users/${uid}`), result.value);

                    if (amountDifference > 0) {
                        const walletRechargeRef = ref(db, `wallet_recharges/${uid}`);
                        const newReqRef = push(walletRechargeRef);
                        await set(newReqRef, {
                            requestId: newReqRef.key,
                            amount: amountDifference,
                            status: 'approved', 
                            requestDate: serverTimestamp(),
                            note: 'Added by Admin Manually'
                        });
                    }

                    Swal.fire({icon: 'success', title: 'Updated Successfully', timer: 1500, showConfirmButton: false});
                } catch(err) {
                    Swal.fire('Error', 'Failed to update user financials.', 'error');
                }
            }
        });
    }

    // --- APPROVE KYC LOGIC ---
    function handleApproveKyc(e) {
        const uid = e.currentTarget.getAttribute('data-uid');
        Swal.fire({
            title: 'Approve KYC Verification?',
            text: "This will verify the user as a trusted AGU member.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0F6B3F',
            confirmButtonText: 'Yes, Approve'
        }).then(async (result) => {
            if(result.isConfirmed) {
                try {
                    await update(ref(db, `users/${uid}`), { kycStatus: 'approved' });
                    Swal.fire({icon: 'success', title: 'KYC Approved!', timer: 1500, showConfirmButton: false});
                } catch(err) {
                    Swal.fire('Error', 'Failed to approve KYC.', 'error');
                }
            }
        });
    }

    // --- REJECT KYC LOGIC ---
    function handleRejectKyc(e) {
        const uid = e.currentTarget.getAttribute('data-uid');
        Swal.fire({
            title: 'Reject KYC Submission?',
            text: "User will need to submit their Aadhar and PAN card again.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Reject'
        }).then(async (result) => {
            if(result.isConfirmed) {
                try {
                    await update(ref(db, `users/${uid}`), { kycStatus: 'pending', aadharNo: null, panNo: null });
                    Swal.fire({icon: 'success', title: 'KYC Rejected', timer: 1500, showConfirmButton: false});
                } catch(err) {
                    Swal.fire('Error', 'Failed to reject KYC.', 'error');
                }
            }
        });
    }
};
