// src/app.js

// --- TOP IMPORTS ---
import { auth, db, googleProvider } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { ref, set, get, child, serverTimestamp, query, orderByChild, equalTo, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Local Component Imports
import { buyAguHTML, setupBuyAguEvents } from './buy-agu.js';
// NAYA: Analytics file import yahan se hamesha ke liye hata diya gaya hai
import { withdrawHTML, setupWithdrawEvents } from './withdraw.js';
import { profileHTML, setupProfileEvents } from './profile.js';
import { portfolioHTML, setupPortfolioEvents } from './portfolio.js';
import { notificationHTML, setupNotificationEvents } from './notification.js';
// NAYA: Biometric Functions Import kiye gaye
import { loginWithBiometric } from './biometric.js';
import { historyHTML, setupHistoryEvents } from './history.js';

const appContainer = document.getElementById('app');

const navigateTo = (viewHTML, setupEvents) => {
    const currentWrapper = appContainer.firstElementChild;

    // Fade Out logic: Footer ko exclude karo
    const outElements = currentWrapper ? Array.from(currentWrapper.children).filter(el => !(typeof el.className === 'string' && el.className.includes('fixed bottom'))) : appContainer.children;

    gsap.to(outElements, {
        opacity: 0,
        y: -15,
        duration: 0.2,
        onComplete: () => {
            appContainer.innerHTML = viewHTML;

            const newWrapper = appContainer.firstElementChild;

            // Fade In logic
            const inElements = newWrapper ? Array.from(newWrapper.children).filter(el => !(typeof el.className === 'string' && el.className.includes('fixed bottom'))) : appContainer.children;

            gsap.from(inElements, { y: 15, opacity: 0, duration: 0.3, ease: "power2.out", stagger: 0.03 });
            if (setupEvents) setupEvents();
        }
    });
};

// --- 1. SPLASH SCREEN ---
const splashHTML = `
    <div class="flex flex-col items-center justify-center min-h-screen p-6 text-center relative overflow-hidden bg-appBg">
        <div class="absolute top-[-10%] left-[-10%] w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-30"></div>

        <div class="p-8 w-full relative z-10 flex flex-col justify-between min-h-[80vh]" id="splash-card">
            <div class="my-auto space-y-6">
                <div class="relative inline-block">
                    <div class="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50 scale-125"></div>
                    <img src="public/images/logo.png" alt="AGU Logo" class="w-36 h-36 mx-auto drop-shadow-2xl object-contain relative z-10 animate-bounce" style="animation-duration: 4s;">
                </div>
                <div>
                    <h1 class="text-3xl font-extrabold text-appGreen tracking-tight">AMP Growth Units</h1>
                    <p class="text-[10px] font-black uppercase tracking-[0.25em] text-appGold mt-1">Community Participation</p>
                </div>
                <p class="text-xs text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                    Empowering community partnerships with safe, real-time tracking and transparent profit distribution.
                </p>
            </div>

            <div class="space-y-3 w-full mt-auto">
                <button id="btn-get-started" class="w-full bg-appGreen text-white font-bold py-4 px-4 rounded-2xl shadow-[0_8px_25px_rgba(20,83,45,0.25)] text-base hover:bg-green-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <span>Get Started</span>
                    <i class="fa-solid fa-arrow-right text-sm"></i>
                </button>

                <button id="btn-learn-more" class="w-full text-appGreen font-extrabold py-3 text-sm hover:text-green-800 transition-colors flex items-center justify-center gap-1.5 active:scale-95">
                    <i class="fa-solid fa-book-open text-xs"></i>
                    <span>Learn How it Works</span>
                </button>
            </div>
        </div>

        <div id="learn-more-sheet" class="fixed inset-0 bg-black/40 z-50 opacity-0 pointer-events-none transition-opacity duration-300 flex items-end justify-center">
            <div id="sheet-content" class="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] transform translate-y-full transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto no-scrollbar">

                <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5 cursor-pointer" id="btn-close-sheet-handle"></div>

                <div class="flex justify-between items-center mb-6">
                    <div class="text-left">
                        <h3 class="text-xl font-black text-appText tracking-tight">How AGU Works</h3>
                        <p class="text-[10px] font-bold text-appGold uppercase tracking-wider mt-0.5">Platform Benefits & Features</p>
                    </div>
                    <button id="btn-close-sheet" class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="space-y-4 text-left">
                    <div class="flex items-start gap-4 p-4 bg-gray-50/70 border border-gray-100 rounded-2xl">
                        <div class="w-10 h-10 shrink-0 rounded-xl bg-green-50 text-appLightGreen flex items-center justify-center text-lg shadow-sm">
                            <i class="fa-solid fa-chart-line"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-gray-800">Live NAV Tracking</h4>
                            <p class="text-xs text-gray-400 font-semibold mt-0.5 leading-relaxed">Track global unit prices dynamically with real-time analytics. Instant evaluation for buy and liquidations.</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-4 p-4 bg-gray-50/70 border border-gray-100 rounded-2xl">
                        <div class="w-10 h-10 shrink-0 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shadow-sm">
                            <i class="fa-solid fa-chart-pie"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-gray-800">Community Profit Sharing</h4>
                            <p class="text-xs text-gray-400 font-semibold mt-0.5 leading-relaxed">System allocations seamlessly distribute enterprise yields to project category funds and stakeholders safely.</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-4 p-4 bg-gray-50/70 border border-gray-100 rounded-2xl">
                        <div class="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-sm">
                            <i class="fa-solid fa-fingerprint"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-gray-800">Bank-Grade Device Security</h4>
                            <p class="text-xs text-gray-400 font-semibold mt-0.5 leading-relaxed">Frictionless login validations utilizing native hardware credential scanners paired with secure Google authorization portals.</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-4 p-4 bg-gray-50/70 border border-gray-100 rounded-2xl">
                        <div class="w-10 h-10 shrink-0 rounded-xl bg-amber-50 text-appGold flex items-center justify-center text-lg shadow-sm">
                            <i class="fa-solid fa-vault"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-gray-800">Instant Liquidity Flows</h4>
                            <p class="text-xs text-gray-400 font-semibold mt-0.5 leading-relaxed">Enjoy smooth financial processing for wallet recharges via unified transaction gateways directly linked back into bank routes.</p>
                        </div>
                    </div>
                </div>

                <button id="btn-sheet-get-started" class="w-full mt-6 bg-appGreen text-white font-bold py-4 rounded-xl shadow-md text-sm transition-all active:scale-95">
                    Understood, Get Started
                </button>
            </div>
        </div>
    </div>
`;

// --- 2. LOGIN SCREEN ---
const loginHTML = `
    <div class="min-h-screen p-6 flex flex-col justify-center">
        <div class="mb-10 text-center">
            <img src="public/images/logo.png" alt="AGU Logo" class="w-20 h-20 mx-auto mb-4">
            <h2 class="text-2xl font-extrabold text-appGreen">Welcome Back</h2>
            <p class="text-gray-500 text-sm">Securely access your AGU Dashboard</p>
        </div>

        <div class="premium-card p-6">
            <div class="space-y-4">
                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email ID</label>
                    <input type="text" id="login-email" placeholder="Enter your email" class="mt-1 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none text-appText font-medium focus:border-appGreen transition-all">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                    <input type="password" id="login-password" placeholder="••••••••" class="mt-1 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none text-appText font-medium focus:border-appGreen transition-all">
                </div>
                <div class="text-right">
                    <button id="btn-go-forgot" class="text-xs font-bold text-appGreen hover:text-appGold transition-colors">Forgot Password?</button>
                </div>
                <button id="btn-login-submit" class="w-full bg-appGreen text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/10 mt-2 hover:bg-green-800 transition-colors">
                    Login Securely
                </button>

                <button id="btn-biometric-login" class="w-full mt-3 bg-white text-appText border border-gray-200 font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all">
                    <i class="fa-solid fa-fingerprint text-lg text-appGreen animate-pulse"></i> Login with Fingerprint
                </button>
            </div>

            <div class="flex items-center my-6">
                <div class="flex-grow h-[1px] bg-gray-100"></div>
                <span class="px-4 text-xs text-gray-400 font-bold uppercase tracking-widest">Or Login With</span>
                <div class="flex-grow h-[1px] bg-gray-100"></div>
            </div>

            <button id="btn-google-login" class="w-full flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-appText font-bold transition-colors">
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
            </button>
        </div>

        <p class="text-center mt-8 text-sm text-gray-500">
            Don't have an account? <button id="btn-go-signup" class="text-appGreen font-bold hover:underline">Join Now</button>
        </p>
    </div>
`;

// --- 3. SIGNUP SCREEN ---
const signupHTML = `
    <div class="min-h-screen p-6 flex flex-col justify-center">
        <div class="mb-8 text-center">
            <h2 class="text-2xl font-extrabold text-appGreen">Create Account</h2>
            <p class="text-gray-500 text-sm">Join the AGU Community today</p>
        </div>

        <div class="premium-card p-6">
            <div class="space-y-4">
                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                    <input type="text" id="signup-name" placeholder="E.g. Prince Rama" class="mt-1 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none text-appText font-medium focus:border-appGreen transition-all">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mobile Number</label>
                    <input type="tel" id="signup-phone" placeholder="e.g. 7903698180" class="mt-1 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none text-appText font-medium focus:border-appGreen transition-all">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email ID</label>
                    <input type="email" id="signup-email" placeholder="name@example.com" class="mt-1 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none text-appText font-medium focus:border-appGreen transition-all">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Set Password</label>
                    <input type="password" id="signup-password" placeholder="••••••••" class="mt-1 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none text-appText font-medium focus:border-appGreen transition-all">
                </div>

                <button id="btn-signup-submit" class="w-full bg-appGreen text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/10 mt-4 hover:bg-green-800 transition-colors">
                    Create Account
                </button>
            </div>
        </div>

        <p class="text-center mt-6 text-sm text-gray-500">
            Already have an account? <button id="btn-go-login" class="text-appGreen font-bold hover:underline">Login here</button>
        </p>
    </div>
`;

// --- 4. FORGOT PASSWORD SCREEN ---
const forgotHTML = `
    <div class="min-h-screen p-6 flex flex-col justify-center">
        <div class="mb-6 text-center">
            <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                <svg class="w-8 h-8 text-appGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
            </div>
            <h2 class="text-2xl font-extrabold text-appGreen">Reset Password</h2>
        </div>

        <div class="premium-card p-6 space-y-6">

            <div class="border-b border-gray-100 pb-5">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Forgot Email? Find by Mobile</label>
                <div class="flex gap-2 mt-1">
                    <input type="tel" id="search-phone" placeholder="Enter Mobile Number" class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none text-appText font-medium focus:border-appGreen transition-all">
                    <button id="btn-search-email" class="bg-appGreen text-white px-5 rounded-xl shadow-md hover:bg-green-800 transition-colors flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </button>
                </div>

                <div id="found-email-container" class="hidden mt-3 bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                    <span id="found-email-text" class="text-sm font-bold text-appGreen truncate"></span>
                    <button id="btn-copy-email" class="text-appGreen hover:text-appGold px-2 py-1 bg-white rounded shadow-sm text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                        Copy
                    </button>
                </div>
            </div>

            <div>
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Send Password Reset Link</label>
                <input type="email" id="forgot-email" placeholder="Enter Email ID" class="mt-1 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none text-appText font-medium focus:border-appGreen transition-all">

                <button id="btn-forgot-submit" class="w-full bg-appGreen text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/10 mt-4 hover:bg-green-800 transition-colors">
                    Send Reset Link
                </button>
            </div>
        </div>

        <p class="text-center mt-8 text-sm text-gray-500">
            Remember your password? <button id="btn-back-login" class="text-appGreen font-bold hover:underline">Back to Login</button>
        </p>
    </div>
`;

// --- 5. MAIN DASHBOARD SCREEN ---
const dashboardHTML = `
    <div class="min-h-screen bg-appBg pb-24">

        <div class="bg-white px-6 py-3 shadow-md rounded-b-3xl flex justify-between items-center z-50 sticky top-0 w-full backdrop-blur-md bg-white/95">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 shrink-0">
                    <img src="public/images/logo.png" alt="AMP Logo" class="w-full h-full object-contain">
                </div>
                <div>
                    <h2 class="text-base font-extrabold text-appGreen tracking-tight">AMP Growth Units</h2>
                    <p class="text-[8px] font-bold text-appGold uppercase tracking-widest mt-0.5">Powered by AMP KART</p>
                </div>
            </div>
            <button id="btn-dash-bell-notif" class="relative p-1.5 bg-gray-50 rounded-full text-gray-600 hover:text-appGreen transition-colors active:scale-95">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span id="dash-bell-red-dot" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white hidden"></span>
            </button>
        </div>

              <div class="px-5 mt-5 space-y-4">
            <div class="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
                <div class="p-5 pb-0 flex justify-between items-start">
                    <div>
                        <p class="text-[10px] font-bold text-appGreen uppercase tracking-wider mb-1 flex items-center gap-1.5"><i class="fa-solid fa-arrow-trend-up"></i> Live Unit Price (NAV)</p>
                        <h2 class="text-3xl font-black text-appText tracking-tight" id="dash-universal-value">₹10.000</h2>
                    </div>

                    <div class="flex flex-col items-end gap-1.5">
                        <div class="flex bg-gray-50 rounded-md p-0.5 border border-gray-100 shadow-inner" id="chart-time-filters">
                            <button class="filter-time-btn active bg-white text-appGreen shadow-sm rounded text-[9px] font-black px-2 py-1 transition-all" data-range="1M">1M</button>
                            <button class="filter-time-btn text-gray-400 hover:text-gray-600 rounded text-[9px] font-black px-2 py-1 transition-all" data-range="12M">1Y</button>
                            <button class="filter-time-btn text-gray-400 hover:text-gray-600 rounded text-[9px] font-black px-2 py-1 transition-all" data-range="24M">2Y</button>
                            <button class="filter-time-btn text-gray-400 hover:text-gray-600 rounded text-[9px] font-black px-2 py-1 transition-all" data-range="36M">3Y</button>
                            <button class="filter-time-btn text-gray-400 hover:text-gray-600 rounded text-[9px] font-black px-2 py-1 transition-all" data-range="ALL">ALL</button>
                        </div>

                        <div class="px-2 py-1 bg-green-50 rounded-lg text-appGreen text-[10px] font-bold flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                            <span id="dash-universal-growth" class="text-appGreen">...</span>
                        </div>
                    </div>
                </div>
                <div id="universal-chart" class="w-full h-44 mt-1"></div> 
            </div>

            <div class="bg-gradient-to-br from-[#0F6B3F] to-[#0a4d2c] rounded-3xl p-5 shadow-lg flex flex-col gap-4 text-white relative overflow-hidden">
                <div class="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

                <div class="flex justify-between items-start z-10">
                    <div>
                        <p class="text-[9px] text-green-200 font-bold uppercase tracking-wider mb-0.5">Invested Value</p>
                        <p class="text-xl font-bold" id="dash-invested-value">₹0</p>
                        <p class="text-[10px] text-green-100 mt-0.5"><span id="dash-invested-units">0.00</span> Units</p>
                    </div>
                    <div class="w-px h-10 bg-white/20 mx-2"></div>
                    <div class="text-right">
                        <p class="text-[9px] text-green-200 font-bold uppercase tracking-wider mb-0.5">Current Value</p>
                        <p class="text-xl font-black text-appGold" id="dash-current-value">₹0</p>
                        <p class="text-[10px] text-appGold mt-0.5"><span id="dash-current-units">0.00</span> Units</p>
                    </div>
                </div>

                <div class="w-full h-px bg-white/20 z-10"></div>

                <div class="flex justify-between items-center z-10">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </div>
                        <div>
                            <p class="text-[9px] text-green-200 font-bold uppercase tracking-wider">Liquid Wallet</p>
                            <p class="text-lg font-bold tracking-tight" id="dash-wallet-balance">₹0</p>
                        </div>
                    </div>
                    <button id="btn-dash-add-funds" class="w-8 h-8 bg-appGold hover:bg-yellow-500 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm text-white">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                </div>
            </div>
        </div>


        <div class="px-5 mt-8">
            <h3 class="text-sm font-bold text-appText mb-4 uppercase tracking-wider flex items-center gap-2">
                <svg class="w-4 h-4 text-appGold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                Top Investors
            </h3>
            <div id="dash-top-investors" class="space-y-3">
                <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex items-center justify-center h-24">
                    <p class="text-gray-400 text-sm font-medium"><i class="fa-solid fa-spinner fa-spin text-appGreen mr-2"></i>Loading leaderboard...</p>
                </div>
            </div>
        </div>

        <div class="px-5 mt-8">
            <h3 class="text-sm font-bold text-appText mb-4 uppercase tracking-wider flex justify-between items-center">
                Recent Activity
                <span id="btn-see-all-activity" class="text-[10px] text-appGold font-bold lowercase cursor-pointer hover:underline">see all</span>
            </h3>
            <div id="dash-recent-activity" class="space-y-3">
                <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex items-center justify-center h-32">
                    <p class="text-gray-400 text-sm font-medium"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading activity...</p>
                </div>
            </div>
        </div>

        <div class="fixed bottom-0 left-0 w-full max-w-md mx-auto bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.03)] px-5 py-3 flex justify-between items-end z-50 pb-4" style="left: 50%; transform: translateX(-50%);">
            <button class="flex flex-col items-center gap-1 text-appGreen w-12">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                <span class="text-[9px] font-bold">Home</span>
            </button>
            <button id="btn-footer-portfolio" class="flex flex-col items-center gap-1 text-gray-400 hover:text-appGreen transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <span class="text-[9px] font-bold">Portfolio</span>
            </button>

            <div class="relative -top-4">
                <button id="btn-footer-buy-agu" class="bg-gradient-to-br from-[#0F6B3F] to-[#16A34A] text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-[0_8px_15px_rgba(20,83,45,0.3)] hover:scale-105 transition-transform active:scale-95 border-4 border-[#F3F5F7]">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>

            <button id="btn-footer-history" class="flex flex-col items-center gap-1 text-gray-400 hover:text-appGreen transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span class="text-[9px] font-bold">History</span>
            </button>
            <button id="btn-go-profile" class="flex flex-col items-center gap-1 text-gray-400 hover:text-appGreen transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span class="text-[9px] font-bold">Profile</span>
            </button>
        </div>
    </div>
`;



// --- EVENT LISTENERS LOGIC ---

const setupSplashEvents = () => {
    document.getElementById('btn-get-started').addEventListener('click', () => navigateTo(loginHTML, setupLoginEvents));

    // NAYA: Bottom Sheet Open/Close UI Handling Programming
    const sheet = document.getElementById('learn-more-sheet');
    const content = document.getElementById('sheet-content');
    const btnLearn = document.getElementById('btn-learn-more');
    const btnClose = document.getElementById('btn-close-sheet');
    const btnCloseHandle = document.getElementById('btn-close-sheet-handle');
    const btnSheetStart = document.getElementById('btn-sheet-get-started');

    const openSheet = () => {
        sheet.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            content.classList.remove('translate-y-full');
        }, 50);
    };

    const closeSheet = () => {
        content.classList.add('translate-y-full');
        setTimeout(() => {
            sheet.classList.add('opacity-0', 'pointer-events-none');
        }, 300);
    };

    if (btnLearn) btnLearn.addEventListener('click', openSheet);
    if (btnClose) btnClose.addEventListener('click', closeSheet);
    if (btnCloseHandle) btnCloseHandle.addEventListener('click', closeSheet);

    // Tap outside to close logic
    if (sheet) {
        sheet.addEventListener('click', (e) => {
            if (e.target === sheet) closeSheet();
        });
    }

    // Sheet button leads straight to login configuration
    if (btnSheetStart) {
        btnSheetStart.addEventListener('click', () => {
            closeSheet();
            setTimeout(() => {
                navigateTo(loginHTML, setupLoginEvents);
            }, 300);
        });
    }
};

