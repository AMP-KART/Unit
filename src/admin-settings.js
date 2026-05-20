// src/admin-settings.js
import { auth, db } from './firebase.js';
import { ref, get, update, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { updatePassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

export const adminSettingsHTML = `
    <div class="space-y-6 w-full max-w-4xl mx-auto pb-10">
        <div class="flex justify-between items-center hidden md:flex mb-6">
            <div>
                <h2 class="text-2xl font-black text-gray-800">Platform Settings</h2>
                <p class="text-xs text-gray-500 font-bold mt-1">Configure global application variables and security</p>
            </div>
            <div class="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-gray-200 shadow-sm">
                <i class="fa-solid fa-sliders"></i> System Configuration
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div class="md:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h3 class="text-sm font-black text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <i class="fa-solid fa-server text-adminPrimary"></i> Global Variables
                </h3>
                
                <div class="space-y-5">
                    <div>
                        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Admin UPI ID (For Receiving Payments)</label>
                        <div class="relative mt-1">
                            <i class="fa-brands fa-google-pay absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="text" id="set-admin-upi" placeholder="e.g. 7903698180@ybl" class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none text-gray-800 font-bold focus:border-adminPrimary transition-all">
                        </div>
                        <p class="text-[10px] text-gray-400 mt-1 ml-1 font-medium">Jab user 'Add Funds' karega, toh yahi UPI ID usko dikhegi.</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">AGU Unit Price (₹)</label>
                            <input type="number" id="set-agu-price" placeholder="10" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-gray-800 font-bold focus:border-adminPrimary transition-all">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Minimum Withdrawal Limit (₹)</label>
                            <input type="number" id="set-min-withdraw" placeholder="100" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-gray-800 font-bold focus:border-adminPrimary transition-all">
                        </div>
                    </div>

                    <button id="btn-save-platform-settings" class="w-full bg-adminPrimary hover:bg-[#0a4d2c] text-white font-bold py-3.5 rounded-xl shadow-md mt-6 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-floppy-disk"></i> Save Configurations
                    </button>
                </div>
            </div>

            <div class="space-y-6">
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <i class="fa-solid fa-lock text-adminGold"></i> Security
                    </h3>
                    <div class="space-y-4">
                        <div>
                            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">New Password</label>
                            <input type="password" id="set-new-pass" placeholder="••••••••" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none text-gray-800 text-sm font-medium focus:border-adminGold transition-all">
                        </div>
                        <button id="btn-update-password" class="w-full bg-adminGold hover:bg-yellow-600 text-white font-bold py-2.5 rounded-xl shadow-sm transition-all active:scale-95 text-xs">
                            Update Password
                        </button>
                    </div>
                </div>

                <div class="bg-red-50 rounded-3xl shadow-sm border border-red-100 p-6">
                    <h3 class="text-sm font-black text-red-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <i class="fa-solid fa-triangle-exclamation"></i> Danger Zone
                    </h3>
                    <p class="text-[10px] font-bold text-red-400 mb-4 leading-relaxed">System ko puri tarah band karne ya maintenance mode me dalne ke liye.</p>
                    
                    <button class="w-full bg-white text-red-600 border border-red-200 font-bold py-2.5 rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all active:scale-95 text-xs flex justify-center items-center gap-2" onclick="Swal.fire('Coming Soon', 'Maintenance mode feature will be added soon.', 'info')">
                        <i class="fa-solid fa-power-off"></i> Enable Maintenance
                    </button>
                </div>
            </div>

        </div>
    </div>
`;

export const setupAdminSettingsEvents = () => {
    const adminUpiInput = document.getElementById('set-admin-upi');
    const aguPriceInput = document.getElementById('set-agu-price');
    const minWithdrawInput = document.getElementById('set-min-withdraw');

    // 1. Fetch Current Settings
    const settingsRef = ref(db, 'platform_settings');
    onValue(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            if(data.adminUpi) adminUpiInput.value = data.adminUpi;
            if(data.aguPrice) aguPriceInput.value = data.aguPrice;
            if(data.minWithdraw) minWithdrawInput.value = data.minWithdraw;
        } else {
            // Default Values agar pehli baar khule
            adminUpiInput.value = '7903698180@ybl';
            aguPriceInput.value = '10';
            minWithdrawInput.value = '100';
        }
    }, { onlyOnce: true });

    // 2. Save Platform Settings
    document.getElementById('btn-save-platform-settings').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        try {
            await update(ref(db, 'platform_settings'), {
                adminUpi: adminUpiInput.value.trim(),
                aguPrice: parseFloat(aguPriceInput.value) || 10,
                minWithdraw: parseFloat(minWithdrawInput.value) || 100,
                updatedAt: new Date().toISOString()
            });
            Swal.fire({icon: 'success', title: 'Saved!', text: 'Platform settings updated successfully.', timer: 1500, showConfirmButton: false});
        } catch (error) {
            Swal.fire('Error', 'Failed to save settings.', 'error');
        } finally {
            btn.innerHTML = originalText;
        }
    });

    // 3. Update Password
    document.getElementById('btn-update-password').addEventListener('click', async (e) => {
        const newPass = document.getElementById('set-new-pass').value.trim();
        if(newPass.length < 6) {
            Swal.fire({icon: 'warning', title: 'Weak Password', text: 'Password must be at least 6 characters.', confirmButtonColor: '#D4A017'});
            return;
        }

        const btn = e.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

        try {
            const user = auth.currentUser;
            if(user) {
                await updatePassword(user, newPass);
                Swal.fire({icon: 'success', title: 'Password Updated', text: 'Your admin password has been changed.', timer: 1500, showConfirmButton: false});
                document.getElementById('set-new-pass').value = '';
            }
        } catch (error) {
            // Re-auth needed error handling
            if (error.code === 'auth/requires-recent-login') {
                Swal.fire('Session Expired', 'Please logout and login again to change your password.', 'error');
            } else {
                Swal.fire('Error', error.message, 'error');
            }
        } finally {
            btn.innerHTML = originalText;
        }
    });
};