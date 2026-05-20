// src/admin-dashboard.js
import { db } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

export const adminDashboardHTML = `
    <div class="space-y-6 w-full max-w-6xl mx-auto pb-10">
        <div class="flex justify-between items-center hidden md:flex">
            <h2 class="text-2xl font-black text-gray-800">System Overview</h2>
            <div class="px-4 py-2 bg-green-50 text-adminPrimary rounded-xl text-xs font-bold flex items-center gap-2 border border-green-100">
                <span class="w-2 h-2 rounded-full bg-adminPrimary animate-pulse"></span>
                Live Database Connected
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div id="card-dash-users" class="cursor-pointer hover:scale-[1.03] active:scale-95 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group hover:border-blue-300 transition-all">
                <div class="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div class="flex items-center gap-3 mb-2 relative z-10">
                    <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm"><i class="fa-solid fa-users"></i></div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
                </div>
                <h3 class="text-2xl font-black text-gray-800 relative z-10" id="dash-stat-users">0</h3>
            </div>

            <div id="card-dash-agu" class="cursor-pointer hover:scale-[1.03] active:scale-95 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group hover:border-adminGold/40 transition-all">
                <div class="absolute -right-4 -top-4 w-16 h-16 bg-yellow-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div class="flex items-center gap-3 mb-2 relative z-10">
                    <div class="w-8 h-8 rounded-full bg-yellow-100 text-adminGold flex items-center justify-center shadow-sm"><i class="fa-solid fa-coins"></i></div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total AGU</p>
                </div>
                <h3 class="text-2xl font-black text-gray-800 relative z-10" id="dash-stat-agu">0.00 Units</h3>
            </div>

            <div id="card-dash-pending" class="cursor-pointer hover:scale-[1.03] active:scale-95 bg-gradient-to-br from-red-500 to-red-600 p-5 rounded-2xl shadow-md border border-red-400 flex flex-col justify-center relative overflow-hidden transition-all">
                <div class="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full"></div>
                <div class="flex items-center gap-3 mb-2 relative z-10">
                    <div class="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center"><i class="fa-solid fa-clock-rotate-left"></i></div>
                    <p class="text-[10px] font-bold text-red-100 uppercase tracking-wider">Pending Action</p>
                </div>
                <h3 class="text-2xl font-black text-white relative z-10" id="dash-stat-pending">0 Requests</h3>
            </div>

            <div id="card-dash-profit" class="cursor-pointer hover:scale-[1.03] active:scale-95 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group hover:border-purple-300 transition-all">
                <div class="absolute -right-4 -top-4 w-16 h-16 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div class="flex items-center gap-3 mb-2 relative z-10">
                    <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm"><i class="fa-solid fa-chart-pie"></i></div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Profit Dist.</p>
                </div>
                <h3 class="text-2xl font-black text-gray-800 relative z-10" id="dash-stat-profit">₹0</h3>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-green-50 rounded-full blur-xl"></div>
                <div class="relative z-10">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><i class="fa-solid fa-wallet text-adminPrimary"></i> Users Wallet Balance</p>
                    <h2 class="text-3xl font-black text-adminPrimary" id="dash-stat-wallet">₹0</h2>
                </div>
            </div>

            <div class="bg-gradient-to-r from-[#0F6B3F] to-[#0a4d2c] rounded-2xl p-6 shadow-md border border-green-800 flex justify-between items-center text-white relative overflow-hidden">
                <div class="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div class="relative z-10">
                    <p class="text-xs font-bold text-green-200 uppercase tracking-wider mb-1 flex items-center gap-1.5"><i class="fa-solid fa-vault text-adminGold"></i> AMP Master Fund</p>
                    <h2 class="text-3xl font-black text-white" id="dash-stat-amp-fund">₹0</h2>
                </div>
                <div class="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-adminGold text-2xl border border-white/20 relative z-10">
                    <i class="fa-solid fa-building-columns"></i>
                </div>
            </div>
        </div>

        <div class="mt-8">
            <h3 class="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-money-bill-transfer text-adminPrimary"></i> Fund Deposit History
            </h3>
            <div id="dash-fund-history" class="space-y-3">
                <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-center h-24">
                    <p class="text-gray-400 text-sm font-medium"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading history...</p>
                </div>
            </div>
        </div>
    </div>
`;