const setupLoginEvents = () => {
    document.getElementById('btn-go-signup').addEventListener('click', () => navigateTo(signupHTML, setupSignupEvents));
    document.getElementById('btn-go-forgot').addEventListener('click', () => navigateTo(forgotHTML, setupForgotEvents));

    // NAYA: Biometric Login Click Trigger Handler
    const btnBioLogin = document.getElementById('btn-biometric-login');
    if (btnBioLogin) {
        btnBioLogin.addEventListener('click', () => {
            loginWithBiometric(navigateTo, dashboardHTML, setupDashboardEvents);
        });
    }

    const btnLogin = document.getElementById('btn-login-submit');
    btnLogin.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if(!email || !password) {
            Swal.fire({ icon: 'warning', title: 'Missing Details', text: 'Please enter both email and password.', confirmButtonColor: '#14532D' });
            return;
        }

        const originalText = btnLogin.innerHTML;
        btnLogin.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Verifying...';

        try {
            await signInWithEmailAndPassword(auth, email, password);
            Swal.fire({ icon: 'success', title: 'Login Successful', text: 'Welcome to AGU Dashboard!', showConfirmButton: false, timer: 1500 });
            setTimeout(() => navigateTo(dashboardHTML, setupDashboardEvents), 1000);
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Login Failed', text: error.message.replace('Firebase: ', ''), confirmButtonColor: '#14532D' });
        } finally {
            btnLogin.innerHTML = originalText;
        }
    });

    const btnGoogle = document.getElementById('btn-google-login');
    if(btnGoogle) {
        btnGoogle.addEventListener('click', async () => {
            try {
                const result = await signInWithPopup(auth, googleProvider);
                const uid = result.user.uid;
                const userRef = ref(db, 'users/' + uid);

                // Pehle check karenge ki database mein user ka data hai ya nahi
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    // Purana User: Sirf lastLogin time update karo (Purana data aur funds delete nahi honge)
                    await set(ref(db, 'users/' + uid + '/lastLogin'), serverTimestamp());
                } else {
                    // Naya User: Pehli baar login kar raha hai toh naya profile set karo
                    await set(userRef, {
                        uid: uid,
                        fullName: result.user.displayName,
                        email: result.user.email,
                        role: "user",
                        kycStatus: "pending",
                        totalAGU: 0,
                        totalContribution: 0,
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp()
                    });
                }

                Swal.fire({ icon: 'success', title: 'Verified', text: 'Google Login Successful!', showConfirmButton: false, timer: 1500 });
                setTimeout(() => navigateTo(dashboardHTML, setupDashboardEvents), 1000);
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Authentication Failed', text: error.message, confirmButtonColor: '#14532D' });
            }
        });
    }
};

