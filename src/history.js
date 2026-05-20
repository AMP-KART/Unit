// history.js - Premium Transaction History Component Module
import { auth, db } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

import { portfolioHTML, setupPortfolioEvents } from './portfolio.js';
import { profileHTML, setupProfileEvents } from './profile.js';
// NAYA: Import Buy AGU for the new footer button
import { buyAguHTML, setupBuyAguEvents } from './buy-agu.js';

export const historyHTML = `
    <div class="min-h-screen bg-appBg pb-28 font-sans">
        
        <div class="bg-white px-6 py-3 shadow-md rounded-b-3xl flex items-center gap-4 z-50 sticky top-0 w-full backdrop-blur-md bg-white/95">
            <button id="btn-back-dashboard-from-history" class="text-gray-600 hover:text-appGreen transition-colors flex items-center justify-center p-1.5 active:scale-95">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h2 class="text-lg font-bold text-appText">Transaction History</h2>
        </div>

        <div class="px-5 mt-6">
            <div class="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-2">
                <button class="filter-btn active bg-appGreen text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap" data-filter="ALL">All Activity</button>
                <button class="filter-btn bg-white text-gray-500 border border-gray-100 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-all whitespace-nowrap" data-filter="AGU">AGU Assets</button>
                <button class="filter-btn bg-white text-gray-500 border border-gray-100 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-all whitespace-nowrap" data-filter="WALLET">Wallet & Bank</button>
            </div>

            <div id="history-list-container" class="space-y-3">
                <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col items-center justify-center h-40">
                    <i class="fa-solid fa-spinner fa-spin text-appGreen text-2xl mb-3"></i>
                    <p class="text-gray-400 text-sm font-medium">Fetching history...</p>
                </div>
            </div>
        </div>

        <div class="fixed bottom-0 left-0 w-full max-w-md mx-auto bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.03)] px-5 py-3 flex justify-between items-end z-50 pb-4" style="left: 50%; transform: translateX(-50%);">
            <button id="btn-hist-footer-home" class="flex flex-col items-center gap-1 text-gray-400 hover:text-appGreen transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span class="text-[9px] font-bold">Home</span>
            </button>
            <button id="btn-hist-footer-portfolio" class="flex flex-col items-center gap-1 text-gray-400 hover:text-appGreen transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <span class="text-[9px] font-bold">Portfolio</span>
            </button>
            
            <div class="relative -top-4 z-[60]">
                <button id="btn-hist-footer-buy-agu" class="bg-gradient-to-br from-[#0F6B3F] to-[#16A34A] text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-[0_8px_15px_rgba(20,83,45,0.3)] hover:scale-105 transition-transform active:scale-95 border-4 border-[#F3F5F7]">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>

            <button class="flex flex-col items-center gap-1 text-appGreen w-12 pointer-events-none">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span class="text-[9px] font-bold">History</span>
            </button>
            <button id="btn-hist-footer-profile" class="flex flex-col items-center gap-1 text-gray-400 hover:text-appGreen transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span class="text-[9px] font-bold">Profile</span>
            </button>
        </div>
    </div>
`;

