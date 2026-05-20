// src/buy-agu.js - Premium Buy AGU Component Module (Live NAV Integrated)
import { auth, db } from './firebase.js';
import { ref, push, set, serverTimestamp, update, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Navigation imports
import { portfolioHTML, setupPortfolioEvents } from './portfolio.js';
import { profileHTML, setupProfileEvents } from './profile.js';
import { historyHTML, setupHistoryEvents } from './history.js';

export const buyAguHTML = `
    <div class="min-h-screen bg-appBg pb-28 font-sans">
        
        <div class="bg-white px-6 py-3 shadow-md rounded-b-3xl flex items-center gap-4 z-50 sticky top-0 w-full backdrop-blur-md bg-white/95">
            <button id="btn-back-dashboard-from-buy" class="text-gray-600 hover:text-appGreen transition-colors flex items-center justify-center p-1.5 active:scale-95">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h2 class="text-lg font-bold text-appText tracking-tight">Buy Growth Units</h2>
        </div>

        <div class="p-5 mt-2 space-y-5">
            
            <div class="bg-gradient-to-r from-[#0F6B3F] to-[#1a9359] rounded-2xl p-5 shadow-md flex justify-between items-center text-white relative overflow-hidden">
                <div class="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <div class="relative z-10">
                    <p class="text-[10px] text-green-200 font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                        <i class="fa-solid fa-wallet"></i> Liquid Wallet
                    </p>
                    <h3 class="text-2xl font-black tracking-tight" id="buy-wallet-balance">₹0</h3>
                </div>
                <button id="btn-buy-add-funds" class="relative z-10 bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-xl backdrop-blur-sm transition-all active:scale-95 border border-white/20 flex items-center justify-center shadow-sm">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </button>
            </div>

            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 space-y-6 relative">
                
                <div class="bg-green-50 border border-green-100 rounded-xl p-4 flex justify-between items-center">
                    <div>
                        <p class="text-[10px] font-bold text-appGreen uppercase tracking-wider mb-1">Live Unit Price</p>
                        <p class="text-sm font-black text-gray-800">1 AGU = <span class="text-appGold">₹<span id="current-agu-price">10.00</span></span></p>
                    </div>
                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-appGold border border-yellow-50">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Investment Amount</label>
                    <div class="relative mt-1.5 flex items-center">
                        <span class="absolute left-4 text-gray-400 font-bold text-lg">₹</span>
                        <input type="number" id="buy-amount" placeholder="Min. 100" class="w-full bg-[#F5F7FA] border border-transparent rounded-xl pl-9 pr-[85px] py-4 outline-none text-[#1C1C1C] font-black text-xl focus:border-[#0F6B3F] focus:bg-white transition-all placeholder:font-medium placeholder:text-base placeholder:text-gray-400">
                        
                        <div class="absolute right-2 bg-yellow-50/80 border border-yellow-100 px-3 py-1.5 rounded-lg flex flex-col items-end pointer-events-none transition-all" id="unit-badge">
                            <span class="text-sm font-black text-[#D4A017] leading-none" id="receive-agu-units">0.00</span>
                            <span class="text-[7px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Units</span>
                        </div>
                    </div>
                </div>

                <button id="btn-submit-buy-agu" class="w-full bg-gradient-to-r from-[#0F6B3F] to-[#168953] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 hover:opacity-90 transition-opacity active:scale-95 flex justify-center items-center gap-2 mt-2">
                    <i class="fa-solid fa-bolt"></i> Pay Securely
                </button>
            </div>
            
            <p class="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <i class="fa-solid fa-shield-halved"></i> 100% Safe & Secure
            </p>
        </div>

        <div class="fixed bottom-0 left-0 w-full max-w-md mx-auto bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.03)] px-5 py-3 flex justify-between items-end z-50 pb-4" style="left: 50%; transform: translateX(-50%);">
            <button id="btn-buy-footer-home" class="flex flex-col items-center gap-1 text-gray-400 hover:text-appGreen transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span class="text-[9px] font-bold">Home</span>
            </button>
            <button id="btn-buy-footer-portfolio" class="flex flex-col items-center gap-1 text-gray-400 hover:text-appGreen transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <span class="text-[9px] font-bold">Portfolio</span>
            </button>
            
            <div class="relative -top-4 pointer-events-none">
                <button class="bg-gradient-to-br from-[#0F6B3F] to-[#16A34A] text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-[0_8px_15px_rgba(20,83,45,0.3)] border-4 border-[#F3F5F7]">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>

            <button id="btn-buy-footer-history" class="flex flex-col items-center gap-1 text-gray-400 hover:text-appGreen transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span class="text-[9px] font-bold">History</span>
            </button>
            <button id="btn-buy-footer-profile" class="flex flex-col items-center gap-1 text-gray-400 hover:text-appGreen transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span class="text-[9px] font-bold">Profile</span>
            </button>
        </div>

    </div>
`;

export const setupBuyAguEvents = (navigateToCallback, dashboardHTML, setupDashboardEvents) => {
    
    // Footer Navigation Logic
    document.getElementById('btn-back-dashboard-from-buy').addEventListener('click', () => {
        navigateToCallback(dashboardHTML, setupDashboardEvents);
    });
    
    document.getElementById('btn-buy-footer-home').addEventListener('click', () => {
        navigateToCallback(dashboardHTML, setupDashboardEvents);
    });

    document.getElementById('btn-buy-footer-portfolio').addEventListener('click', () => {
        navigateToCallback(portfolioHTML, () => setupPortfolioEvents(navigateToCallback, dashboardHTML, setupDashboardEvents, null, null, profileHTML, setupProfileEvents));
    });

    document.getElementById('btn-buy-footer-history').addEventListener('click', () => {
        navigateToCallback(historyHTML, () => setupHistoryEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
    });

    document.getElementById('btn-buy-footer-profile').addEventListener('click', () => {
        navigateToCallback(profileHTML, () => setupProfileEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
    });

    const user = auth.currentUser;
    if(!user) return;

    let currentWalletBalance = 0;
    let currentAguPrice = 10; // Default price
    
    const userRef = ref(db, 'users/' + user.uid);
    const livePriceRef = ref(db, 'platform_settings/agu_price'); // NAYA: Live Unit Price Ref
    
    // Live Wallet Balance Fetch
    onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
            currentWalletBalance = snapshot.val().walletBalance || 0;
            const walletEl = document.getElementById('buy-wallet-balance');
            if (walletEl) walletEl.innerText = "₹" + currentWalletBalance.toLocaleString('en-IN', {maximumFractionDigits: 2});
        }
    });

    const amountInput = document.getElementById('buy-amount');
    const receiveUnitsText = document.getElementById('receive-agu-units');

    // 🚀 NAYA: Live Price Fetching & Sync
    onValue(livePriceRef, (snapshot) => {
        if (snapshot.exists()) {
            currentAguPrice = parseFloat(snapshot.val());
        } else {
            currentAguPrice = 10;
        }
        
        // Update UI
        const priceEl = document.getElementById('current-agu-price');
        if (priceEl) priceEl.innerText = currentAguPrice.toFixed(3);
        
        // Agar user ne pehle se hi koi amount type kar rakha hai, toh uska unit live recalculate karo
        if (amountInput.value) {
            const amt = parseFloat(amountInput.value) || 0;
            const units = amt / currentAguPrice; 
            receiveUnitsText.innerText = units > 0 ? units.toFixed(2) : "0.00";
        }
    });

    // Plus (+) Button Par Click - Portfolio Navigation (For Add Funds)
    const btnAddFunds = document.getElementById('btn-buy-add-funds');
    if (btnAddFunds) {
        btnAddFunds.addEventListener('click', () => {
            navigateToCallback(portfolioHTML, () => setupPortfolioEvents(navigateToCallback, dashboardHTML, setupDashboardEvents, null, null, profileHTML, setupProfileEvents));
        });
    }

    // Calculation Logic
    amountInput.addEventListener('input', () => {
        const amt = parseFloat(amountInput.value) || 0;
        const units = amt / currentAguPrice; // Dynamic Price used here
        receiveUnitsText.innerText = units > 0 ? units.toFixed(2) : "0.00";
    });

    // Submit Action Logic
    document.getElementById('btn-submit-buy-agu').addEventListener('click', async () => {
        const amt = parseFloat(amountInput.value);

        if(!amt || amt < 100) {
            Swal.fire({icon: 'warning', title: 'Invalid Amount', text: 'Minimum purchase amount is ₹100', confirmButtonColor: '#0F6B3F'});
            return;
        }

        const btnSubmit = document.getElementById('btn-submit-buy-agu');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Verifying...';

        try {
            // Balance Check (From Live Variable)
            if (currentWalletBalance < amt) {
                Swal.fire({
                    icon: 'error', 
                    title: 'Insufficient Funds', 
                    text: `Your wallet balance is ₹${currentWalletBalance.toFixed(2)}. Please click the '+' icon above to add funds.`, 
                    confirmButtonColor: '#0F6B3F'
                });
                btnSubmit.innerHTML = originalText;
                return;
            }

            // Confirmation Popup
            Swal.fire({
                title: 'Confirm Purchase',
                text: `₹${amt} will be instantly deducted from your Wallet Balance at the rate of ₹${currentAguPrice.toFixed(3)}/Unit.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Confirm & Pay',
                confirmButtonColor: '#0F6B3F',
                cancelButtonColor: '#9CA3AF',
                allowOutsideClick: false
            }).then(async (result) => {
                if (result.isConfirmed) {
                    Swal.fire({ title: 'Processing...', text: 'Securing your AGU units.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

                    try {
                        // 1. Wallet se paise katna
                        await update(userRef, { walletBalance: currentWalletBalance - amt });

                        // 2. Database me APPROVED transaction save karna
                        const calculatedUnits = amt / currentAguPrice; // Dynamic Price stored in database
                        const purchasesRef = ref(db, 'agu_purchases/' + user.uid);
                        const newPurchaseRef = push(purchasesRef); 

                        await set(newPurchaseRef, {
                            purchaseId: newPurchaseRef.key,
                            amountPaid: amt,
                            aguReceived: calculatedUnits,
                            rateApplied: currentAguPrice, // Saved historical NAV rate
                            status: 'approved', 
                            purchaseDate: serverTimestamp()
                        });

                        Swal.fire({
                            icon: 'success', 
                            title: 'Purchase Successful!', 
                            text: `You have instantly received ${calculatedUnits.toFixed(2)} AGU.`, 
                            confirmButtonColor: '#0F6B3F'
                        }).then(() => {
                            navigateToCallback(dashboardHTML, setupDashboardEvents);
                        });

                    } catch (error) {
                        Swal.fire({icon: 'error', title: 'Failed', text: 'Transaction failed. Please try again.', confirmButtonColor: '#0F6B3F'});
                        btnSubmit.innerHTML = originalText;
                    }
                } else {
                    btnSubmit.innerHTML = originalText;
                }
            });
        } catch (error) {
            Swal.fire({icon: 'error', title: 'Connection Error', text: 'Could not fetch network details.', confirmButtonColor: '#0F6B3F'});
            btnSubmit.innerHTML = originalText;
        } 
    });
};