const setupSignupEvents = () => {
    document.getElementById('btn-go-login').addEventListener('click', () => navigateTo(loginHTML, setupLoginEvents));

    const btnSignup = document.getElementById('btn-signup-submit');
    btnSignup.addEventListener('click', async () => {
        const name = document.getElementById('signup-name').value.trim();
        const phone = document.getElementById('signup-phone').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();

        if(!name || !phone || !email || !password) {
            Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please fill all details to join.', confirmButtonColor: '#14532D' });
            return;
        }

        const originalText = btnSignup.innerHTML;
        btnSignup.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Creating Account...';

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await set(ref(db, 'users/' + user.uid), {
                uid: user.uid,
                fullName: name,
                phone: phone,
                email: email,
                role: "user",
                kycStatus: "pending",
                totalAGU: 0,
                totalContribution: 0,
                createdAt: serverTimestamp()
            });

            Swal.fire({ icon: 'success', title: 'Account Created!', text: 'Welcome to the AGU Community.', confirmButtonColor: '#14532D' }).then(() => {
                navigateTo(loginHTML, setupLoginEvents);
            });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Signup Failed', text: error.message.replace('Firebase: ', ''), confirmButtonColor: '#14532D' });
        } finally {
            btnSignup.innerHTML = originalText;
        }
    });
};