export const setupHistoryEvents = (navigateToCallback, dashboardHTML, setupDashboardEvents) => {
    
    // Navigation Handlers
    const goHome = () => navigateToCallback(dashboardHTML, setupDashboardEvents);
    document.getElementById('btn-back-dashboard-from-history').addEventListener('click', goHome);
    document.getElementById('btn-hist-footer-home').addEventListener('click', goHome);

    document.getElementById('btn-hist-footer-portfolio').addEventListener('click', () => {
        navigateToCallback(portfolioHTML, () => setupPortfolioEvents(navigateToCallback, dashboardHTML, setupDashboardEvents, null, null, profileHTML, setupProfileEvents));
    });

    document.getElementById('btn-hist-footer-profile').addEventListener('click', () => {
        navigateToCallback(profileHTML, () => setupProfileEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
    });

    // NAYA: Footer ka Buy AGU button click event trigger
    const btnHistFooterBuy = document.getElementById('btn-hist-footer-buy-agu');
    if (btnHistFooterBuy) {
        btnHistFooterBuy.addEventListener('click', () => {
            navigateToCallback(buyAguHTML, () => setupBuyAguEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
        });
    }

    const user = auth.currentUser;
    if (!user) return goHome();

    const listContainer = document.getElementById('history-list-container');
    
    let allTransactions = [];
    let aguData = [], walletData = [], withdrawData = [];
    let currentFilter = 'ALL';

    const renderHistory = () => {
        allTransactions = [...aguData, ...walletData, ...withdrawData];
        allTransactions.sort((a, b) => b.timestamp - a.timestamp); // Sabse naya upar

        let filteredTransactions = allTransactions;
        if (currentFilter === 'AGU') {
            filteredTransactions = allTransactions.filter(t => t.category === 'AGU');
        } else if (currentFilter === 'WALLET') {
            filteredTransactions = allTransactions.filter(t => t.category === 'WALLET');
        }

        if (filteredTransactions.length === 0) {
            listContainer.innerHTML = `
                <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col items-center justify-center h-40">
                    <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
                        <i class="fa-solid fa-receipt text-xl"></i>
                    </div>
                    <p class="text-gray-400 text-sm font-medium">No transactions found.</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = filteredTransactions.map(t => {
            let iconTheme = "", iconSvg = "", amountColor = "text-gray-800", sign = "";
            let statusBadge = "";

            // UI Styles based on Transaction Type
            if (t.type === 'AGU_BUY') {
                iconTheme = "bg-yellow-50 text-appGold";
                iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>';
                amountColor = "text-appGold"; sign = "-";
            } else if (t.type === 'AGU_SELL') {
                iconTheme = "bg-green-50 text-appGreen";
                iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
                amountColor = "text-appGreen"; sign = "+";
            } else if (t.type === 'WALLET_ADD') {
                iconTheme = "bg-blue-50 text-blue-500";
                iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>';
                amountColor = "text-blue-600"; sign = "+";
            } else if (t.type === 'WALLET_WITHDRAW') {
                iconTheme = "bg-red-50 text-red-500";
                iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>';
                amountColor = "text-red-500"; sign = "-";
            }

            // Status Badge
            if (t.status === 'pending') {
                statusBadge = '<span class="px-2 py-0.5 bg-yellow-100 text-yellow-600 text-[8px] font-black uppercase rounded">Pending</span>';
            } else if (t.status === 'approved' || t.status === 'completed' || t.status === 'liquidated_sold') {
                statusBadge = '<span class="px-2 py-0.5 bg-green-100 text-green-600 text-[8px] font-black uppercase rounded">Success</span>';
            } else if (t.status === 'rejected' || t.status === 'failed') {
                statusBadge = '<span class="px-2 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase rounded">Failed</span>';
            }

            const dateStr = new Date(t.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            // WhatsApp Help Message Generation for Pending Transactions
            let whatsappHelpBtn = '';
            if (t.status === 'pending') {
                const whatsappMsg = `AMP Growth Units\n\nSir, my ${t.title} for ₹${t.amount.toLocaleString('en-IN')} is still pending.\n\nTransaction Details:\n- Date: ${dateStr}\n- Status: Pending\n\nPlease check and approve it.`;
                const whatsappLink = `https://wa.me/917903698180?text=${encodeURIComponent(whatsappMsg)}`;
                
                whatsappHelpBtn = `
                    <a href="${whatsappLink}" target="_blank" class="bg-green-50 border border-green-200 text-[#0F6B3F] text-[9px] font-bold px-2 py-1 rounded-md shadow-sm hover:bg-green-100 transition-colors flex items-center gap-1 active:scale-95">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.405-.883-.733-1.48-1.638-1.653-1.935-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Help
                    </a>
                `;
            }

            return `
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center hover:border-gray-200 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full ${iconTheme} flex items-center justify-center shrink-0">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconSvg}</svg>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                ${t.title} ${statusBadge}
                            </p>
                            <p class="text-[9px] font-bold text-gray-400 uppercase mt-0.5 tracking-wide">${dateStr}</p>
                            ${t.subtitle ? `<p class="text-[10px] font-medium text-gray-500 mt-0.5">${t.subtitle}</p>` : ''}
                        </div>
                    </div>
                    <div class="text-right flex flex-col items-end gap-1.5">
                        <p class="text-sm font-black ${amountColor}">${sign} ₹${t.amount.toLocaleString('en-IN')}</p>
                        ${whatsappHelpBtn}
                    </div>
                </div>
            `;
        }).join('');
    };

       // Filter Buttons Logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const clickedBtn = e.currentTarget;
            
            // 1. Sabhi buttons ki styling completely reset karo (Default Inactive State)
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.className = 'filter-btn bg-white text-gray-500 border border-gray-100 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap';
            });
            
            // 2. Jis par click hua hai sirf uski styling Green set karo (Active State)
            clickedBtn.className = 'filter-btn active bg-appGreen text-white border border-transparent text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap';
            
            currentFilter = clickedBtn.getAttribute('data-filter');
            renderHistory();
            
            // 3. Mobile screen par focus atakne (stuck) ki problem door karne ke liye
            setTimeout(() => clickedBtn.blur(), 50);
        });
    });


    // 1. Fetch AGU Activity (Purchase & Sell)
    onValue(ref(db, 'agu_purchases/' + user.uid), (snapshot) => {
        aguData = [];
        if (snapshot.exists()) {
            Object.values(snapshot.val()).forEach(p => {
                aguData.push({
                    id: p.purchaseId,
                    category: 'AGU',
                    type: 'AGU_BUY',
                    title: 'AGU Investment',
                    subtitle: `${(p.aguReceived || 0).toFixed(2)} Units Bought`,
                    amount: p.amountPaid,
                    timestamp: p.purchaseDate || Date.now(),
                    status: p.status
                });
                // Check if user sold/liquidated this asset
                if (p.status === 'liquidated_sold' || p.status === 'liquidated') {
                    aguData.push({
                        id: p.purchaseId + '_sell',
                        category: 'AGU',
                        type: 'AGU_SELL',
                        title: 'Asset Liquidated',
                        subtitle: 'Funds added to wallet',
                        amount: p.proceedsReceived || p.amountPaid, 
                        timestamp: p.soldAt || p.liquidatedAt || Date.now(),
                        status: 'completed'
                    });
                }
            });
        }
        renderHistory();
    });

    // 2. Fetch Wallet Add Money
    onValue(ref(db, 'wallet_recharges/' + user.uid), (snapshot) => {
        walletData = [];
        if (snapshot.exists()) {
            Object.values(snapshot.val()).forEach(w => {
                walletData.push({
                    id: w.requestId,
                    category: 'WALLET',
                    type: 'WALLET_ADD',
                    title: 'Wallet Recharge',
                    amount: w.amount,
                    timestamp: w.requestDate || Date.now(),
                    status: w.status
                });
            });
        }
        renderHistory();
    });

    // 3. Fetch Wallet Withdrawals
    onValue(ref(db, 'withdrawals/' + user.uid), (snapshot) => {
        withdrawData = [];
        if (snapshot.exists()) {
            Object.values(snapshot.val()).forEach(w => {
                withdrawData.push({
                    id: w.withdrawId,
                    category: 'WALLET',
                    type: 'WALLET_WITHDRAW',
                    title: 'Bank Withdrawal',
                    amount: w.amount,
                    timestamp: w.requestDate || Date.now(),
                    status: w.status
                });
            });
        }
        renderHistory();
    });
};