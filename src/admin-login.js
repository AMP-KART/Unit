// src/admin-login.js
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// NAYA: Aapki Master Admin UID
const ADMIN_UID = "2OcCMmUcVORQyXMMXuk94rLwP1G2";

export const adminLoginHTML = `
    <div class="w-full h-screen flex items-center justify-center bg-adminSidebar relative overflow-hidden">
        <div class="absolute w-[500px] h-[500px] bg-adminPrimary rounded-full blur-[120px] opacity-20 -top-20 -left-20"></div>
        <div class="absolute w-[400px] h-[400px] bg-adminGold rounded-full blur-[100px] opacity-10 bottom-10 right-10"></div>
        
        <div class="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md z-10 mx-4 border border-gray-100">
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-adminPrimary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
                    <i class="fa-solid fa-shield-halved text-3xl"></i>
                </div>
                <h2 class="text-2xl font-black text-gray-800 tracking-tight">Admin Portal</h2>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">AMP Growth Units</p>
            </div>

            <div class="space-y-5">
                <div>
                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Admin Email</label>
                    <div class="relative mt-1">
                        <i class="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="email" id="admin-email" placeholder="admin@example.com" class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 outline-none text-sm font-medium focus:border-adminPrimary transition-colors">
                    </div>
                </div>
                
                <div>
                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Master Password</label>
                    <div class="relative mt-1">
                        <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="password" id="admin-password" placeholder="••••••••" class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 outline-none text-sm font-medium focus:border-adminPrimary transition-colors">
                    </div>
                </div>

                <button id="btn-admin-login" class="w-full bg-adminPrimary hover:bg-[#0a4d2c] text-white font-bold py-4 rounded-xl shadow-lg mt-4 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span>Secure Login</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
            
            <div class="mt-6 text-center">
                <p class="text-[10px] font-semibold text-gray-400"><i class="fa-solid fa-lock text-green-500 mr-1"></i> Unauthorized access is strictly prohibited.</p>
            </div>
        </div>
    </div>
`;

export const setupAdminLoginEvents = (initAdminAppCallback) => {
    const btnLogin = document.getElementById('btn-admin-login');
    
    btnLogin.addEventListener('click', async () => {
        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value.trim();

        if(!email || !password) {
            Swal.fire({icon: 'warning', title: 'Details Required', text: 'Enter email and password.', confirmButtonColor: '#0F6B3F'});
            return;
        }

        const originalText = btnLogin.innerHTML;
        btnLogin.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking Systems...';

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // STRICT SECURITY CHECK
            if (user.uid !== ADMIN_UID) {
                // Agar UID match nahi hui, toh turant logout karo
                await auth.signOut();
                Swal.fire({
                    icon: 'error', 
                    title: 'Access Denied', 
                    text: 'You do not have administrative privileges.', 
                    confirmButtonColor: '#d33'
                });
            } else {
                Swal.fire({icon: 'success', title: 'Welcome Admin', text: 'Authentication successful.', showConfirmButton: false, timer: 1500});
                setTimeout(() => {
                    initAdminAppCallback(); // Login success hone par dashboard kholenge
                }, 1000);
            }
        } catch (error) {
            Swal.fire({icon: 'error', title: 'Login Failed', text: error.message.replace('Firebase: ', ''), confirmButtonColor: '#d33'});
        } finally {
            btnLogin.innerHTML = originalText;
        }
    });
};