const setupForgotEvents = () => {
    document.getElementById('btn-back-login').addEventListener('click', () => navigateTo(loginHTML, setupLoginEvents));

    const btnSearchEmail = document.getElementById('btn-search-email');
    btnSearchEmail.addEventListener('click', async () => {
        const phone = document.getElementById('search-phone').value.trim();
        if(!phone) {
             Swal.fire({icon:'warning', title:'Mobile Required', text:'Please enter mobile number to search.', confirmButtonColor: '#14532D'});
             return;
        }

        btnSearchEmail.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
             const usersRef = ref(db, 'users');
             const q = query(usersRef, orderByChild('phone'), equalTo(phone));
             const snapshot = await get(q);

             if(snapshot.exists()) {
                 let foundEmail = '';
                 snapshot.forEach((childSnapshot) => {
                     foundEmail = childSnapshot.val().email;
                 });

                 document.getElementById('found-email-text').innerText = foundEmail;
                 document.getElementById('found-email-container').classList.remove('hidden');
                 document.getElementById('forgot-email').value = foundEmail;

             } else {
                 Swal.fire({icon:'error', title:'Not Found', text:'No account linked to this mobile number.', confirmButtonColor: '#14532D'});
                 document.getElementById('found-email-container').classList.add('hidden');
             }
        } catch(error) {
             console.error(error);
             Swal.fire({icon:'error', title:'Error', text:'Could not search database.', confirmButtonColor: '#14532D'});
        } finally {
             btnSearchEmail.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>';
        }
    });

    document.getElementById('btn-copy-email').addEventListener('click', () => {
        const emailToCopy = document.getElementById('found-email-text').innerText;

        const copyTextToClipboard = (text) => {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text);
            } else {
                let textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                return new Promise((res, rej) => {
                    document.execCommand('copy') ? res() : rej();
                    textArea.remove();
                });
            }
        };

        copyTextToClipboard(emailToCopy).then(() => {
            const copyBtn = document.getElementById('btn-copy-email');
            copyBtn.innerHTML = 'COPIED ✓';
            copyBtn.classList.add('bg-appGreen', 'text-white');
            copyBtn.classList.remove('text-appGreen', 'bg-white');

            setTimeout(() => {
                copyBtn.innerHTML = 'COPY';
                copyBtn.classList.remove('bg-appGreen', 'text-white');
                copyBtn.classList.add('text-appGreen', 'bg-white');
            }, 2000);
        }).catch(() => {
            Swal.fire({ icon: 'error', title: 'Oops', text: 'Copy failed. Please copy manually.', confirmButtonColor: '#14532D' });
        });
    });

    const btnForgot = document.getElementById('btn-forgot-submit');
    btnForgot.addEventListener('click', async () => {
        const email = document.getElementById('forgot-email').value.trim();
        if(!email) {
            Swal.fire({ icon: 'warning', title: 'Email Required', text: 'Please enter your registered email.', confirmButtonColor: '#14532D' });
            return;
        }
        const originalText = btnForgot.innerHTML;
        btnForgot.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Sending Link...';
        try {
            await sendPasswordResetEmail(auth, email);
            Swal.fire({ icon: 'success', title: 'Link Sent', text: 'Please check your email inbox to reset your password.', confirmButtonColor: '#14532D' });
            document.getElementById('forgot-email').value = '';
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message.replace('Firebase: ', ''), confirmButtonColor: '#14532D' });
        } finally {
            btnForgot.innerHTML = originalText;
        }
    });
};

