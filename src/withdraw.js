// withdraw.js - Withdraw Component Module with UPI, Bank & Cash Transfer
import { auth, db } from './firebase.js';
import { ref, push, set, serverTimestamp, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

export const withdrawHTML = `
    <div class="min-h-screen bg-appBg pb-24">
        <div class="bg-white px-6 py-5 shadow-sm rounded-b-3xl flex items-center gap-4 z-10 relative">
            <button id="btn-back-dashboard-from-withdraw" class="text-gray-600 hover:text-appGreen transition-colors flex items-center justify-center p-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h2 class="text-lg font-bold text-appText">Withdraw Funds</h2>
        </div>

        <div class="p-6">
            <div class="premium-card p-6 space-y-6 bg-white rounded-3xl shadow-sm border border-gray-50">

                <div class="bg-gradient-to-br from-green-50 to-emerald-50/30 border border-green-100 rounded-2xl p-4 flex justify-between items-center mb-2">
                    <div>
                        <p class="text-[10px] font-bold text-appGreen uppercase tracking-wider mb-1">Available Wallet Balance</p>
                        <h3 class="text-2xl font-black text-appText tracking-tight" id="withdraw-wallet-balance">₹0</h3>
                    </div>
                    <div class="w-10 h-10 bg-green-100/60 rounded-xl flex items-center justify-center text-appGreen">
                        <i class="fa-solid fa-wallet text-xl"></i>
                    </div>
                </div>

                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Withdrawal Amount (₹)</label>
                    <input type="number" id="withdraw-amount" placeholder="Minimum ₹100" class="mt-1 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none text-appText font-bold focus:border-appGreen focus:bg-white transition-all">
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 ml-1" id="min-withdraw-hint">Minimum Withdrawal: ₹100</p>
                </div>

                <div class="space-y-3">
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Select Payout Method</label>
                    
                    <div class="flex flex-col gap-3">
                        <label class="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-all select-none">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm"><i class="fa-brands fa-google-pay text-lg"></i></div>
                                <div>
                                    <p class="text-sm font-bold text-gray-800">UPI Transfer</p>
                                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5" id="withdraw-upi-text">Not Setup</p>
                                </div>
                            </div>
                            <input type="radio" name="payout-method" value="UPI" class="w-4 h-4 text-appGreen focus:ring-appGreen accent-appGreen">
                        </label>

                        <label class="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-all select-none">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm"><i class="fa-solid fa-building-columns text-sm"></i></div>
                                <div>
                                    <p class="text-sm font-bold text-gray-800">Bank Transfer</p>
                                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5" id="withdraw-bank-text">Not Setup</p>
                                </div>
                            </div>
                            <input type="radio" name="payout-method" value="BANK" class="w-4 h-4 text-appGreen focus:ring-appGreen accent-appGreen">
                        </label>

                        <label class="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-all select-none relative group">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm"><i class="fa-solid fa-money-bill-wave text-sm"></i></div>
                                <div>
                                    <p class="text-sm font-bold text-gray-800">Cash Transfer</p>
                                    <p class="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">AMP Office</p>
                                </div>
                            </div>
                            <input type="radio" name="payout-method" value="CASH" class="w-4 h-4 text-appGreen focus:ring-appGreen accent-appGreen">
                        </label>
                    </div>
                </div>

                <div id="cash-info-banner" class="hidden bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 flex gap-2.5 items-start text-blue-700 transition-all duration-300">
                    <i class="fa-solid fa-circle-info text-sm mt-0.5 shrink-0"></i>
                    <p class="text-[11px] font-semibold leading-relaxed">Cash Recived karne ke liye aapko khud AMP office aana padega.</p>
                </div>

                <button id="btn-submit-withdraw" class="w-full bg-appGreen text-white font-bold py-4 rounded-xl shadow-md shadow-green-900/10 hover:bg-green-800 transition-all active:scale-95 mt-2 flex items-center justify-center gap-2">
                    Request Payout
                </button>
            </div>
        </div>
    </div>
`;

export const setupWithdrawEvents = (navigateToCallback, dashboardHTML, setupDashboardEvents) => {
    document.getElementById('btn-back-dashboard-from-withdraw').addEventListener('click', () => {
        navigateToCallback(dashboardHTML, setupDashboardEvents);
    });

    const user = auth.currentUser;
    if(!user) return;

    let savedUPI = "";
    let savedBankText = "";
    let currentWalletBalance = 0; 
    let globalMinWithdraw = 100;

    const userRef = ref(db, 'users/' + user.uid);
    const withdrawRef = ref(db, 'withdrawals/' + user.uid);
    const settingsRef = ref(db, 'platform_settings');

    // Fetch dynamic minimum withdraw limit from Admin Settings
    onValue(settingsRef, (snapshot) => {
        if (snapshot.exists() && snapshot.val().minWithdraw) {
            globalMinWithdraw = snapshot.val().minWithdraw;
            
            const amtInput = document.getElementById('withdraw-amount');
            const hintText = document.getElementById('min-withdraw-hint');
            if(amtInput) amtInput.placeholder = `Minimum ₹${globalMinWithdraw}`;
            if(hintText) hintText.innerText = `Minimum Withdrawal: ₹${globalMinWithdraw}`;
        }
    });

    // Fetch User Profile details (UPI, Bank, Balance)
    onValue(userRef, (snapshot) => {
        if(snapshot.exists()) {
            const data = snapshot.val();
            
            currentWalletBalance = data.walletBalance || 0;
            const balEl = document.getElementById('withdraw-wallet-balance');
            if(balEl) balEl.innerText = "₹" + currentWalletBalance.toLocaleString('en-IN');

            if(data.upiId) {
                savedUPI = data.upiId;
                const upiText = document.getElementById('withdraw-upi-text');
                if(upiText) upiText.innerText = savedUPI;
            }
            if(data.bankDetails && data.bankDetails.acc) {
                savedBankText = `A/C: ${data.bankDetails.acc} | IFSC: ${data.bankDetails.ifsc}`;
                const bankText = document.getElementById('withdraw-bank-text');
                if(bankText) bankText.innerText = savedBankText;
            }
        }
    });

    // NAYA: Radio change listeners to dynamically toggle the Information Banner
    const radioButtons = document.querySelectorAll('input[name="payout-method"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const infoBanner = document.getElementById('cash-info-banner');
            if (infoBanner) {
                if (e.target.value === 'CASH') {
                    infoBanner.classList.remove('hidden');
                } else {
                    infoBanner.classList.add('hidden');
                }
            }
        });
    });

    // Request Submission Handling
    document.getElementById('btn-submit-withdraw').addEventListener('click', async () => {
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        
        if(!amount || amount < globalMinWithdraw) {
            Swal.fire({icon: 'warning', title: 'Invalid Amount', text: `Minimum withdrawal amount is ₹${globalMinWithdraw}`, confirmButtonColor: '#14532D'});
            return;
        }

        const methodEl = document.querySelector('input[name="payout-method"]:checked');
        const method = methodEl ? methodEl.value : null;

        if(!method) {
            Swal.fire({icon: 'warning', title: 'Select Method', text: 'Please select a payout method (UPI, Bank, or Cash).', confirmButtonColor: '#14532D'});
            return;
        }

        let details = "";
        if (method === 'UPI') {
            if(!savedUPI) { Swal.fire('UPI Not Setup', 'Please setup UPI in your Profile first.', 'error'); return; }
            details = savedUPI;
        } else if (method === 'BANK') {
            if(!savedBankText) { Swal.fire('Bank Not Setup', 'Please setup Bank Details in your Profile first.', 'error'); return; }
            details = savedBankText;
        } else if (method === 'CASH') {
            // Cash Transfer has fixed text description
            details = "Office / Bhandar Collect";
        }

        if (amount > currentWalletBalance) {
            Swal.fire({
                icon: 'error', 
                title: 'Insufficient Balance', 
                text: `You only have ₹${currentWalletBalance.toLocaleString('en-IN')} in your wallet.`, 
                confirmButtonColor: '#14532D'
            });
            return;
        }

        const btnSubmit = document.getElementById('btn-submit-withdraw');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Processing...';

        try {
            // Deduct from wallet atomically
            await update(userRef, { walletBalance: currentWalletBalance - amount });

            const newWithdrawRef = push(withdrawRef);
            await set(newWithdrawRef, {
                withdrawalId: newWithdrawRef.key,
                amount: amount,
                method: method,
                payoutDetails: details,
                status: 'pending',
                requestDate: serverTimestamp()
            });

            // Hide info banner after reset
            const infoBanner = document.getElementById('cash-info-banner');
            if (infoBanner) infoBanner.classList.add('hidden');

            Swal.fire({
                icon: 'success', 
                title: 'Request Submitted!', 
                text: `₹${amount} has been deducted from your wallet. Your ${method} withdrawal request is pending approval.`, 
                confirmButtonColor: '#14532D'
            }).then(() => {
                document.getElementById('withdraw-amount').value = '';
                if(methodEl) methodEl.checked = false;
            });

        } catch (error) {
            Swal.fire({icon: 'error', title: 'Failed', text: 'Could not process request. Please try again.', confirmButtonColor: '#14532D'});
        } finally {
            btnSubmit.innerHTML = originalText;
        }
    });
};