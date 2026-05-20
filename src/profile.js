// profile.js - Premium Profile & KYC Component Module
import { auth, db, storage } from './firebase.js';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

import { portfolioHTML, setupPortfolioEvents } from './portfolio.js';
import { notificationHTML, setupNotificationEvents } from './notification.js';
import { historyHTML, setupHistoryEvents } from './history.js';
import { buyAguHTML, setupBuyAguEvents } from './buy-agu.js';

export const profileHTML = `
    <div class="min-h-screen bg-[#F5F7FA] pb-28 font-sans text-[#1C1C1C]">

        <div class="bg-white px-6 py-3 shadow-md rounded-b-3xl flex justify-between items-center z-50 sticky top-0 w-full backdrop-blur-md bg-white/95">
            <div class="w-8"></div> 
            <div class="text-center flex flex-col items-center">
                <h1 class="text-lg font-extrabold text-[#0F6B3F] tracking-tight">AMP Growth Units</h1>
                <p class="text-[8px] font-bold text-[#D4A017] uppercase tracking-widest mt-0.5">Powered by AMP KART</p>
            </div>
            <button id="btn-prof-bell-notif" class="relative p-1.5 bg-gray-50 rounded-full text-gray-500 hover:text-[#0F6B3F] transition-colors active:scale-95">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span id="prof-bell-red-dot" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white hidden"></span>
            </button>
        </div>

        <div class="px-5 mt-6 space-y-6">

            <div class="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center relative">
                <button id="btn-prof-share" class="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#0F6B3F] transition-colors active:scale-95">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                </button>

                <div class="relative group cursor-pointer mb-3" id="avatar-upload-btn">
                    <div class="w-24 h-24 bg-gradient-to-tr from-[#0F6B3F] to-[#1a9359] text-white rounded-full flex items-center justify-center font-bold text-4xl shadow-lg border-4 border-white" id="prof-initial">-</div>
                    <img id="prof-image" src="" alt="Profile" class="w-24 h-24 rounded-full object-cover hidden shadow-lg border-4 border-white">
                    <div class="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-100 text-[#0F6B3F]">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <input type="file" id="profile-file-input" accept="image/*" class="hidden">
                </div>

                <h2 class="text-xl font-extrabold text-[#1C1C1C]" id="prof-name">Loading...</h2>
                <div class="flex items-center gap-1.5 mt-1">
                    <svg class="w-4 h-4 text-[#D4A017]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    <span class="text-xs font-bold text-[#0F6B3F] uppercase tracking-wide">Verified AGU Member</span>
                </div>
                <p class="text-xs text-gray-400 mt-1 font-medium" id="prof-email">...</p>
                <p class="text-xs text-gray-400 font-medium">Joined: <span id="prof-joined" class="text-gray-600">...</span></p>

                             <div class="grid grid-cols-2 gap-3 w-full mt-6">
                    <div class="bg-[#F5F7FA] p-3 rounded-2xl border border-gray-100">
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total AGU Units</p>
                        <p class="text-lg font-black text-[#1C1C1C]" id="prof-stat-units">0.00</p>
                    </div>
                    <div id="btn-go-portfolio-card" class="bg-gradient-to-br from-[#0F6B3F] to-[#0a4d2c] p-3 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-all active:scale-95 flex flex-col justify-center">
                        <p class="text-[10px] text-green-100 font-bold uppercase tracking-wider mb-1 flex justify-between items-center">
                            Current Value 
                            <svg class="w-3.5 h-3.5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                        </p>
                        <p class="text-lg font-black text-[#D4A017]" id="prof-stat-value">₹0</p>
                    </div>
                </div>

            </div>

<div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 mt-4">
    <div class="flex justify-between items-center mb-1">
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Device Security</h4>
    </div>
    <button id="btn-enable-biometric" class="w-full mt-2 bg-gray-50 border border-gray-200 text-appText font-bold py-3.5 px-4 rounded-xl flex items-center justify-between active:scale-95 transition-all">
        <span class="flex items-center gap-2 text-sm">
            <i class="fa-solid fa-fingerprint text-appGreen text-xl"></i> Fingerprint Lock Login
        </span>
        <span class="text-xs text-appGreen font-black uppercase tracking-wider" id="bio-status-text">Enable</span>
    </button>
</div>


            <div class="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 flex justify-between items-center">
                <div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Wallet Balance</p>
                    <h3 class="text-2xl font-black text-[#0F6B3F]">₹<span id="prof-wallet-balance">0</span></h3>
                </div>
                <button id="btn-prof-add-funds" class="bg-[#D4A017] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 hover:bg-yellow-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Add Funds
                </button>
            </div>

            <div class="grid grid-cols-4 gap-3">
                <button id="btn-prof-whatsapp-help" class="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center gap-2 hover:border-[#0F6B3F] transition-all active:scale-95">
                    <div class="w-10 h-10 bg-green-50 text-[#0F6B3F] rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.405-.883-.733-1.48-1.638-1.653-1.935-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    <span class="text-[9px] font-bold text-gray-600 text-center">WhatsApp<br>Help</span>
                </button>
                <button id="btn-prof-upi" class="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center gap-2 hover:border-[#0F6B3F] transition-all active:scale-95">
                    <div class="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                    <span class="text-[9px] font-bold text-gray-600 text-center">Setup<br>UPI</span>
                </button>
                <button id="btn-prof-bank" class="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center gap-2 hover:border-[#0F6B3F] transition-all active:scale-95">
                    <div class="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg></div>
                    <span class="text-[9px] font-bold text-gray-600 text-center">Bank<br>Details</span>
                </button>
                <button id="btn-prof-security" class="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center gap-2 hover:border-[#0F6B3F] transition-all active:scale-95">
                    <div class="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
                    <span class="text-[9px] font-bold text-gray-600 text-center">Change<br>Password</span>
                </button>
            </div>

            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
                <div class="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                    <h3 class="text-sm font-bold text-[#1C1C1C]">KYC Verification</h3>
                    <span id="prof-kyc-status" class="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-yellow-50 text-[#D4A017]">Pending</span>
                </div>
                <div class="space-y-4" id="kyc-form-fields">
                    <div>
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Aadhaar Number</label>
                        <input type="number" id="kyc-aadhar" placeholder="Enter 12-Digit Number" class="mt-1.5 w-full bg-[#F5F7FA] border border-transparent rounded-xl px-4 py-3.5 outline-none text-[#1C1C1C] font-medium focus:border-[#0F6B3F] focus:bg-white transition-all">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">PAN Card Number</label>
                        <input type="text" id="kyc-pan" placeholder="Enter 10-Digit PAN" class="mt-1.5 w-full bg-[#F5F7FA] border border-transparent rounded-xl px-4 py-3.5 outline-none text-[#1C1C1C] font-medium focus:border-[#0F6B3F] focus:bg-white transition-all uppercase">
                    </div>
                    <button id="btn-submit-kyc" class="w-full bg-gradient-to-r from-[#0F6B3F] to-[#168953] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 mt-2 hover:opacity-90 transition-opacity">
                        Submit KYC Details
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-3xl p-2 shadow-sm border border-gray-50 mb-6">
                <button id="btn-prof-logout-full" class="w-full flex items-center justify-between p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg></div>
                        <span class="font-bold text-sm">Secure Logout</span>
                    </div>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
        </div>

        <div id="fixed-bottom-nav" class="fixed bottom-0 left-0 w-full max-w-md mx-auto bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.03)] px-5 py-3 flex justify-between items-end z-50 pb-4" style="left: 50%; transform: translateX(-50%);">
            <button id="btn-prof-footer-home" class="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0F6B3F] transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span class="text-[9px] font-bold">Home</span>
            </button>
            <button id="btn-prof-footer-portfolio" class="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0F6B3F] transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <span class="text-[9px] font-bold">Portfolio</span>
            </button>

            <div class="relative -top-4 z-[60]">
                <button id="btn-prof-footer-buy-agu" class="bg-gradient-to-br from-[#0F6B3F] to-[#16A34A] text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-[0_8px_15px_rgba(20,83,45,0.3)] hover:scale-105 transition-transform active:scale-95 border-4 border-[#F3F5F7]">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>

            <button id="btn-prof-footer-history" class="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0F6B3F] transition-colors w-12">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span class="text-[9px] font-bold">History</span>
            </button>
            <button class="flex flex-col items-center gap-1 text-[#0F6B3F] w-12 pointer-events-none">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
                <span class="text-[9px] font-bold">Profile</span>
            </button>
        </div>
  </div>
`;