// --- DASHBOARD EVENTS (GRAPH LOGIC ADDED) ---
const setupDashboardEvents = () => {

    // ApexCharts Universal Graph Initialization (Premium Interactive Version)
    let fundChart = null;
    const initChart = (seriesData, annotationEvents) => {
        const chartOptions = {
            series: [{
                name: 'Total Fund Value',
                data: seriesData.length > 0 ? seriesData : [{x: Date.now(), y: 0}]
            }],
            chart: {
                type: 'area', 
                height: 180, 
                sparkline: { enabled: false }, 
                animations: { enabled: true, easing: 'easeinout', speed: 800 },
                toolbar: { show: false },
                parentHeightOffset: 0
            },
            dataLabels: { enabled: false }, 
            grid: { show: false, padding: { left: 10, right: 10, top: 0, bottom: 0 } },
            stroke: { curve: 'smooth', width: 3 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0, stops: [0, 100] } },
            colors: ['#16A34A'], 
            xaxis: { 
                type: 'datetime',
                labels: { show: true, format: 'MMM', style: { colors: '#9CA3AF', fontSize: '10px', fontWeight: 600 }, offsetY: -5 },
                axisBorder: { show: false }, axisTicks: { show: false },
                crosshairs: { show: true, stroke: { color: '#16A34A', width: 1, dashArray: 4 } }, 
                tooltip: { enabled: false }
            },
            yaxis: { show: false },

            annotations: {
                xaxis: annotationEvents.map((d, index) => ({
                    x: d.x,
                    id: 'annot-' + index, // Fix for overlapping glitch
                    strokeDashArray: 0,
                    borderColor: d.type === 'BUY' ? '#16A34A' : (d.type === 'PROFIT' ? '#8B5CF6' : '#DC2626'),
                    label: {
                        borderColor: d.type === 'BUY' ? '#16A34A' : (d.type === 'PROFIT' ? '#8B5CF6' : '#DC2626'),
                        style: { color: '#fff', background: d.type === 'BUY' ? '#16A34A' : (d.type === 'PROFIT' ? '#8B5CF6' : '#DC2626'), fontSize: '9px', fontWeight: 'bold', padding: { left: 4, right: 4, top: 2, bottom: 2 } },
                        text: d.type === 'BUY' ? `Buy: ${d.userName}` : (d.type === 'PROFIT' ? `Profit Split` : `Sell: ${d.userName}`)
                    }
                }))
            },

            markers: {
                size: 4, 
                colors: seriesData.map(d => d.type ? (d.type === 'BUY' ? '#16A34A' : (d.type === 'PROFIT' ? '#8B5CF6' : '#DC2626')) : '#16A34A'),
                strokeColors: '#ffffff', strokeWidth: 2, hover: { size: 6 } 
            },

            tooltip: { 
                enabled: true,
                theme: 'light',
                custom: function({series, seriesIndex, dataPointIndex, w}) {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];
                    const isSell = data.type === 'SELL';
                    const isProfit = data.type === 'PROFIT';
                    const txColor = isSell ? 'text-red-600' : (isProfit ? 'text-purple-600' : 'text-green-600');
                    const txType = isSell ? 'SELL' : (isProfit ? 'PROFIT' : 'BUY');
                    const amt = data.txAmount ? data.txAmount : data.y;

                    return `
                    <div class="p-3 bg-white border border-gray-100 shadow-lg rounded-xl">
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">${new Date(data.x).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                        <p class="text-sm font-black ${txColor}">${txType} : ₹${amt.toLocaleString('en-IN')}</p>
                        <p class="text-[9px] font-bold text-gray-500 mt-1">Total Pool : ₹${data.y.toLocaleString('en-IN')}</p>
                    </div>`;
                }
            }
        };

        const chartContainer = document.querySelector("#universal-chart");
        if (chartContainer) {
            chartContainer.innerHTML = '';
            fundChart = new ApexCharts(chartContainer, chartOptions);
            fundChart.render();
        }
    };

    auth.onAuthStateChanged((user) => {
        if (user) {

            // 2. UNIVERSAL GRAPH AGGREGATION LOGIC (With Names & Filters)
            const allAguRef = ref(db, 'agu_purchases/');
            const usersDirRef = ref(db, 'users/');
            const masterDistRef = ref(db, 'master_distributions/');

            let rawUniversalEvents = []; 
            let rawProfitEvents = [];
            let usersDirectory = {};
            let currentChartRange = '1M'; 

            onValue(usersDirRef, (snap) => {
                if(snap.exists()) {
                    usersDirectory = snap.val();
                    if(rawUniversalEvents.length > 0 || rawProfitEvents.length > 0) rebuildUniversalSeries(); 
                }
            });

            onValue(masterDistRef, (snapshot) => {
                rawProfitEvents = [];
                if (snapshot.exists()) {
                    snapshot.forEach((node) => {
                        const dist = node.val();
                        if (dist.distributedAt) {
                            rawProfitEvents.push({
                                date: dist.distributedAt,
                                amount: dist.shareholderFund || 0,
                                type: 'PROFIT',
                                uid: 'SYSTEM'
                            });
                        }
                    });
                }
                rebuildUniversalSeries();
            });

            const processGlobalUpdate = (snapshot) => {
                rawUniversalEvents = [];
                if (snapshot.exists()) {
                    snapshot.forEach((userNode) => {
                        const uid = userNode.key;
                        userNode.forEach((txNode) => {
                            const tx = txNode.val();

                            if (tx.purchaseDate && (tx.status === 'approved' || tx.status === 'liquidated' || tx.status === 'liquidated_sold')) {
                                rawUniversalEvents.push({ date: tx.purchaseDate, amount: tx.amountPaid || 0, type: 'BUY', uid: uid });
                            }

                            if ((tx.status === 'liquidated' || tx.status === 'liquidated_sold') && (tx.soldAt || tx.liquidatedAt)) {
                                rawUniversalEvents.push({ date: tx.soldAt || tx.liquidatedAt, amount: tx.proceedsReceived || tx.amountPaid || 0, type: 'SELL', uid: uid });
                            }
                        });
                    });
                }
                rebuildUniversalSeries();
            };

            const rebuildUniversalSeries = () => {
                let combinedEvents = [...rawUniversalEvents, ...rawProfitEvents];
                combinedEvents.sort((a, b) => a.date - b.date);

                let fullSeries = [];
                let universalTotal = 0;

                if(combinedEvents.length === 0) {
                    fullSeries.push({x: Date.now() - 86400000, y: 0, txAmount: 0, type: 'BUY', userName: ''});
                    fullSeries.push({x: Date.now(), y: 0, txAmount: 0, type: 'BUY', userName: ''});
                } else {
                    combinedEvents.forEach(e => {
                        if (e.type === 'BUY' || e.type === 'PROFIT') { universalTotal += e.amount; }
                        else if (e.type === 'SELL') { universalTotal -= e.amount; if(universalTotal < 0) universalTotal = 0; }

                        const uName = e.type === 'PROFIT' ? 'System Split' : (usersDirectory[e.uid] ? (usersDirectory[e.uid].fullName || 'Investor') : 'Investor');

                        let adjustedTime = e.date;
                        if (fullSeries.length > 0 && fullSeries[fullSeries.length - 1].x === e.date) {
                            adjustedTime += 1000; 
                        }

                        fullSeries.push({ 
                            x: adjustedTime, 
                            y: universalTotal,
                            txAmount: Math.abs(e.amount),
                            type: e.type,
                            userName: uName
                        });
                    });
                }

                const now = Date.now();
                let cutoffTime = 0;
                if (currentChartRange === '1M') cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
                else if (currentChartRange === '12M') cutoffTime = now - (365 * 24 * 60 * 60 * 1000);
                else if (currentChartRange === '24M') cutoffTime = now - (2 * 365 * 24 * 60 * 60 * 1000);
                else if (currentChartRange === '36M') cutoffTime = now - (3 * 365 * 24 * 60 * 60 * 1000);

                let displaySeries = cutoffTime > 0 ? fullSeries.filter(d => d.x >= cutoffTime) : fullSeries;
                if (displaySeries.length === 0) displaySeries = [{x: Date.now(), y: universalTotal, txAmount: 0, type: 'BUY', userName: ''}];

                const buyEvents = displaySeries.filter(d => d.type === 'BUY' && d.txAmount > 0).slice(-3);
                const sellEvents = displaySeries.filter(d => d.type === 'SELL' && d.txAmount > 0).slice(-1);
                const profitEvents = displaySeries.filter(d => d.type === 'PROFIT' && d.txAmount > 0).slice(-1);
                const annotationEvents = [...buyEvents, ...sellEvents, ...profitEvents];

                if (!fundChart && document.querySelector("#universal-chart")) {
                    initChart(displaySeries, annotationEvents);
                } else if (fundChart) {
                    fundChart.updateOptions({
                        annotations: {
                            xaxis: annotationEvents.map((d, index) => ({
                                x: d.x, 
                                id: 'annot-' + index,
                                strokeDashArray: 0,
                                borderColor: d.type === 'BUY' ? '#16A34A' : (d.type === 'PROFIT' ? '#8B5CF6' : '#DC2626'),
                                label: {
                                    borderColor: d.type === 'BUY' ? '#16A34A' : (d.type === 'PROFIT' ? '#8B5CF6' : '#DC2626'),
                                    style: { color: '#fff', background: d.type === 'BUY' ? '#16A34A' : (d.type === 'PROFIT' ? '#8B5CF6' : '#DC2626'), fontSize: '9px', fontWeight: 'bold', padding: { left: 4, right: 4, top: 2, bottom: 2 } },
                                    text: d.type === 'BUY' ? `Buy: ${d.userName}` : (d.type === 'PROFIT' ? `Profit Split` : `Sell: ${d.userName}`)
                                }
                            }))
                        },
                        markers: {
                            colors: displaySeries.map(d => d.type ? (d.type === 'BUY' ? '#16A34A' : (d.type === 'PROFIT' ? '#8B5CF6' : '#DC2626')) : '#16A34A')
                        }
                    }, false, false);

                    fundChart.updateSeries([{ data: displaySeries }], true);
                }
            };

            document.querySelectorAll('.filter-time-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.filter-time-btn').forEach(b => {
                        b.classList.remove('active', 'bg-white', 'text-appGreen', 'shadow-sm');
                        b.classList.add('text-gray-400');
                    });
                    e.target.classList.add('active', 'bg-white', 'text-appGreen', 'shadow-sm');
                    e.target.classList.remove('text-gray-400');

                    currentChartRange = e.target.getAttribute('data-range');
                    rebuildUniversalSeries(); 
                });
            });

            onValue(allAguRef, (s) => processGlobalUpdate(s));

            // 3. PERSONAL DASHBOARD LOGIC
            const userRef = ref(db, 'users/' + user.uid);
            const aguRef = ref(db, 'agu_purchases/' + user.uid);
            const walletRef = ref(db, 'wallet_recharges/' + user.uid);
            const livePriceRef = ref(db, 'platform_settings/agu_price');

            let transactionsList = [];
            let aguTotal = 0;
            let aguUnits = 0;
            let walletBalance = 0;
            let liveAguPrice = 10; 

            const updatePersonalDashboardUI = () => {
                const personalInvestedValue = aguTotal;
                const currentValue = aguUnits * liveAguPrice;

                const invValEl = document.getElementById('dash-invested-value');
                if(invValEl) invValEl.innerText = "₹" + personalInvestedValue.toLocaleString('en-IN');

                const invUnitEl = document.getElementById('dash-invested-units');
                if(invUnitEl) invUnitEl.innerText = aguUnits.toFixed(2);

                const currValEl = document.getElementById('dash-current-value');
                if(currValEl) currValEl.innerText = "₹" + currentValue.toLocaleString('en-IN', {maximumFractionDigits: 2});

                const currUnitEl = document.getElementById('dash-current-units');
                if(currUnitEl) currUnitEl.innerText = aguUnits.toFixed(2);

                const walletEl = document.getElementById('dash-wallet-balance');
                if(walletEl) walletEl.innerText = "₹" + walletBalance.toLocaleString('en-IN', {maximumFractionDigits: 2});

                const activityContainer = document.getElementById('dash-recent-activity');
                if(!activityContainer) return;

                if(transactionsList.length === 0) {
                    activityContainer.innerHTML = `<div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex items-center justify-center h-32"><p class="text-gray-400 text-sm font-medium">No recent transactions</p></div>`;
                    return;
                }

                transactionsList.sort((a, b) => b.timestamp - a.timestamp);
                const recentTx = transactionsList.slice(0, 3);

                activityContainer.innerHTML = recentTx.map(t => {
                    let txDetail = "";
                    let iconTheme = "";
                    let iconSvg = "";

                    if (t.type === 'AGU') {
                        const units = t.amount / 10;
                        txDetail = `AGU Purchased`;
                        iconTheme = "bg-yellow-50 text-appGold";
                        iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>';
                    } else if (t.type === 'WALLET') {
                        txDetail = `Wallet Recharge for ₹${t.amount}`;
                        iconTheme = "bg-blue-50 text-blue-500";
                        iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>';
                    } else if (t.type === 'DIVIDEND') {
                        txDetail = `AGU Profit Reinvested`;
                        iconTheme = "bg-purple-50 text-purple-500";
                        iconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
                    }

                    const whatsappMsg = `AMP Growth Units\n\n${txDetail}\n\nMain payment kar chuka hun lekin yah abhi bhi pending hai check and approved.`;
                    const whatsappLink = `https://wa.me/917903698180?text=${encodeURIComponent(whatsappMsg)}`;

                    return `
                        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full ${iconTheme} flex items-center justify-center">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconSvg}</svg>
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-gray-800 flex items-center gap-1">
                                        ${t.title}
                                        ${t.status === 'pending' ? '<span class="px-1.5 py-0.5 bg-yellow-100 text-yellow-600 text-[8px] font-black uppercase rounded">Pending</span>' : ''}
                                    </p>
                                    <p class="text-[10px] font-bold text-gray-400 uppercase">${new Date(t.timestamp).toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>
                            <div class="text-right flex flex-col items-end gap-1.5">
                                <p class="text-sm font-black ${t.type === 'AGU' ? 'text-appGold' : (t.type === 'WALLET' ? 'text-blue-600' : 'text-purple-600')}">₹${t.amount.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
                                ${t.status === 'pending' ? `
                                    <a href="${whatsappLink}" target="_blank" class="bg-green-50 border border-green-200 text-[#0F6B3F] text-[9px] font-bold px-2 py-1 rounded-md shadow-sm hover:bg-green-100 transition-colors flex items-center gap-1 active:scale-95">
                                        Help
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            };

            onValue(livePriceRef, (snapshot) => {
                if(snapshot.exists()) {
                    liveAguPrice = parseFloat(snapshot.val());
                } else {
                    liveAguPrice = 10;
                }

                const universalValEl = document.getElementById('dash-universal-value');
                const universalGrowthEl = document.getElementById('dash-universal-growth');

                if(universalValEl) universalValEl.innerText = "₹" + liveAguPrice.toFixed(3);

                if(universalGrowthEl) {
                    const navGrowth = ((liveAguPrice - 10) / 10) * 100;
                    universalGrowthEl.innerText = navGrowth > 0 ? "+" + navGrowth.toFixed(2) + "%" : navGrowth.toFixed(2) + "%";
                    universalGrowthEl.className = navGrowth >= 0 ? "text-appGreen" : "text-gray-500";
                }

                updatePersonalDashboardUI();
            });

            onValue(userRef, (snapshot) => {
                if(snapshot.exists()) {
                    const data = snapshot.val();
                    walletBalance = data.walletBalance || 0;
                    updatePersonalDashboardUI();
                }
            });

            onValue(aguRef, (snapshot) => {
                if(snapshot.exists()) {
                    aguTotal = 0; aguUnits = 0;
                    transactionsList = transactionsList.filter(t => t.type !== 'AGU'); 
                    Object.values(snapshot.val()).forEach(p => {
                        if(p.status === 'approved') { aguTotal += (p.amountPaid || 0); aguUnits += (p.aguReceived || 0); }
                        transactionsList.push({ id: p.purchaseId, type: 'AGU', title: 'AGU Purchased', amount: p.amountPaid, timestamp: p.purchaseDate || Date.now(), status: p.status || 'approved' });
                    });
                    updatePersonalDashboardUI();
                }
            });

            onValue(walletRef, (snapshot) => {
                if(snapshot.exists()) {
                    transactionsList = transactionsList.filter(t => t.type !== 'WALLET' && t.type !== 'DIVIDEND'); 
                    Object.values(snapshot.val()).forEach(req => {
                        if (req.type === 'DIVIDEND') {
                            transactionsList.push({ id: req.requestId, type: 'DIVIDEND', title: req.note || 'Profit Reinvested', amount: req.amount, timestamp: req.requestDate || Date.now(), status: req.status || 'approved' });
                        } else {
                            transactionsList.push({ id: req.requestId, type: 'WALLET', title: 'Wallet Recharge', amount: req.amount, timestamp: req.requestDate || Date.now(), status: req.status || 'pending' });
                        }
                    });
                    updatePersonalDashboardUI();
                }
            });

            const btnDashAddFunds = document.getElementById('btn-dash-add-funds');
            if(btnDashAddFunds) {
                btnDashAddFunds.addEventListener('click', () => {
                    navigateTo(portfolioHTML, () => setupPortfolioEvents(navigateTo, dashboardHTML, setupDashboardEvents, null, null, profileHTML, setupProfileEvents));
                });
            }

            // --- TOP INVESTORS (LEADERBOARD) LOGIC ---
            const usersDirRefForBoard = ref(db, 'users/');
            let leaderboardDir = {};
            let globalAgus = {};

            const renderTopInvestors = () => {
                if(Object.keys(leaderboardDir).length === 0) return;

                let leaderboard = [];

                Object.keys(leaderboardDir).forEach(uid => {
                    let totalAgu = 0;

                    if(globalAgus[uid]) {
                        Object.values(globalAgus[uid]).forEach(p => { totalAgu += (p.aguReceived || 0); });
                    }

                    if(totalAgu > 0) {
                        leaderboard.push({
                            uid: uid,
                            name: leaderboardDir[uid].fullName || 'AGU Investor',
                            photo: leaderboardDir[uid].photoURL || null,
                            agu: totalAgu,
                            score: totalAgu 
                        });
                    }
                });

                leaderboard.sort((a, b) => b.score - a.score);
                const top5 = leaderboard.slice(0, 5);
                const container = document.getElementById('dash-top-investors');
                if(!container) return;

                if(top5.length === 0) {
                    container.innerHTML = `<div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex items-center justify-center h-24"><p class="text-gray-400 text-[11px] font-medium">No top investors yet.</p></div>`;
                    return;
                }

                let html = '';
                top5.forEach((inv, index) => {
                    let rankColors = ['bg-[#D4AF37]', 'bg-gray-300', 'bg-[#CD7F32]', 'bg-gray-50 text-gray-400', 'bg-gray-50 text-gray-400'];
                    let rankText = index < 3 ? 'text-white' : '';
                    let rankBadge = `<div class="absolute -top-2 -left-2 w-6 h-6 ${rankColors[index]} ${rankText} rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">${index + 1}</div>`;

                    let photoHtml = inv.photo 
                        ? `<img src="${inv.photo}" class="w-10 h-10 rounded-full object-cover border border-gray-50 shadow-sm">`
                        : `<div class="w-10 h-10 rounded-full bg-appGreen text-white flex items-center justify-center font-bold text-sm border border-gray-50 shadow-sm">${inv.name.charAt(0).toUpperCase()}</div>`;

                    html += `
                        <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center relative hover:border-appGreen transition-colors cursor-pointer">
                            ${rankBadge}
                            <div class="flex items-center gap-3 ml-2">
                                ${photoHtml}
                                <div>
                                    <p class="text-sm font-bold text-gray-800 tracking-tight">${inv.name}</p>
                                    <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Top Investor</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-black text-appGold">${inv.agu.toFixed(2)} <span class="text-[9px] text-gray-500 font-bold uppercase">Units</span></p>
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;
            };

            onValue(usersDirRefForBoard, (snap) => { if(snap.exists()) { leaderboardDir = snap.val(); renderTopInvestors(); } });
            onValue(allAguRef, (snap) => { globalAgus = snap.exists() ? snap.val() : {}; renderTopInvestors(); });

        } else {
            navigateTo(loginHTML, setupLoginEvents);
        }
    });

    const btnSeeAll = document.getElementById('btn-see-all-activity');
    if(btnSeeAll) {
        btnSeeAll.addEventListener('click', () => {
            navigateTo(historyHTML, () => setupHistoryEvents(navigateTo, dashboardHTML, setupDashboardEvents));
        });
    }

    const btnFooterBuy = document.getElementById('btn-footer-buy-agu');
    if (btnFooterBuy) {
        btnFooterBuy.addEventListener('click', () => {
            navigateTo(buyAguHTML, () => setupBuyAguEvents(navigateTo, dashboardHTML, setupDashboardEvents));
        });
    }

    document.getElementById('btn-go-profile').addEventListener('click', () => {
        navigateTo(profileHTML, () => setupProfileEvents(navigateTo, dashboardHTML, setupDashboardEvents));
    });

    document.getElementById('btn-footer-portfolio').addEventListener('click', () => {
        navigateTo(portfolioHTML, () => setupPortfolioEvents(navigateTo, dashboardHTML, setupDashboardEvents, null, null, profileHTML, setupProfileEvents));
    });

    document.getElementById('btn-footer-history').addEventListener('click', () => {
        navigateTo(historyHTML, () => setupHistoryEvents(navigateTo, dashboardHTML, setupDashboardEvents));
    });

    const dashBellBtn = document.getElementById('btn-dash-bell-notif');
    if (dashBellBtn) {
        dashBellBtn.addEventListener('click', () => {
            navigateTo(notificationHTML, () => setupNotificationEvents(navigateTo, dashboardHTML, setupDashboardEvents));
        });

        const currentUser = auth.currentUser;
        if (currentUser) {
            const globalNotifRef = ref(db, 'notifications/' + currentUser.uid);
            onValue(globalNotifRef, (snapshot) => {
                const redDot = document.getElementById('dash-bell-red-dot');
                if (redDot) {
                    let hasUnread = false;
                    if (snapshot.exists()) {
                        Object.values(snapshot.val()).forEach(n => { if (!n.isRead) hasUnread = true; });
                    }
                    if (hasUnread) redDot.classList.remove('hidden');
                    else redDot.classList.add('hidden');
                }
            });
        }
    }
};


// --- START THE APP ---
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            appContainer.innerHTML = dashboardHTML;
            setupDashboardEvents();
        } else {
            appContainer.innerHTML = splashHTML;
            gsap.from("#splash-card", { y: 30, opacity: 0, duration: 1, ease: "expo.out" });
            setupSplashEvents();
        }
    });
});