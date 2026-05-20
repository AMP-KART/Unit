// src/admin-funds.js
import { db } from './firebase.js';
import { ref, onValue, push, update, serverTimestamp, get, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

export const adminFundsHTML = `
    <div class="space-y-6 w-full max-w-6xl mx-auto pb-10">
        <div class="flex justify-between items-center hidden md:flex">
            <div>
                <h2 class="text-2xl font-black text-gray-800">Company Funds & Expenses</h2>
                <p class="text-xs text-gray-500 font-bold mt-1">Manage, Burn and Auto-split funds among Partners</p>
            </div>
            <div class="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100 shadow-sm">
                <i class="fa-solid fa-vault"></i> Expense Ledger
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-blue-300 transition-all">
                <div class="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-2.5 mb-2">
                        <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs"><i class="fa-solid fa-users"></i></div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Partners Payout (51%)</p>
                    </div>
                    <h3 class="text-2xl font-black text-gray-800 tracking-tight" id="bal-work">₹0</h3>
                </div>
                <button class="btn-burn-fund w-full bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-bold py-2 rounded-xl text-xs transition-all active:scale-95 z-10" data-cat="work">
                    <i class="fa-solid fa-hand-holding-dollar mr-1"></i> Distribute to 3 Partners
                </button>
            </div>

            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-green-300 transition-all">
                <div class="absolute -right-4 -top-4 w-16 h-16 bg-green-50 rounded-full"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-2.5 mb-2">
                        <div class="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs"><i class="fa-solid fa-arrow-trend-up"></i></div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Growth Fund (25%)</p>
                    </div>
                    <h3 class="text-2xl font-black text-gray-800 tracking-tight" id="bal-growth">₹0</h3>
                </div>
                <button class="btn-burn-fund w-full bg-green-50 hover:bg-green-600 hover:text-white text-green-600 font-bold py-2 rounded-xl text-xs transition-all active:scale-95 z-10" data-cat="growth">
                    <i class="fa-solid fa-fire-burner mr-1"></i> Burn Fund
                </button>
            </div>

            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-amber-300 transition-all">
                <div class="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-2.5 mb-2">
                        <div class="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs"><i class="fa-solid fa-kit-medical"></i></div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Emergency (5%)</p>
                    </div>
                    <h3 class="text-2xl font-black text-gray-800 tracking-tight" id="bal-emergency">₹0</h3>
                </div>
                <button class="btn-burn-fund w-full bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600 font-bold py-2 rounded-xl text-xs transition-all active:scale-95 z-10" data-cat="emergency">
                    <i class="fa-solid fa-fire-burner mr-1"></i> Burn Fund
                </button>
            </div>

            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-purple-300 transition-all">
                <div class="absolute -right-4 -top-4 w-16 h-16 bg-purple-50 rounded-full"></div>
                <div class="relative z-10">
                    <div class="flex items-center gap-2.5 mb-2">
                        <div class="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs"><i class="fa-solid fa-hand-holding-heart"></i></div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Social/Soc (1%)</p>
                    </div>
                    <h3 class="text-2xl font-black text-gray-800 tracking-tight" id="bal-social">₹0</h3>
                </div>
                <button class="btn-burn-fund w-full bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-600 font-bold py-2 rounded-xl text-xs transition-all active:scale-95 z-10" data-cat="social">
                    <i class="fa-solid fa-fire-burner mr-1"></i> Burn Fund
                </button>
            </div>
        </div>

        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mt-6">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 pb-4 mb-5 gap-4">
                <div class="flex bg-gray-100 rounded-xl p-1 w-full md:w-auto" id="funds-history-tabs">
                    <button class="fund-tab-btn active w-full md:w-auto bg-adminPrimary text-white shadow-sm rounded-lg text-xs font-black px-4 py-2.5 transition-all" data-target="expense-log-wrapper">
                        <i class="fa-solid fa-arrow-up-from-bracket mr-1.5"></i> Expense Log (Burn History)
                    </button>
                    <button class="fund-tab-btn w-full md:w-auto text-gray-500 hover:text-gray-800 rounded-lg text-xs font-black px-4 py-2.5 transition-all" data-target="income-log-wrapper">
                        <i class="fa-solid fa-arrow-down-long mr-1.5"></i> Distribution Log (Inflow)
                    </button>
                </div>

                <button id="btn-export-pdf" class="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-red-100 shadow-sm flex items-center gap-2">
                    <i class="fa-solid fa-file-pdf"></i> Download PDF
                </button>
            </div>

            <div id="expense-log-wrapper" class="fund-tab-content space-y-3">
                <div class="overflow-x-auto no-scrollbar rounded-xl border border-gray-100 bg-gray-50/50">
                    <table class="w-full text-left border-collapse" id="expense-table">
                        <thead class="bg-white border-b border-gray-100 sticky top-0 shadow-sm">
                            <tr>
                                <th class="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                                <th class="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                <th class="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expense Reason/Notes</th>
                                <th class="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Amount Spent</th>
                                <th class="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="expense-history-tbody" class="divide-y divide-gray-100">
                            <tr>
                                <td colspan="5" class="py-8 text-center text-sm text-gray-400 font-medium">
                                    <i class="fa-solid fa-spinner fa-spin mr-2 text-adminPrimary"></i> Loading expense data...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="income-log-wrapper" class="fund-tab-content space-y-3 hidden">
                <div class="overflow-x-auto no-scrollbar rounded-xl border border-gray-100 bg-gray-50/50">
                    <table class="w-full text-left border-collapse" id="income-table">
                        <thead class="bg-white border-b border-gray-100 sticky top-0 shadow-sm">
                            <tr>
                                <th class="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Distribution Date</th>
                                <th class="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Total Split Profit</th>
                                <th class="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Work (51%)</th>
                                <th class="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Growth (25%)</th>
                                <th class="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Emergency (5%)</th>
                                <th class="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Social (1%)</th>
                            </tr>
                        </thead>
                        <tbody id="income-history-tbody" class="divide-y divide-gray-100">
                            <tr>
                                <td colspan="6" class="py-8 text-center text-sm text-gray-400 font-medium">
                                    <i class="fa-solid fa-spinner fa-spin mr-2 text-adminPrimary"></i> Loading inflow data...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
`;

export const setupAdminFundsEvents = () => {
    const companyFundsRef = ref(db, 'company_funds');
    const expensesRef = ref(db, 'fund_expenses');
    const masterDistRef = ref(db, 'master_distributions');

    let availableBalances = { work: 0, growth: 0, emergency: 0, social: 0 };
    let currentTab = 'expense'; // expense or income

    // 1. Tab Switching Management Code
    document.querySelectorAll('.fund-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.fund-tab-btn').forEach(b => {
                b.classList.remove('bg-adminPrimary', 'text-white', 'shadow-sm');
                b.classList.add('text-gray-500');
            });
            e.currentTarget.classList.add('bg-adminPrimary', 'text-white', 'shadow-sm');
            e.currentTarget.classList.remove('text-gray-500');

            document.querySelectorAll('.fund-tab-content').forEach(c => c.classList.add('hidden'));
            const targetId = e.currentTarget.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');

            currentTab = targetId === 'expense-log-wrapper' ? 'expense' : 'income';
        });
    });

    // 2. Export PDF Logic
    document.getElementById('btn-export-pdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');

        // Document Header
        doc.setFontSize(18);
        doc.setTextColor(15, 107, 63); // appGreen
        doc.text("AGU Admin - Funds Ledger", 40, 40);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 40, 55);

        let tableId = currentTab === 'expense' ? '#expense-table' : '#income-table';

        doc.autoTable({
            html: tableId,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [15, 107, 63], textColor: 255, fontSize: 8, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8 },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            columns: currentTab === 'expense' ? [0, 1, 2, 3] : null // Exclude action column in Expense tab
        });

        doc.save(`AGU_${currentTab}_Ledger_${new Date().getTime()}.pdf`);
    });

    // 3. Fetch Real-time Available Fund Balances
    onValue(companyFundsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            availableBalances.work = parseFloat(data.work || 0);
            availableBalances.growth = parseFloat(data.growth || 0);
            availableBalances.emergency = parseFloat(data.emergency || 0);
            availableBalances.social = parseFloat(data.social || 0);
        } else {
            availableBalances = { work: 0, growth: 0, emergency: 0, social: 0 };
        }

        document.getElementById('bal-work').innerText = "₹" + availableBalances.work.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        document.getElementById('bal-growth').innerText = "₹" + availableBalances.growth.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        document.getElementById('bal-emergency').innerText = "₹" + availableBalances.emergency.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        document.getElementById('bal-social').innerText = "₹" + availableBalances.social.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    });

    // 4. Realtime Expense Log Rendering (With Edit & Delete)
    onValue(expensesRef, (snapshot) => {
        const tbody = document.getElementById('expense-history-tbody');
        if (!tbody) return;

        if (!snapshot.exists()) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">No fund expenses burned yet.</td></tr>`;
            return;
        }

        let logs = [];
        snapshot.forEach(child => {
            logs.push(child.val());
        });
        logs.sort((a, b) => b.timestamp - a.timestamp);

        tbody.innerHTML = logs.map(log => {
            let catBadgeColors = {
                work: 'bg-blue-50 text-blue-700 border-blue-100',
                growth: 'bg-green-50 text-green-700 border-green-100',
                emergency: 'bg-amber-50 text-amber-700 border-amber-100',
                social: 'bg-purple-50 text-purple-700 border-purple-100'
            };

            return `
                <tr class="hover:bg-white/80 transition-colors">
                    <td class="py-3 px-4 text-[10px] font-bold text-gray-700">${new Date(log.timestamp).toLocaleString('en-IN')}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase border ${catBadgeColors[log.category] || 'bg-gray-100'}">${log.category}</span>
                    </td>
                    <td class="py-3 px-4 text-xs text-gray-600 font-medium">${log.reason}</td>
                    <td class="py-3 px-4 text-xs font-black text-red-600 text-right">- ₹${log.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td class="py-3 px-4 text-center">
                        <button class="btn-edit-expense text-blue-500 hover:text-blue-700 mr-3 transition-colors" data-id="${log.id}" data-cat="${log.category}" data-amt="${log.amount}" data-reason="${log.reason}">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-delete-expense text-red-500 hover:text-red-700 transition-colors" data-id="${log.id}" data-cat="${log.category}" data-amt="${log.amount}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach Action Events
        document.querySelectorAll('.btn-edit-expense').forEach(btn => btn.addEventListener('click', handleEditExpense));
        document.querySelectorAll('.btn-delete-expense').forEach(btn => btn.addEventListener('click', handleDeleteExpense));
    });

    // 5. Distribution log rendering
    onValue(masterDistRef, (snapshot) => {
        const tbody = document.getElementById('income-history-tbody');
        if (!tbody) return;

        if (!snapshot.exists()) {
            tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">No profit distribution runs detected.</td></tr>`;
            return;
        }

        let list = [];
        snapshot.forEach(child => {
            list.push(child.val());
        });
        list.sort((a, b) => b.distributedAt - a.distributedAt);

        tbody.innerHTML = list.map(d => {
            const dateStr = d.distributedAt ? new Date(d.distributedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown';
            const total = d.totalProfit || 0;
            return `
                <tr class="hover:bg-white/80 transition-colors text-center text-xs">
                    <td class="py-3 px-4 text-left font-bold text-gray-700">${dateStr}</td>
                    <td class="py-3 px-4 font-black text-adminPrimary">₹${total.toLocaleString('en-IN')}</td>
                    <td class="py-3 px-4 text-gray-500 font-bold">₹${(total * 0.51).toFixed(1)}</td>
                    <td class="py-3 px-4 text-gray-500 font-bold">₹${(total * 0.25).toFixed(1)}</td>
                    <td class="py-3 px-4 text-gray-500 font-bold">₹${(total * 0.05).toFixed(1)}</td>
                    <td class="py-3 px-4 text-gray-500 font-bold text-right">₹${(total * 0.01).toFixed(1)}</td>
                </tr>
            `;
        }).join('');
    });

    // --- SMART BURN / SPLIT ACTION TRIGGERS ---
    document.querySelectorAll('.btn-burn-fund').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.currentTarget.getAttribute('data-cat');
            const limit = availableBalances[category];

            if (limit <= 0) {
                Swal.fire({ icon: 'error', title: 'Zero Balance', text: `This ${category} account does not have any active funds to execute.`, confirmButtonColor: '#0F6B3F' });
                return;
            }

            // NAYA LOGIC: If Work Fund (Partner Split 3-Ways)
            if (category === 'work') {
                Swal.fire({
                    title: `Split Work Fund (Partners)`,
                    html: `
                        <div class="text-left space-y-3 mt-2">
                            <p class="text-xs text-blue-600 font-bold bg-blue-50 p-2 rounded border border-blue-100">Amount will be divided equally among: Amit Kumar, Mithlesh Sahni, Prince Kumar.</p>
                            <div>
                                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Payout Amount (Max: ₹${limit.toFixed(2)})</label>
                                <input type="number" id="swal-burn-amount" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-black text-gray-800 text-center text-xl" placeholder="e.g. 300">
                            </div>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: '<i class="fa-solid fa-users"></i> Split Equally',
                    confirmButtonColor: '#2563EB', // Blue for work fund
                    preConfirm: () => {
                        const amt = parseFloat(document.getElementById('swal-burn-amount').value);
                        if (!amt || amt <= 0) { Swal.showValidationMessage('Please specify a positive amount.'); return false; }
                        if (amt > limit) { Swal.showValidationMessage(`Insufficient fund balance. Limit is ₹${limit.toFixed(2)}`); return false; }
                        return amt;
                    }
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const totalAmt = result.value;
                        const splitAmt = totalAmt / 3;
                        const partners = ["Amit Kumar", "Mithlesh Sahni", "Prince Kumar"];

                        Swal.fire({ title: 'Processing Split...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

                        try {
                            const updates = {};
                            updates[`company_funds/work`] = limit - totalAmt; // Deduct total

                            // Create 3 separate entries
                            partners.forEach(partner => {
                                const newExpRef = push(ref(db, 'fund_expenses'));
                                updates[`fund_expenses/${newExpRef.key}`] = {
                                    id: newExpRef.key,
                                    category: 'work',
                                    amount: splitAmt,
                                    reason: `Partner Payout: ${partner}`,
                                    timestamp: serverTimestamp()
                                };
                            });

                            await update(ref(db), updates);
                            Swal.fire('Split Successful!', `₹${totalAmt} divided as ₹${splitAmt.toFixed(2)} to each partner.`, 'success');

                        } catch (err) {
                            Swal.fire('Transaction Failed', 'Firebase operational error.', 'error');
                        }
                    }
                });
            } 
            // Normal Burn Fund (Growth, Emergency, Social)
            else {
                Swal.fire({
                    title: `Burn ${category.toUpperCase()} Fund`,
                    html: `
                        <div class="text-left space-y-3 mt-2">
                            <div>
                                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Expense Burn Amount (Max: ₹${limit.toFixed(2)})</label>
                                <input type="number" id="swal-burn-amount" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all font-black text-gray-800" placeholder="Enter Amount to Spend">
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Reason / Expense Purpose Tag</label>
                                <input type="text" id="swal-burn-reason" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all font-medium text-gray-700" placeholder="e.g. Server Bill, Marketing Spends">
                            </div>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: '🔥 Execute Burn Log',
                    confirmButtonColor: '#DC2626',
                    cancelButtonText: 'Cancel',
                    preConfirm: () => {
                        const amtStr = document.getElementById('swal-burn-amount').value;
                        const reason = document.getElementById('swal-burn-reason').value.trim();
                        const amt = parseFloat(amtStr);

                        if (!amt || amt <= 0) { Swal.showValidationMessage('Please specify a positive amount.'); return false; }
                        if (amt > limit) { Swal.showValidationMessage(`Insufficient fund balance. Limit is ₹${limit.toFixed(2)}`); return false; }
                        if (!reason || reason.length < 3) { Swal.showValidationMessage('Please write a clear description (min 3 chars).'); return false; }

                        return { amount: amt, reason: reason };
                    }
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        Swal.fire({ title: 'Processing Burn...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

                        try {
                            const finalUpdatedBalance = limit - result.value.amount;
                            const updates = {};
                            updates[`company_funds/${category}`] = finalUpdatedBalance;

                            const newExpRef = push(ref(db, 'fund_expenses'));
                            updates[`fund_expenses/${newExpRef.key}`] = {
                                id: newExpRef.key,
                                category: category,
                                amount: result.value.amount,
                                reason: result.value.reason,
                                timestamp: serverTimestamp()
                            };

                            await update(ref(db), updates);
                            Swal.fire('Fund Burned!', `₹${result.value.amount} tracked to ${category}.`, 'success');

                        } catch (err) {
                            Swal.fire('Transaction Failed', 'Firebase operational error.', 'error');
                        }
                    }
                });
            }
        });
    });

    // --- NAYA: DELETE EXPENSE LOGIC (Auto Refund) ---
    function handleDeleteExpense(e) {
        const id = e.currentTarget.getAttribute('data-id');
        const cat = e.currentTarget.getAttribute('data-cat');
        const amt = parseFloat(e.currentTarget.getAttribute('data-amt'));

        Swal.fire({
            title: 'Delete Expense Entry?',
            text: `This will delete the expense and refund ₹${amt} back to the ${cat} fund.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            confirmButtonText: 'Yes, Delete & Refund'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    Swal.fire({ title: 'Refunding...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

                    const snap = await get(ref(db, `company_funds/${cat}`));
                    const currentBal = snap.exists() ? parseFloat(snap.val()) : 0;

                    const updates = {};
                    updates[`company_funds/${cat}`] = currentBal + amt; // Add money back
                    updates[`fund_expenses/${id}`] = null; // Delete entry

                    await update(ref(db), updates);
                    Swal.fire('Refunded!', 'Expense deleted and funds restored.', 'success');
                } catch (error) {
                    Swal.fire('Error', 'Failed to delete expense.', 'error');
                }
            }
        });
    }

    // --- NAYA: EDIT EXPENSE LOGIC ---
    function handleEditExpense(e) {
        const id = e.currentTarget.getAttribute('data-id');
        const cat = e.currentTarget.getAttribute('data-cat');
        const oldAmt = parseFloat(e.currentTarget.getAttribute('data-amt'));
        const oldReason = e.currentTarget.getAttribute('data-reason');

        Swal.fire({
            title: 'Edit Expense',
            html: `
                <div class="text-left space-y-3 mt-2">
                    <div>
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Update Amount (Old: ₹${oldAmt})</label>
                        <input type="number" id="edit-burn-amt" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value="${oldAmt}">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Update Reason</label>
                        <input type="text" id="edit-burn-reason" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value="${oldReason}">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Update Entry',
            confirmButtonColor: '#0F6B3F',
            preConfirm: () => {
                const newAmt = parseFloat(document.getElementById('edit-burn-amt').value);
                const newReason = document.getElementById('edit-burn-reason').value.trim();

                if (!newAmt || newAmt <= 0) { Swal.showValidationMessage('Invalid amount.'); return false; }
                if (!newReason) { Swal.showValidationMessage('Reason required.'); return false; }
                return { newAmt, newReason };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    Swal.fire({ title: 'Updating Ledger...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

                    const { newAmt, newReason } = result.value;
                    const diff = newAmt - oldAmt; // Difference calc (agar zayada kharch likha toh aur balance katega, kam kiya toh refund hoga)

                    const snap = await get(ref(db, `company_funds/${cat}`));
                    const currentBal = snap.exists() ? parseFloat(snap.val()) : 0;

                    if (diff > 0 && currentBal < diff) {
                        Swal.fire('Insufficient Funds', 'Not enough balance to increase expense amount.', 'error');
                        return;
                    }

                    const updates = {};
                    updates[`company_funds/${cat}`] = currentBal - diff; // Adjust balance
                    updates[`fund_expenses/${id}/amount`] = newAmt;
                    updates[`fund_expenses/${id}/reason`] = newReason;

                    await update(ref(db), updates);
                    Swal.fire('Updated!', 'Expense ledger adjusted successfully.', 'success');
                } catch (error) {
                    Swal.fire('Error', 'Failed to update expense.', 'error');
                }
            }
        });
    }
};