export const setupAdminDashboardEvents = () => {
    document.getElementById('card-dash-users').addEventListener('click', () => document.querySelector('[data-tab="users"]')?.click());
    document.getElementById('card-dash-pending').addEventListener('click', () => document.querySelector('[data-tab="wallet"]')?.click());
    document.getElementById('card-dash-profit').addEventListener('click', () => document.querySelector('[data-tab="distributor"]')?.click());

    const usersRef = ref(db, 'users/');
    const aguRef = ref(db, 'agu_purchases/');
    const walletRef = ref(db, 'wallet_recharges/');
    const withdrawRef = ref(db, 'withdrawals/');
    const masterDistRef = ref(db, 'master_distributions/');

    const elUsers = document.getElementById('dash-stat-users');
    const elAgu = document.getElementById('dash-stat-agu');
    const elPending = document.getElementById('dash-stat-pending');
    const elWallet = document.getElementById('dash-stat-wallet');
    const elAmpFund = document.getElementById('dash-stat-amp-fund');
    const elHistory = document.getElementById('dash-fund-history');
    const elProfit = document.getElementById('dash-stat-profit');

    let totalWalletBal = 0;
    let aguInvestment = 0;
    let usersDirectory = {};
    let approvedDeposits = [];

    const updateAmpFund = () => {
        const totalFund = totalWalletBal + aguInvestment;
        if (elAmpFund) elAmpFund.innerText = "₹" + totalFund.toLocaleString('en-IN');
    };

    let pendingAguCount = 0, pendingWalletCount = 0, pendingWithdrawCount = 0;
    const updateTotalPending = () => {
        const totalPending = pendingAguCount + pendingWalletCount + pendingWithdrawCount;
        if (elPending) elPending.innerText = totalPending + " Requests";
    };

    const renderHistory = () => {
        if(approvedDeposits.length === 0) {
            if(elHistory) elHistory.innerHTML = `<div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-center h-24"><p class="text-gray-400 text-xs font-medium">No approved deposits yet.</p></div>`;
            return;
        }
        if(elHistory) {
            elHistory.innerHTML = approvedDeposits.map(req => {
                const userName = usersDirectory[req.uid]?.fullName || 'Unknown User';
                return `
                    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center hover:border-adminPrimary transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-green-50 text-adminPrimary rounded-full flex items-center justify-center text-lg shadow-sm border border-green-100">
                                <i class="fa-solid fa-money-bill-wave"></i>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-gray-800 tracking-tight">${userName}</p>
                                <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">${new Date(req.requestDate).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-black text-adminPrimary">+ ₹${req.amount.toLocaleString('en-IN')}</p>
                            <span class="bg-green-100 text-green-700 text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Wallet Recharge</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    };

    onValue(usersRef, (snapshot) => {
        if(snapshot.exists()) {
            const users = snapshot.val();
            usersDirectory = users;
            let userCount = 0;
            totalWalletBal = 0;
            Object.keys(users).forEach(uid => {
                if (uid !== "2OcCMmUcVORQyXMMXuk94rLwP1G2") {
                    userCount++;
                    if(users[uid].walletBalance) totalWalletBal += parseFloat(users[uid].walletBalance);
                }
            });
            elUsers.innerText = userCount;
            elWallet.innerText = "₹" + totalWalletBal.toLocaleString('en-IN');
        }
        updateAmpFund();
        renderHistory();
    });

    onValue(aguRef, (snapshot) => {
        aguInvestment = 0;
        let totalUnits = 0;
        pendingAguCount = 0;
        if(snapshot.exists()) {
            snapshot.forEach((userNode) => {
                userNode.forEach((txNode) => {
                    const tx = txNode.val();
                    if(tx.status === 'approved') {
                        aguInvestment += (tx.amountPaid || 0); 
                        totalUnits += (tx.aguReceived || 0);
                    } else if (tx.status === 'pending') {
                        pendingAguCount++;
                    }
                });
            });
        }
        elAgu.innerText = totalUnits.toFixed(2) + " Units";
        updateAmpFund();
        updateTotalPending();
    });

    onValue(walletRef, (snapshot) => {
        pendingWalletCount = 0;
        approvedDeposits = [];
        if(snapshot.exists()) {
            snapshot.forEach((userNode) => {
                const uid = userNode.key;
                userNode.forEach((reqNode) => {
                    const req = reqNode.val();
                    if(req.status === 'pending') pendingWalletCount++;
                    else if (req.status === 'approved') approvedDeposits.push({ uid: uid, ...req });
                });
            });
        }
        approvedDeposits.sort((a, b) => b.requestDate - a.requestDate);
        updateTotalPending();
        renderHistory();
    });

    onValue(withdrawRef, (snapshot) => {
        pendingWithdrawCount = 0;
        if(snapshot.exists()) {
            snapshot.forEach((userNode) => {
                userNode.forEach((reqNode) => {
                    if(reqNode.val().status === 'pending') pendingWithdrawCount++;
                });
            });
        }
        updateTotalPending();
    });

    onValue(masterDistRef, (snapshot) => {
        let totalProfitDistributed = 0;
        if(snapshot.exists()) {
            snapshot.forEach((node) => {
                const dist = node.val();
                totalProfitDistributed += (dist.totalProfit || 0);
            });
        }
        if(elProfit) elProfit.innerText = "₹" + totalProfitDistributed.toLocaleString('en-IN');
    });
};
