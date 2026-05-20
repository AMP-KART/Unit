// Login Page Component
export const renderLogin = (container) => {
    container.innerHTML = `
        <div class="min-h-screen p-6 flex flex-col justify-center animate-fade-in">
            <div class="mb-10 text-center">
                <img src="public/images/logo.png" alt="AGU Logo" class="w-20 h-20 mx-auto mb-4">
                <h2 class="text-2xl font-extrabold text-appGreen">Welcome Back</h2>
                <p class="text-gray-500 text-sm">Securely access your AGU Dashboard</p>
            </div>

            <div class="premium-card p-6" id="login-card">
                <div class="space-y-5">
                    <div class="relative">
                        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email / Mobile</label>
                        <div class="flex items-center mt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus-within:border-appGreen transition-all">
                            <i class="fa-solid fa-user text-gray-400 mr-3"></i>
                            <input type="text" placeholder="Enter your detail" class="bg-transparent w-full outline-none text-appText font-medium placeholder:text-gray-300">
                        </div>
                    </div>

                    <div class="relative">
                        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                        <div class="flex items-center mt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus-within:border-appGreen transition-all">
                            <i class="fa-solid fa-lock text-gray-400 mr-3"></i>
                            <input type="password" placeholder="••••••••" class="bg-transparent w-full outline-none text-appText font-medium placeholder:text-gray-300">
                            <i class="fa-solid fa-eye-slash text-gray-400 cursor-pointer"></i>
                        </div>
                    </div>

                    <div class="text-right">
                        <a href="#" class="text-xs font-bold text-appGreen hover:text-appGold transition-colors">Forgot Password?</a>
                    </div>

                    <button class="w-full bg-appGreen text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/10 flex items-center justify-center gap-2 mt-2">
                        Login Securely
                    </button>

                    <button id="btn-biometric-login-comp" class="w-full mt-3 bg-white text-gray-700 border border-gray-200 font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all">
                        <i class="fa-solid fa-fingerprint text-lg text-appGreen animate-pulse"></i> Login with Fingerprint
                    </button>
                </div>

                <div class="flex items-center my-8">
                    <div class="flex-grow h-[1px] bg-gray-100"></div>
                    <span class="px-4 text-xs text-gray-300 font-bold uppercase tracking-widest">Or Login With</span>
                    <div class="flex-grow h-[1px] bg-gray-100"></div>
                </div>

                <div class="flex gap-4">
                    <button class="flex-1 flex items-center justify-center py-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" class="w-5 h-5 mr-2">
                        <span class="text-sm font-bold text-gray-600">Google</span>
                    </button>
                </div>
            </div>

            <p class="text-center mt-8 text-sm text-gray-500">
                Don't have an account? 
                <button id="btn-go-signup" class="text-appGreen font-bold hover:underline">Join Now</button>
            </p>
        </div>
    `;

    // Animation for the card
    gsap.from("#login-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    });

    // NAYA: Component level biometric click trigger logic
    const btnBioComp = document.getElementById('btn-biometric-login-comp');
    if (btnBioComp) {
        btnBioComp.addEventListener('click', () => {
            // Dynamically load biometric module handler on demand
            import('./biometric.js').then(module => {
                // Global navigateTo function ko call kiya background authentication ke liye
                const nav = window.navigateTo || (() => window.location.reload());
                module.loginWithBiometric(nav);
            });
        });
    }
};
