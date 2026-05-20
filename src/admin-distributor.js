// src/admin-distributor.js
import { db } from './firebase.js';
import { ref, onValue, get, update, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

export const adminDistributorHTML = `
    <div class="space-y-6 w-full max-w-6xl mx-auto pb-10">
        <div class="flex justify-between items-center hidden md:flex mb-6">
            <div>
                <h2 class="text-2xl font-black text-gray-800">Profit Distributor Engine</h2>
                <p class="text-xs text-gray-500 font-bold mt-1">Smart distribution of profits to founders, company funds, and AGU shareholders</p>
            </div>
            <div class="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-100 shadow-sm">
                <i class="fa-solid fa-calculator"></i> Master Engine
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 space-y-6">
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <i class="fa-solid fa-money-bill-wave text-adminPrimary"></i> Enter Profit
                    </h3>
                    <div class="space-y-4">
                        <div>
                            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Total Profit Amount (₹)</label>
                            <input type="number" id="dist-amount" placeholder="e.g. 1000" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 outline-none text-gray-800 font-black text-2xl focus:border-adminPrimary transition-all text-center">
                        </div>
                        <button id="btn-preview-dist" class="w-full bg-adminPrimary hover:bg-[#0a4d2c] text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Calculate Split
                        </button>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-gray-900 to-adminSidebar rounded-3xl shadow-lg p-6 text-white border border-gray-800 relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 w-24 h-24 bg-adminGold rounded-full blur-[50px] opacity-20"></div>
                    <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Live System Stats</h4>
                    <div class="space-y-3 relative z-10">
                        <div class="flex justify-between items-end border-b border-gray-700 pb-3">
                            <span class="text-xs font-medium text-gray-300">Active AGU Units</span>
                            <span id="stat-total-agu" class="text-xl font-black text-adminGold">0.00</span>
                        </div>
                        <div class="flex justify-between items-end">
                            <span class="text-xs font-medium text-gray-300">Eligible Shareholders</span>
                            <span id="stat-total-users" class="text-xl font-black text-white">0</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-2">
                <div id="dist-preview-card" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hidden animation-fade-in flex flex-col h-full">
                    
                    <div class="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h3 class="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                            <i class="fa-solid fa-chart-pie text-adminGold"></i> Distribution Preview
                        </h3>
                        <div class="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-lg" id="preview-total-text">Total: ₹0</div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div class="bg-blue-50 rounded-2xl p-3 border border-blue-100">
                            <p class="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Work (51%)</p>
                            <h4 class="text-lg font-black text-blue-700 mt-1" id="prev-work">₹0</h4>
                        </div>
                        <div class="bg-purple-50 rounded-2xl p-3 border border-purple-100 relative overflow-hidden ring-1 ring-purple-200">
                            <div class="absolute top-0 right-0 w-2 h-full bg-purple-400"></div>
                            <p class="text-[9px] font-bold text-purple-600 uppercase tracking-wider">Shareholders (18%)</p>
                            <h4 class="text-lg font-black text-purple-800 mt-1" id="prev-share">₹0</h4>
                        </div>
                        <div class="bg-green-50 rounded-2xl p-3 border border-green-100">
                            <p class="text-[9px] font-bold text-green-600 uppercase tracking-wider">Growth (25%)</p>
                            <h4 class="text-lg font-black text-green-700 mt-1" id="prev-growth">₹0</h4>
                        </div>
                        <div class="bg-red-50 rounded-2xl p-3 border border-red-100">
                            <p class="text-[9px] font-bold text-red-600 uppercase tracking-wider">Emerg/Soc (6%)</p>
                            <h4 class="text-lg font-black text-red-700 mt-1" id="prev-other">₹0</h4>
                        </div>
                    </div>

                    <div class="flex-grow">
                        <h4 class="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-users text-purple-500"></i> Shareholder Breakdown
                        </h4>
                        <div class="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden h-[200px] overflow-y-auto no-scrollbar relative">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-white sticky top-0 shadow-sm">
                                    <tr>
                                        <th class="py-2 px-3 text-[9px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                                        <th class="py-2 px-3 text-[9px] font-bold text-gray-400 uppercase tracking-wider text-center">AGU Units</th>
                                        <th class="py-2 px-3 text-[9px] font-bold text-gray-400 uppercase tracking-wider text-right">Profit Share</th>
                                    </tr>
                                </thead>
                                <tbody id="breakdown-tbody" class="divide-y divide-gray-100">
                                    </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="mt-6">
                        <button id="btn-execute-dist" class="w-full bg-gradient-to-r from-adminPrimary to-green-600 hover:from-green-700 hover:to-green-800 text-white font-black py-4 rounded-xl shadow-[0_8px_20px_rgba(15,107,63,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 text-lg border border-green-500/30">
                            <i class="fa-solid fa-paper-plane"></i> Execute Master Distribution
                        </button>
                    </div>
                </div>

                <div id="dist-empty-state" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center h-full text-center min-h-[400px]">
                    <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
                        <i class="fa-solid fa-chart-line text-4xl text-gray-300"></i>
                    </div>
                    <h3 class="text-xl font-black text-gray-800 mb-2">Awaiting Input</h3>
                    <p class="text-sm font-medium text-gray-400 max-w-sm">Enter the product profit on the left to see the complete smart breakdown and eligible shareholder list.</p>
                </div>
            </div>
        </div>
    </div>
    <style>
        .animation-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
`;

export const setupAdminDistributorEvents = () => {
    let totalGlobalAgu = 0;
    let userAguMap = {}; 
    let userNamesMap = {}; // Maps uid -> User's real name/phone
    let calculatedData = null;

    const statAgu = document.getElementById('stat-total-agu');
    const statUsers = document.getElementById('stat-total-users');

    // 1. Fetch Global AGU Data & User Names in Realtime
    const loadSystemData = async () => {
        const [aguSnap, usersSnap] = await Promise.all([
            get(ref(db, 'agu_purchases/')),
            get(ref(db, 'users/'))
        ]);

        totalGlobalAgu = 0;
        userAguMap = {};
        userNamesMap = {};
        let activeUsersCount = 0;

        const usersData = usersSnap.val() || {};
        
        if (aguSnap.exists()) {
            aguSnap.forEach(userNode => {
                const uid = userNode.key;
                let userUnits = 0;
                userNode.forEach(purchaseNode => {
                    const p = purchaseNode.val();
                    if (p.status === 'approved') {
                        userUnits += parseFloat(p.aguReceived || 0);
                    }
                });

                           if (userUnits > 0) {
                    userAguMap[uid] = userUnits;
                    totalGlobalAgu += userUnits;
                    activeUsersCount++;
                    // FIX: Changed from .name to .fullName to properly map user details
                    userNamesMap[uid] = usersData[uid]?.fullName || usersData[uid]?.phone || "Unknown User";
                }

            });
        }
        
        statAgu.innerText = totalGlobalAgu.toFixed(2);
        statUsers.innerText = activeUsersCount;
    };
    
    loadSystemData();

    // 2. Preview Calculation & Table Generation
    document.getElementById('btn-preview-dist').addEventListener('click', async () => {
        // Ensure data is fresh
        await loadSystemData();

        const amountInput = document.getElementById('dist-amount').value;
        const totalProfit = parseFloat(amountInput);

        if (!totalProfit || totalProfit <= 0) {
            Swal.fire({icon: 'warning', title: 'Invalid Amount', text: 'Please enter a valid profit amount.', confirmButtonColor: '#0F6B3F'});
            return;
        }

        const workFund = totalProfit * 0.51;
        const growthFund = totalProfit * 0.25;
        const emergencyFund = totalProfit * 0.05;
        const socialFund = totalProfit * 0.01;
        let shareholderFund = totalProfit * 0.18;

        let isShareholderRedirected = false;
        if (totalGlobalAgu === 0 && shareholderFund > 0) {
            isShareholderRedirected = true;
            calculatedData = { totalProfit, workFund, growthFund: growthFund + shareholderFund, emergencyFund, socialFund, shareholderFund: 0 };
        } else {
            calculatedData = { totalProfit, workFund, growthFund, emergencyFund, socialFund, shareholderFund };
        }

        // Update UI Cards
        document.getElementById('preview-total-text').innerText = "Total Input: ₹" + totalProfit;
        document.getElementById('prev-work').innerText = "₹" + calculatedData.workFund.toLocaleString('en-IN', {maximumFractionDigits: 2});
        document.getElementById('prev-growth').innerText = "₹" + calculatedData.growthFund.toLocaleString('en-IN', {maximumFractionDigits: 2});
        document.getElementById('prev-other').innerText = "₹" + (calculatedData.emergencyFund + calculatedData.socialFund).toLocaleString('en-IN', {maximumFractionDigits: 2});
        document.getElementById('prev-share').innerText = "₹" + calculatedData.shareholderFund.toLocaleString('en-IN', {maximumFractionDigits: 2});

        // Generate Breakdown Table
        const tbody = document.getElementById('breakdown-tbody');
        tbody.innerHTML = '';

        if (isShareholderRedirected || calculatedData.shareholderFund === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="py-4 text-center text-xs text-gray-400 font-bold">No active shareholders. Fund redirected to Growth.</td></tr>`;
        } else {
            for (const [uid, userUnits] of Object.entries(userAguMap)) {
                const userShare = (userUnits / totalGlobalAgu) * calculatedData.shareholderFund;
                const sharePercent = ((userUnits / totalGlobalAgu) * 100).toFixed(1);
                
                tbody.innerHTML += `
                    <tr class="hover:bg-white transition-colors">
                        <td class="py-2.5 px-3">
                            <p class="text-xs font-bold text-gray-800 truncate w-24 md:w-32">${userNamesMap[uid]}</p>
                            <p class="text-[8px] text-gray-400 font-mono">${uid.substring(0,6)}...</p>
                        </td>
                        <td class="py-2.5 px-3 text-center">
                            <span class="text-xs font-black text-adminPrimary bg-green-50 px-2 py-0.5 rounded">${userUnits.toFixed(2)}</span>
                            <p class="text-[8px] text-gray-400 font-bold mt-0.5">${sharePercent}%</p>
                        </td>
                        <td class="py-2.5 px-3 text-right">
                            <p class="text-sm font-black text-purple-700">₹${userShare.toFixed(2)}</p>
                        </td>
                    </tr>
                `;
            }
        }

        document.getElementById('dist-empty-state').classList.add('hidden');
        document.getElementById('dist-preview-card').classList.remove('hidden');
    });

    // 3. Flawless Execution Logic
    document.getElementById('btn-execute-dist').addEventListener('click', async (e) => {
        if (!calculatedData) return;

        const executeBtn = document.getElementById('btn-execute-dist');
        const originalBtnText = executeBtn.innerHTML;

        Swal.fire({
            title: 'Confirm NAV Update',
            text: `₹${calculatedData.shareholderFund.toFixed(2)} will be added to the Global Pool. AGU Unit Price (NAV) will instantly increase for all ${Object.keys(userAguMap).length} investors. Are you sure?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0F6B3F',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Update Unit Price'
        }).then(async (result) => {
            if (result.isConfirmed) {
                executeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating NAV...';
                
                try {
                    const updates = {};
                    
                    // NAYA: Users loop ki jagah ab hum global platform settings fetch kar rahe hain
                    const [fundsSnap, platformSnap] = await Promise.all([
                        get(ref(db, 'company_funds')),
                        get(ref(db, 'platform_settings/agu_price'))
                    ]);

                    const currentFunds = fundsSnap.val() || {};
                    // NAYA: Default price 10 set ki gayi hai agar pehle se set na ho
                    let currentPrice = platformSnap.exists() ? parseFloat(platformSnap.val()) : 10;

                    // Company Ledgers
                    updates['company_funds/work'] = (currentFunds.work || 0) + calculatedData.workFund;
                    updates['company_funds/growth'] = (currentFunds.growth || 0) + calculatedData.growthFund;
                    updates['company_funds/emergency'] = (currentFunds.emergency || 0) + calculatedData.emergencyFund;
                    updates['company_funds/social'] = (currentFunds.social || 0) + calculatedData.socialFund;

                    // 🚀 NAYA NAV SYSTEM: Calculate New Unit Price
                    let newNavPrice = currentPrice;
                    if (calculatedData.shareholderFund > 0 && totalGlobalAgu > 0) {
                        const currentTotalValue = totalGlobalAgu * currentPrice;
                        const newTotalValue = currentTotalValue + calculatedData.shareholderFund;
                        newNavPrice = newTotalValue / totalGlobalAgu;
                        
                        // Firebase mein naya price update hoga
                        updates['platform_settings/agu_price'] = newNavPrice;
                    }

                    // Master History (Graph aur Logs ke liye)
                    const distId = push(ref(db, 'master_distributions')).key;
                    updates[`master_distributions/${distId}`] = {
                        id: distId,
                        totalProfit: calculatedData.totalProfit,
                        shareholderFund: calculatedData.shareholderFund,
                        distributedAt: serverTimestamp(),
                        newUnitPrice: newNavPrice // History ke liye naya price save kiya gaya
                    };

                    await update(ref(db), updates);

                    Swal.fire('NAV Updated!', `AGU Unit Price is now ₹${newNavPrice.toFixed(3)}. Portfolios updated instantly.`, 'success');

                    // Reset
                    document.getElementById('dist-amount').value = '';
                    document.getElementById('dist-preview-card').classList.add('hidden');
                    document.getElementById('dist-empty-state').classList.remove('hidden');
                    calculatedData = null;
                    loadSystemData();

                } catch (error) {
                    console.error("Distribution Error: ", error);
                    Swal.fire('Error', 'Execution failed.', 'error');
                } finally {
                    executeBtn.innerHTML = originalBtnText;
                }
            }
        });
    });
};
