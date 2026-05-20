// portfolio.js - Portfolio Component Module with Asset Liquidation
import { auth, db } from './firebase.js';
import { ref, onValue, push, set, serverTimestamp, update, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { buyAguHTML, setupBuyAguEvents } from './buy-agu.js'; 
import { historyHTML, setupHistoryEvents } from './history.js';
// NAYA: Withdraw module ko navigation ke liye import kiya gaya
import { withdrawHTML, setupWithdrawEvents } from './withdraw.js';

export const portfolioHTML = `
        <div class="min-h-screen bg-appBg pb-24 font-sans">
        <div class="bg-white px-6 py-3 shadow-md rounded-b-3xl flex items-center gap-4 z-50 sticky top-0 w-full backdrop-blur-md bg-white/95">
            <button id="btn-back-dashboard-from-portfolio" class="text-gray-600 hover:text-appGreen transition-colors flex items-center justify-center p-1.5 active:scale-95">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h2 class="text-lg font-bold text-appText">My Portfolio</h2>
        </div>

        <div class="p-6 space-y-6">
            <div class="bg-gradient-to-br from-appGreen to-[#0a3319] rounded-3xl p-6 shadow-lg relative overflow-hidden">
                <img src="public/images/logo.png" class="absolute -right-10 -bottom-10 w-40 h-40 opacity-10 object-contain pointer-events-none">
                
                             <div class="flex justify-between items-start mb-6 z-10">
                    <div>
                        <p class="text-[9px] text-green-200 font-bold uppercase tracking-wider mb-0.5">Total Investment</p>
                        <h2 class="text-3xl font-black text-white tracking-tight" id="port-invested-value">₹0</h2>
                        <p class="text-[10px] text-green-100 mt-0.5"><span id="port-invested-units">0.00</span> Units</p>
                    </div>
                    <div class="w-px h-12 bg-white/20 mx-2 mt-1"></div>
                    <div class="text-right">
                        <p class="text-[9px] text-green-200 font-bold uppercase tracking-wider mb-0.5">Current Value</p>
                        <h2 class="text-3xl font-black text-appGold tracking-tight" id="port-current-value">₹0</h2>
                        <p class="text-[10px] text-appGold mt-0.5"><span id="port-current-units">0.00</span> Units</p>
                    </div>
                </div>
                
                <div class="flex justify-between items-center border-t border-white/20 pt-4">
                    <div>
                        <p class="text-[9px] font-bold text-green-200 uppercase tracking-wider mb-0.5">Total Returns</p>
                        <p class="text-md font-bold text-white" id="port-returns-value">+ ₹0</p>
                    </div>
                    <button id="btn-port-buy-agu" class="bg-white text-appGreen text-xs font-black px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 hover:bg-green-50">
                        <i class="fa-solid fa-plus"></i> Buy AGU
                    </button>
                </div>

            </div>

            <div class="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 flex flex-col justify-between h-34 relative overflow-hidden">
                <div class="flex justify-between items-start z-10">
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Liquid Wallet</p>
                        <h3 class="text-3xl font-black text-appText mt-1" id="port-wallet-balance">₹0</h3>
                    </div>
                    <i class="fa-solid fa-wallet text-2xl text-blue-500/20"></i>
                </div>
                <div class="flex gap-3 z-10 mt-3">
                    <button id="btn-recharge-wallet" class="flex-1 bg-appGreen text-white text-[11px] font-black py-2.5 rounded-xl shadow-md active:scale-95 transition-all">Add Money</button>
                    <button id="btn-port-withdraw" class="flex-1 bg-white border border-gray-200 text-gray-700 text-[11px] font-black py-2.5 rounded-xl active:scale-95 transition-all">Withdraw</button>
                </div>
            </div>

          
            <div class="space-y-4 pt-2">
                <div class="flex justify-between items-center px-1">
                    <h3 class="text-sm font-bold text-appText uppercase tracking-wider">Liquidation Center</h3>
                    <span class="px-2 py-1 bg-yellow-50 text-[9px] font-black text-appGold rounded border border-yellow-100 uppercase tracking-wide">Live Exit</span>
                </div>
                <div id="liquidation-center-list" class="space-y-3">
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center">
                        <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
                            <i class="fa-solid fa-box-open text-xl"></i>
                        </div>
                        <p class="text-gray-400 text-sm font-medium">No assets available for liquidation yet.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="fixed bottom-0 left-0 w-full max-w-md mx-auto bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.03)] px-5 py-3 flex justify-between items-end z-50 pb-4" style="left: 50%; transform: translateX(-50%);">
            <button id="btn-port-footer-home" class="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0F6B3F] transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span class="text-[9px] font-bold">Home</span>
            </button>
            <button class="flex flex-col items-center gap-1 text-[#0F6B3F] w-12 pointer-events-none">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <span class="text-[9px] font-bold">Portfolio</span>
            </button>
            
            <div class="relative -top-4 z-[60]">
                <button id="btn-port-footer-buy-agu" class="bg-gradient-to-br from-[#0F6B3F] to-[#16A34A] text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-[0_8px_15px_rgba(20,83,45,0.3)] hover:scale-105 transition-transform active:scale-95 border-4 border-[#F3F5F7]">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>

            <button id="btn-port-footer-history" class="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0F6B3F] transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span class="text-[9px] font-bold">History</span>
            </button>
            <button id="btn-port-footer-profile" class="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0F6B3F] transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span class="text-[9px] font-bold">Profile</span>
            </button>
        </div>
    </div>
`;


export const setupPortfolioEvents = (navigateToCallback, dashboardHTML, setupDashboardEvents, sipInfoHTML, setupSipInfoEvents, profileHTML, setupProfileEvents) => {
    const goHome = () => navigateToCallback(dashboardHTML, setupDashboardEvents);
    document.getElementById('btn-back-dashboard-from-portfolio').addEventListener('click', goHome);
    document.getElementById('btn-port-footer-home').addEventListener('click', goHome);

    document.getElementById('btn-port-footer-history').addEventListener('click', () => {
        navigateToCallback(historyHTML, () => setupHistoryEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
    });

    document.getElementById('btn-port-footer-profile').addEventListener('click', () => {
        navigateToCallback(profileHTML, () => setupProfileEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
    });

    // NAYA: Footer ka Buy AGU button click event
    const btnPortFooterBuy = document.getElementById('btn-port-footer-buy-agu');
    if (btnPortFooterBuy) {
        btnPortFooterBuy.addEventListener('click', () => {
            navigateToCallback(buyAguHTML, () => setupBuyAguEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
        });
    }

    document.getElementById('btn-port-buy-agu').addEventListener('click', () => {
        navigateToCallback(buyAguHTML, () => setupBuyAguEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
    });

    // NAYA: Portfolio screen par click hone se direct withdraw.js trigger hoga
    const btnPortWithdraw = document.getElementById('btn-port-withdraw');
    if (btnPortWithdraw) {
        btnPortWithdraw.addEventListener('click', () => {
            navigateToCallback(withdrawHTML, () => setupWithdrawEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
        });
    }

    const user = auth.currentUser;
    if (!user) return goHome();

        const userRef = ref(db, 'users/' + user.uid);
    const aguRef = ref(db, 'agu_purchases/' + user.uid);
    const livePriceRef = ref(db, 'platform_settings/agu_price'); // NAYA: Live Price Reference
    const liquidationContainer = document.getElementById('liquidation-center-list');

    let aguInvested = 0;
    let aguUnitsCount = 0;
    let walletBalance = 0;
    let liveAguPrice = 10; // Default price
    let rawAgus = [];

    const updatePortfolioUI = () => {
        const totalInvested = aguInvested;
        
        // 🚀 NAV SYSTEM UPDATE: Return is exact difference between Current Value and Invested Value
        const netWorth = aguUnitsCount * liveAguPrice;
        const totalReturns = netWorth - totalInvested;

                const investedEl = document.getElementById('port-invested-value');
        if (investedEl) investedEl.innerText = "₹" + totalInvested.toLocaleString('en-IN');
        
        const invUnitsEl = document.getElementById('port-invested-units');
        if (invUnitsEl) invUnitsEl.innerText = aguUnitsCount.toFixed(2);

        const currentValEl = document.getElementById('port-current-value');
        if (currentValEl) currentValEl.innerText = "₹" + netWorth.toLocaleString('en-IN', {maximumFractionDigits: 2});

        const currUnitsEl = document.getElementById('port-current-units');
        if (currUnitsEl) currUnitsEl.innerText = aguUnitsCount.toFixed(2);
        
        const returnsEl = document.getElementById('port-returns-value');
        if (returnsEl) {
            if (totalReturns >= 0) {
                returnsEl.innerText = "+ ₹" + totalReturns.toLocaleString('en-IN', {maximumFractionDigits: 2});
            } else {
                returnsEl.innerText = "- ₹" + Math.abs(totalReturns).toLocaleString('en-IN', {maximumFractionDigits: 2});
            }
        }
      
        const walletEl = document.getElementById('port-wallet-balance');
        if (walletEl) walletEl.innerText = "₹" + walletBalance.toLocaleString('en-IN', {maximumFractionDigits: 2});

        renderLiquidationCenter();
    };


    const renderLiquidationCenter = () => {
        if (!liquidationContainer) return;
        let html = '';

             // Process active valid asset blocks dynamically
        rawAgus.forEach(agu => {
            if (agu.status !== 'approved') return;

            const investedAmt = agu.amountPaid || 0;
            const units = agu.aguReceived || 0;
            
            // 🚀 NAV SYSTEM UPDATE: Asset value seedha live price se multiply hoga
            const currentValue = units * liveAguPrice;

            const purchaseTime = agu.purchaseDate || Date.now();
            const timeElapsed = Date.now() - purchaseTime;
            const daysElapsed = Math.max(0, Math.floor(timeElapsed / (1000 * 60 * 60 * 24)));
            const lockInDays = 180;
            
            const isTimeLocked = daysElapsed < lockInDays;
            const isManualLocked = agu.isLocked === true;
            const progressPercent = Math.min(100, (daysElapsed / lockInDays) * 100);

            let actionButton = '';

            if (isManualLocked) {
                actionButton = `<button class="bg-gray-100 text-gray-400 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-not-allowed flex items-center gap-1 border border-gray-200"><i class="fa-solid fa-lock text-[9px]"></i> Locked</button>`;
            } else if (isTimeLocked) {
                actionButton = `
                    <div class="flex flex-col items-end">
                        <button class="bg-orange-50 text-orange-500 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-not-allowed flex items-center gap-1.5 border border-orange-100 mb-1.5">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 
                            Locked
                        </button>
                        <div class="w-20 bg-orange-50/50 rounded-full h-1 overflow-hidden">
                            <div class="bg-orange-400 h-1 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
                        </div>
                        <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">${daysElapsed} / ${lockInDays} Days</p>
                    </div>`;
            } else {
                actionButton = `<button class="btn-liquidate-agu bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm active:scale-95" data-id="${agu.purchaseId}" data-val="${currentValue}">Sell Asset</button>`;
            }

            html += `
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center hover:border-red-200 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-yellow-50 text-appGold border border-yellow-100 rounded-full flex items-center justify-center shrink-0">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p class="text-xs font-black text-gray-800">AGU Asset Block</p>
                            <p class="text-[10px] font-bold text-gray-400 mt-0.5">Invested: ₹${investedAmt.toLocaleString('en-IN')} (${units.toFixed(2)} Units)</p>
                        </div>
                    </div>
                    <div class="text-right flex flex-col items-end gap-1">
                        <p class="text-sm font-black text-appGreen">₹${currentValue.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
                        <p class="text-[9px] font-bold text-appGreen uppercase tracking-wider mb-1">Live Valued</p>
                        ${actionButton}
                    </div>
                </div>
            `;
        });


        if (html === '') {
            liquidationContainer.innerHTML = `
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center">
                    <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
                        <i class="fa-solid fa-box-open text-xl"></i>
                    </div>
                    <p class="text-gray-400 text-sm font-medium">No assets available for liquidation.</p>
                </div>
            `;
            return;
        }

        liquidationContainer.innerHTML = html;

        // Liquidation Click Handler Triggers
        document.querySelectorAll('.btn-liquidate-agu').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const aguId = e.target.getAttribute('data-id');
                const liquidationValue = parseFloat(e.target.getAttribute('data-val'));

                Swal.fire({
                    title: 'Liquidate Asset?',
                    text: `Sell this AGU block for ₹${Math.round(liquidationValue)}? Funds will be added to your Liquid Wallet.`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DC2626',
                    cancelButtonColor: '#9CA3AF',
                    confirmButtonText: 'Yes, Sell it'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            Swal.fire({ title: 'Processing Liquidation...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                            const finalWalletBalance = walletBalance + liquidationValue;
                            const updates = {};
                            updates[`users/${user.uid}/walletBalance`] = finalWalletBalance;
                            updates[`agu_purchases/${user.uid}/${aguId}/status`] = 'liquidated';
                            updates[`agu_purchases/${user.uid}/${aguId}/liquidatedAt`] = serverTimestamp();

                            await update(ref(db), updates);
                            Swal.fire('Asset Sold!', `₹${Math.round(liquidationValue)} has been successfully added to your liquid wallet.`, 'success');
                        } catch (err) {
                            Swal.fire('Error', 'Failed to process asset liquidation.', 'error');
                        }
                    }
                });
            });
        });
    };

    // Firebase Core Value Bindings
    onValue(livePriceRef, (snapshot) => {
        if(snapshot.exists()) {
            liveAguPrice = parseFloat(snapshot.val());
        } else {
            liveAguPrice = 10;
        }
        updatePortfolioUI();
    });

    onValue(userRef, (snapshot) => {
        if(snapshot.exists()) {
            const data = snapshot.val();
            walletBalance = data.walletBalance || 0; 
        }
        updatePortfolioUI();
    });

    onValue(aguRef, (snapshot) => {
        aguInvested = 0; aguUnitsCount = 0;
   rawAgus = [];
        if(snapshot.exists()) {
            const agus = snapshot.val();
            Object.values(agus).forEach(agu => {
                if(agu.status === 'approved') {
                    aguInvested += (agu.amountPaid || 0);
                    aguUnitsCount += (agu.aguReceived || 0);
                    rawAgus.push(agu);
                }
            });
        }
        updatePortfolioUI();
    });

    // Wallet Recharge Intent Logic Setup (Dynamic WhatsApp generation)
    document.getElementById('btn-recharge-wallet').addEventListener('click', async () => {
        const { value: amountStr } = await Swal.fire({
            title: 'Add Funds to Wallet',
            input: 'number',
            inputLabel: 'Enter Amount (₹)',
            inputPlaceholder: 'Minimum ₹100',
            showCancelButton: true,
            confirmButtonColor: '#14532D',
            inputValidator: (value) => {
                if (!value || value < 100) return 'Minimum amount is ₹100';
            }
        });

        if (amountStr) {
            const amt = parseFloat(amountStr);
            Swal.fire({ title: 'Generating QR...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

            try {
                const adminPaymentRef = ref(db, 'admin_settings/payment');
                const snapshot = await get(adminPaymentRef);
                let upiId = "7903698180@jupiteraxis"; 
                
                if(snapshot.exists() && snapshot.val().upiId) {
                    upiId = snapshot.val().upiId;
                }

                const upiLink = `upi://pay?pa=${upiId}&pn=AMP%20Growth%20Units&am=${amt}&cu=INR`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

                Swal.fire({
                    title: 'Scan & Pay',
                    html: `
                        <div class="text-center">
                            <p class="text-xs text-gray-500 mb-3">Add <b class="text-appGreen text-lg">₹${amt}</b> to your Wallet</p>
                            <div class="flex justify-center mb-3">
                                <img src="${qrUrl}" class="w-48 h-48 border-2 border-appGreen rounded-xl p-2 shadow-md" crossorigin="anonymous">
                            </div>
                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Official UPI ID</p>
                            <p class="text-xs font-black text-gray-800 bg-gray-50 py-1.5 rounded-lg border border-gray-100">${upiId}</p>
                            <p class="text-[10px] text-appGold font-bold mt-4 mb-3">1. Download QR & Pay<br>2. Click 'Payment Done' to send screenshot on WhatsApp.</p>
                            
                            <button id="btn-swal-download-qr" class="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl mb-2 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 active:scale-95">
                                <i class="fa-solid fa-download"></i> Download QR
                            </button>
                            <button id="btn-swal-payment-done" class="w-full bg-[#25D366] text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2 active:scale-95">
                                <i class="fa-brands fa-whatsapp text-lg"></i> Payment Done
                            </button>
                        </div>
                    `,
                    showConfirmButton: false,
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                    allowOutsideClick: false,
                    didOpen: () => {
                        document.getElementById('btn-swal-download-qr').addEventListener('click', async () => {
                            try {
                                const response = await fetch(qrUrl);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.style.display = 'none';
                                a.href = url;
                                a.download = `AMP_WALLET_QR_${amt}.png`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                            } catch(e) { console.error("QR Download Error", e); }
                        });

                        document.getElementById('btn-swal-payment-done').addEventListener('click', async () => {
                            Swal.close();
                            Swal.fire({ title: 'Saving...', text: 'Recording your request.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
                            try {
                                const walletRechargeRef = ref(db, 'wallet_recharges/' + user.uid);
                                const newReqRef = push(walletRechargeRef);
                                await set(newReqRef, {
                                    requestId: newReqRef.key,
                                    amount: amt,
                                    status: 'pending',
                                    requestDate: serverTimestamp()
                                });

                                const whatsappMsg = `AMP Growth Units\n\nWallet Recharge Request for ₹${amt}\n\nMain payment kar chuka hun lekin yah abhi bhi pending hai check and approved.`;
                                const whatsappLink = `https://wa.me/917903698180?text=${encodeURIComponent(whatsappMsg)}`;
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Request Sent!',
                                    text: 'Please send the payment screenshot on WhatsApp to get it approved.',
                                    confirmButtonColor: '#14532D',
                                    confirmButtonText: 'Open WhatsApp'
                                }).then(() => {
                                    window.open(whatsappLink, '_blank');
                                });
                            } catch(error) {
                                Swal.fire({icon: 'error', title: 'Failed', text: 'Could not send request.', confirmButtonColor: '#14532D'});
                            }
                        });
                    }
                });
            } catch (err) {
                Swal.fire('Error', 'Could not generate QR code.', 'error');
            }
        }
    });
};