const compressImage = async (file, maxSizeKB = 500) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1080;
                if (width > maxDim || height > maxDim) {
                    if (width > height) { height = Math.round((height *= maxDim / width)); width = maxDim; } 
                    else { width = Math.round((width *= maxDim / height)); height = maxDim; }
                }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                let quality = 0.9;
                const reduceQuality = () => {
                    canvas.toBlob((blob) => {
                        if (blob.size / 1024 > maxSizeKB && quality > 0.1) { quality -= 0.1; reduceQuality(); } 
                        else { resolve(blob); }
                    }, 'image/jpeg', quality);
                };
                reduceQuality();
            };
        };
    });
};

export const setupProfileEvents = (navigateToCallback, dashboardHTML, setupDashboardEvents) => {
    setTimeout(() => {
        const appChild = document.querySelector('#app > div');
        if (appChild) appChild.style.transform = 'none';
    }, 550);

    const goHome = () => navigateToCallback(dashboardHTML, setupDashboardEvents);
    document.getElementById('btn-prof-footer-home').addEventListener('click', goHome);

        document.getElementById('btn-prof-footer-portfolio').addEventListener('click', () => {
        navigateToCallback(portfolioHTML, () => setupPortfolioEvents(navigateToCallback, dashboardHTML, setupDashboardEvents, null, null, profileHTML, setupProfileEvents));
    });

    document.getElementById('btn-prof-footer-history').addEventListener('click', () => {
        navigateToCallback(historyHTML, () => setupHistoryEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
    });

    // NAYA: Footer Buy AGU button click event logic
    const btnProfBuyAgu = document.getElementById('btn-prof-footer-buy-agu');
    if (btnProfBuyAgu) {
        btnProfBuyAgu.addEventListener('click', () => {
            navigateToCallback(buyAguHTML, () => setupBuyAguEvents(navigateToCallback, dashboardHTML, setupDashboardEvents));
        });
    }

       // View History Button Click Event

    // NAYA: Portfolio Card Click Event (Redirect to Portfolio)
    const btnGoPortCard = document.getElementById('btn-go-portfolio-card');
    if (btnGoPortCard) {
        btnGoPortCard.addEventListener('click', () => {
            navigateToCallback(portfolioHTML, () => setupPortfolioEvents(navigateToCallback, dashboardHTML, setupDashboardEvents, null, null, profileHTML, setupProfileEvents));
        });
    }

    // NAYA: Add Funds Button Click Event (Redirect to Portfolio Wallet)
    const btnAddFunds = document.getElementById('btn-prof-add-funds');
    if (btnAddFunds) {
        btnAddFunds.addEventListener('click', () => {
            navigateToCallback(portfolioHTML, () => setupPortfolioEvents(navigateToCallback, dashboardHTML, setupDashboardEvents, null, null, profileHTML, setupProfileEvents));
        });
    }


    const user = auth.currentUser;
    if(!user) return;

    // Live Notification Red Dot Handler on Profile Bell
    const globalNotifRef = ref(db, 'notifications/' + user.uid);
    onValue(globalNotifRef, (snapshot) => {
        const redDot = document.getElementById('prof-bell-red-dot');
        if (redDot) {
            let hasUnread = false;
            if (snapshot.exists()) {
                Object.values(snapshot.val()).forEach(n => { if (!n.isRead) hasUnread = true; });
            }
            if (hasUnread) redDot.classList.remove('hidden');
            else redDot.classList.add('hidden');
        }
    });

    // Bell Icon Click Listener to open notification page
    document.getElementById('btn-prof-bell-notif').addEventListener('click', () => {
        navigateToCallback(notificationHTML, () => setupNotificationEvents(navigateToCallback, profileHTML, () => setupProfileEvents(navigateToCallback, dashboardHTML, setupDashboardEvents)));
    });

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout?', text: "Are you sure you want to securely logout?", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#0F6B3F', cancelButtonColor: '#d33', confirmButtonText: 'Yes, Logout'
        }).then((result) => {
            if (result.isConfirmed) { auth.signOut().then(() => { window.location.reload(); }); }
        });
    };

    document.getElementById('btn-prof-logout-full').addEventListener('click', handleLogout);

    // NAYA: Web Share API Logic (Mobile Native Share Menu Ke Liye)
    const btnShare = document.getElementById('btn-prof-share');
    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            const shareData = {
                title: 'AMP Growth Units',
                text: 'Join AMP Growth Units and start your investment journey securely!',
                // Yah direct aapki website ka main link fetch karega
                url: window.location.origin + window.location.pathname 
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    // Yadi kisi browser mein share support nahi karta (Laptop aadi), toh link copy ho jayega
                    await navigator.clipboard.writeText(shareData.url);
                    Swal.fire({ icon: 'success', title: 'Link Copied', text: 'Website link copied to clipboard!', timer: 1500, showConfirmButton: false });
                }
            } catch (err) {
                console.error('Error sharing:', err);
            }
        });
    }

    let currentUpi = "";
    let currentBank = { acc: "", ifsc: "", name: "" };

    const userRef = ref(db, 'users/' + user.uid);
    const aguRef = ref(db, 'agu_purchases/' + user.uid);

    onValue(userRef, (snapshot) => {
        if(snapshot.exists()) {
            const data = snapshot.val();

            document.getElementById('prof-name').innerText = data.fullName || "User";
            document.getElementById('prof-email').innerText = data.email || "No Email";

            if(data.upiId) currentUpi = data.upiId;
            if(data.bankDetails) currentBank = data.bankDetails;

            if(data.createdAt) {
                const date = new Date(data.createdAt);
                document.getElementById('prof-joined').innerText = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            }

            // NAYA: Live Wallet Balance Fetch
            const currentWalletBalance = data.walletBalance || 0;
            const walletEl = document.getElementById('prof-wallet-balance');
            if (walletEl) walletEl.innerText = currentWalletBalance.toLocaleString('en-IN');

            if (data.photoURL) {
                document.getElementById('prof-image').src = data.photoURL;
                document.getElementById('prof-image').classList.remove('hidden');
                document.getElementById('prof-initial').classList.add('hidden');
            } else {
                document.getElementById('prof-initial').innerText = (data.fullName || "U").charAt(0).toUpperCase();
            }

            const kycStatus = data.kycStatus || 'pending';
            const statusBadge = document.getElementById('prof-kyc-status');
            statusBadge.innerText = kycStatus;

            if(kycStatus === 'approved') {
                document.getElementById('kyc-form-fields').innerHTML = `
                    <div class="p-4 bg-green-50/50 border border-green-100 rounded-xl text-center flex flex-col items-center gap-2">
                        <div class="w-10 h-10 bg-[#0F6B3F] text-white rounded-full flex items-center justify-center"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
                        <span class="text-xs font-bold text-[#0F6B3F]">KYC Verified & Approved</span>
                    </div>`;
            } else if(kycStatus === 'reviewing') {
                document.getElementById('kyc-form-fields').innerHTML = `
                    <div class="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-center text-xs font-bold text-blue-700">
                        ⏳ Documents under review by AMP KART Admin.
                    </div>`;
            } else {
                if(data.aadharNo) document.getElementById('kyc-aadhar').value = data.aadharNo;
                if(data.panNo) document.getElementById('kyc-pan').value = data.panNo;
            }
        }
    });

    // ========================================================
    // NAYA CODE: FINGERPRINT STATUS CHECK & ACTION EVENT
    // ========================================================
    const bioStatusText = document.getElementById('bio-status-text');
    const savedActiveUid = localStorage.getItem('bio_active_uid');

    // Status Check ki fingerprint pehle se enable hai ya nahi
    if (savedActiveUid && localStorage.getItem(`bio_login_${savedActiveUid}`)) {
        if(bioStatusText) bioStatusText.innerText = "Active ✅";
    }

    // Fingerprint active karne ka click trigger logic
    const btnBioEnable = document.getElementById('btn-enable-biometric');
    if (btnBioEnable) {
        btnBioEnable.addEventListener('click', () => {
            Swal.fire({
                title: 'Confirm Device Lock',
                text: 'Fingerprint setup karne ke liye apna active password verify karein:',
                input: 'password',
                inputPlaceholder: 'Enter your profile password',
                showCancelButton: true,
                confirmButtonColor: '#0F6B3F',
                confirmButtonText: 'Verify Account'
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    // Biometric registration background logic execute karo
                    import('./biometric.js').then(module => {
                        module.registerBiometric(result.value);
                    });
                }
            });
        });
    }
    // ========================================================

 // Function block ends safely here

        let aguInvested = 0;
    let aguUnitsCount = 0;
    let liveAguPrice = 10; // Default price

    const livePriceRef = ref(db, 'platform_settings/agu_price');

    const updateProfileStats = () => {
        const currentValue = aguUnitsCount * liveAguPrice;

        const valueEl = document.getElementById('prof-stat-value');
        if (valueEl) valueEl.innerText = "₹" + currentValue.toLocaleString('en-IN', {maximumFractionDigits: 2});

        const unitsEl = document.getElementById('prof-stat-units');
        if (unitsEl) unitsEl.innerText = aguUnitsCount.toFixed(2);
    };

    onValue(livePriceRef, (snapshot) => {
        if(snapshot.exists()) {
            liveAguPrice = parseFloat(snapshot.val());
        } else {
            liveAguPrice = 10;
        }
        updateProfileStats();
    });

    onValue(aguRef, (snapshot) => {
        aguInvested = 0; aguUnitsCount = 0;
        if(snapshot.exists()) {
            Object.values(snapshot.val()).forEach(p => {
                if(p.status === 'approved') {
                    aguInvested += (p.amountPaid || 0);
                    aguUnitsCount += (p.aguReceived || 0);
                }
            });
        }
        updateProfileStats();
    });


    // --- NEW: WHATSAPP HELP BUTTON LOGIC ---
    document.getElementById('btn-prof-whatsapp-help').addEventListener('click', () => {
        const whatsappMsg = `AMP Growth Units\n\nPlease help me sir`;
        const whatsappLink = `https://wa.me/917903698180?text=${encodeURIComponent(whatsappMsg)}`;
        window.open(whatsappLink, '_blank');
    });

    // --- NEW: SETUP UPI & BANK DETAILS ---
    document.getElementById('btn-prof-upi').addEventListener('click', () => {
        Swal.fire({
            title: 'Setup UPI ID',
            html: `
                <div class="text-left mt-3">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Your UPI ID</label>
                    <input type="text" id="swal-upi-input" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F6B3F] transition-all" placeholder="e.g. 9876543210@ybl" value="${currentUpi}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save UPI',
            confirmButtonColor: '#0F6B3F',
            preConfirm: () => {
                const upi = document.getElementById('swal-upi-input').value.trim();
                if (!upi) { Swal.showValidationMessage('UPI ID cannot be empty'); return false; }
                return upi;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await update(ref(db, 'users/' + user.uid), { upiId: result.value });
                    Swal.fire({icon: 'success', title: 'Saved', text: 'UPI ID updated successfully.', confirmButtonColor: '#0F6B3F'});
                } catch (e) {
                    Swal.fire('Error', 'Failed to save details.', 'error');
                }
            }
        });
    });

    document.getElementById('btn-prof-bank').addEventListener('click', () => {
        Swal.fire({
            title: 'Bank Details',
            html: `
                <div class="space-y-4 mt-4 text-left">
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Account Number</label>
                        <input type="number" id="swal-bank-acc" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F6B3F] transition-all" placeholder="Enter A/C Number" value="${currentBank.acc}">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">IFSC Code</label>
                        <input type="text" id="swal-bank-ifsc" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F6B3F] transition-all uppercase" placeholder="Enter IFSC" value="${currentBank.ifsc}">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Account Holder Name</label>
                        <input type="text" id="swal-bank-name" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F6B3F] transition-all" placeholder="Enter Name" value="${currentBank.name}">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Details',
            confirmButtonColor: '#0F6B3F',
            preConfirm: () => {
                const acc = document.getElementById('swal-bank-acc').value;
                const ifsc = document.getElementById('swal-bank-ifsc').value.toUpperCase();
                const name = document.getElementById('swal-bank-name').value;
                if (!acc || !ifsc || !name) { Swal.showValidationMessage('Please fill all fields'); return false; }
                return { acc, ifsc, name };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await update(ref(db, 'users/' + user.uid), { bankDetails: result.value });
                    Swal.fire({icon: 'success', title: 'Saved', text: 'Bank details updated.', confirmButtonColor: '#0F6B3F'});
                } catch (e) {
                    Swal.fire('Error', 'Failed to save details.', 'error');
                }
            }
        });
    });

    const btnSecurity = document.getElementById('btn-prof-security');
    if (btnSecurity) {
        btnSecurity.addEventListener('click', () => {
            Swal.fire({
                title: 'Change Password',
                html: `
                    <div class="space-y-4 mt-4 text-left">
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Current Password</label>
                            <input type="password" id="swal-current-pwd" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F6B3F] transition-all" placeholder="Enter current password">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">New Password</label>
                            <input type="password" id="swal-new-pwd" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F6B3F] transition-all" placeholder="Min 6 characters">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Confirm New Password</label>
                            <input type="password" id="swal-confirm-pwd" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#0F6B3F] transition-all" placeholder="Retype new password">
                        </div>
                    </div>
                `,
                confirmButtonText: 'Update Password',
                confirmButtonColor: '#0F6B3F',
                showCancelButton: true,
                focusConfirm: false,
                preConfirm: () => {
                    const currentPwd = Swal.getPopup().querySelector('#swal-current-pwd').value;
                    const newPwd = Swal.getPopup().querySelector('#swal-new-pwd').value;
                    const confirmPwd = Swal.getPopup().querySelector('#swal-confirm-pwd').value;

                    if (!currentPwd || !newPwd || !confirmPwd) { Swal.showValidationMessage('Please fill all fields'); return false; }
                    if (newPwd !== confirmPwd) { Swal.showValidationMessage('New passwords do not match!'); return false; }
                    if (newPwd.length < 6) { Swal.showValidationMessage('Password must be at least 6 characters'); return false; }
                    return { currentPwd, newPwd };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const { currentPwd, newPwd } = result.value;
                    const currentUser = auth.currentUser;
                    Swal.fire({ title: 'Updating...', text: 'Please wait while we secure your account.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
                    try {
                        const credential = EmailAuthProvider.credential(currentUser.email, currentPwd);
                        await reauthenticateWithCredential(currentUser, credential);
                        await updatePassword(currentUser, newPwd);
                        Swal.fire({ icon: 'success', title: 'Success!', text: 'Your password has been changed successfully.', confirmButtonColor: '#0F6B3F' });
                    } catch (error) {
                        let errorMsg = error.message.replace('Firebase: ', '');
                        if (error.code === 'auth/invalid-credential') { errorMsg = "Your current password is incorrect."; }
                        Swal.fire('Update Failed', errorMsg, 'error');
                    }
                }
            });
        });
    }

    const uploadBtn = document.getElementById('avatar-upload-btn');
    const fileInput = document.getElementById('profile-file-input');

    uploadBtn.addEventListener('click', () => { fileInput.click(); });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        try {
            Swal.fire({ title: 'Processing Image...', text: 'Compressing and uploading securely.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
            const compressedBlob = await compressImage(file, 500);
            const fileName = `profile_${user.uid}.jpg`;
            const imageRef = storageRef(storage, `profile_pictures/${fileName}`);
            const snapshot = await uploadBytes(imageRef, compressedBlob);
            const downloadURL = await getDownloadURL(snapshot.ref);
            await update(ref(db, 'users/' + user.uid), { photoURL: downloadURL });
            Swal.fire({ icon: 'success', title: 'Updated!', text: 'Profile picture saved successfully.', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Upload Failed', text: 'Something went wrong while processing the image.', confirmButtonColor: '#0F6B3F' });
        }
    });

    const btnSubmitKyc = document.getElementById('btn-submit-kyc');
    if(btnSubmitKyc) {
        btnSubmitKyc.addEventListener('click', async () => {
            const aadhar = document.getElementById('kyc-aadhar').value.trim();
            const pan = document.getElementById('kyc-pan').value.trim().toUpperCase();

            if(!aadhar || aadhar.length !== 12) { Swal.fire({icon: 'warning', title: 'Invalid Document', text: 'Please enter a valid 12-digit number.', confirmButtonColor: '#0F6B3F'}); return; }
            if(!pan || pan.length !== 10) { Swal.fire({icon: 'warning', title: 'Invalid PAN', text: 'Please enter a valid 10-digit PAN number.', confirmButtonColor: '#0F6B3F'}); return; }

            const originalText = btnSubmitKyc.innerHTML;
            btnSubmitKyc.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Securely Submitting...';

            try {
                await update(ref(db, 'users/' + user.uid), { aadharNo: aadhar, panNo: pan, kycStatus: 'reviewing' });
                Swal.fire({ icon: 'success', title: 'Securely Submitted', text: 'Your details are safely encrypted and sent for verification.', confirmButtonColor: '#0F6B3F' });
            } catch (error) {
                Swal.fire({icon: 'error', title: 'Submission Failed', text: 'Network error. Try again.', confirmButtonColor: '#0F6B3F'});
            } finally {
                if(document.getElementById('btn-submit-kyc')) { btnSubmitKyc.innerHTML = originalText; }
            }
        });
    }
};