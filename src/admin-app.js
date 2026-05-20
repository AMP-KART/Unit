// src/admin-app.js
import { auth, db } from './firebase.js';
import { adminLoginHTML, setupAdminLoginEvents } from './admin-login.js';
import { adminDashboardHTML, setupAdminDashboardEvents } from './admin-dashboard.js'; 
import { adminWalletHTML, setupAdminWalletEvents } from './admin-wallet.js';
import { adminUsersHTML, setupAdminUsersEvents } from './admin-users.js'; 
import { adminWithdrawHTML, setupAdminWithdrawEvents } from './admin-withdraw.js'; 
import { adminNotifyHTML, setupAdminNotifyEvents } from './admin-notify.js';
import { adminSettingsHTML, setupAdminSettingsEvents } from './admin-settings.js';
import { adminDistributorHTML, setupAdminDistributorEvents } from './admin-distributor.js';
import { adminFundsHTML, setupAdminFundsEvents } from './admin-funds.js';

const ADMIN_UID = "2OcCMmUcVORQyXMMXuk94rLwP1G2";
const appContainer = document.getElementById('admin-app');

const adminLayoutHTML = `
    <div id="mobile-overlay" class="fixed inset-0 bg-black/50 z-20 hidden md:hidden transition-opacity"></div>

    <aside id="admin-sidebar" class="w-72 bg-adminSidebar h-full text-gray-300 flex flex-col shadow-2xl fixed md:relative z-30 shrink-0 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out">
        <div class="p-6 border-b border-gray-800 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-adminPrimary rounded-lg flex items-center justify-center text-white shadow-md">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                    <h1 class="text-sm font-black text-white uppercase tracking-wider">Admin Panel</h1>
                    <p class="text-[9px] font-bold text-adminGold uppercase tracking-widest">AMP Growth Units</p>
                </div>
            </div>
            <button id="btn-close-sidebar" class="md:hidden text-gray-400 hover:text-white p-2">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>

        <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
            <button class="admin-tab active w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-adminPrimary text-white shadow-md transition-all" data-tab="dashboard">
                <i class="fa-solid fa-chart-pie w-5"></i> Dashboard
            </button>
            <button class="admin-tab w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 hover:text-white transition-all" data-tab="users">
                <i class="fa-solid fa-users w-5"></i> Users & KYC
            </button>
            <button class="admin-tab w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 hover:text-white transition-all relative" data-tab="wallet">
                <i class="fa-solid fa-wallet w-5"></i> Wallet Requests
                <span class="absolute right-4 bg-adminGold text-white text-[9px] px-2 py-0.5 rounded-full">New</span>
            </button>
            <button class="admin-tab w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 hover:text-white transition-all text-adminGold bg-yellow-500/10" data-tab="distributor">
                <i class="fa-solid fa-calculator w-5"></i> Profit Distributor
            </button>
            <button class="admin-tab w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 hover:text-white transition-all" data-tab="funds">
                <i class="fa-solid fa-vault w-5"></i> Funds & Expenses
            </button>
            <button class="admin-tab w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 hover:text-white transition-all" data-tab="withdraw">
                <i class="fa-solid fa-building-columns w-5"></i> Withdrawals
            </button>
            <button class="admin-tab w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 hover:text-white transition-all" data-tab="notify">
                <i class="fa-solid fa-bell w-5"></i> Notifications
            </button>
            <button class="admin-tab w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 hover:text-white transition-all" data-tab="settings">
                <i class="fa-solid fa-gear w-5"></i> Settings
            </button>
        </nav>

        <div class="p-4 border-t border-gray-800">
            <button id="btn-admin-logout" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Secure Logout
            </button>
        </div>
    </aside>

    <main class="flex-1 h-full overflow-y-auto bg-adminBg flex flex-col relative w-full" id="main-wrapper">
        <header class="md:hidden bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 border-b border-gray-100">
            <div class="flex items-center gap-3">
                <button id="btn-open-sidebar" class="text-gray-800 p-1 hover:text-adminPrimary transition-colors">
                    <i class="fa-solid fa-bars text-xl"></i>
                </button>
                <h2 class="text-lg font-bold text-gray-800" id="mobile-header-title">Dashboard</h2>
            </div>
            
            <div id="btn-header-dashboard" class="w-10 h-10 bg-adminPrimary rounded-xl flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-[#0a4d2c] transition-all active:scale-95">
                <i class="fa-solid fa-user-shield text-sm"></i>
            </div>
        </header>

        <div id="admin-content-area" class="flex-1 p-4 md:p-6">
            <div class="w-full h-full flex flex-col items-center justify-center opacity-50 pt-20">
                <i class="fa-solid fa-spinner fa-spin text-4xl text-adminPrimary mb-4"></i>
                <p class="font-bold">Loading Module...</p>
            </div>
        </div>
    </main>
`;

const loadAdminDashboard = () => {
    const contentArea = document.getElementById('admin-content-area');
    contentArea.innerHTML = adminDashboardHTML;
    setupAdminDashboardEvents();
};

const setupAdminLayoutEvents = () => {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('mobile-overlay');
    const btnOpen = document.getElementById('btn-open-sidebar');
    const btnClose = document.getElementById('btn-close-sidebar');
    const mobileHeaderTitle = document.getElementById('mobile-header-title');

    // NAYA: Header Admin Icon Click Event (To go back to Dashboard)
    document.getElementById('btn-header-dashboard').addEventListener('click', () => {
        document.querySelector('[data-tab="dashboard"]')?.click();
    });

    // Sidebar Toggles Logic
    const openSidebar = () => {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    };

    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    };

    btnOpen.addEventListener('click', openSidebar);
    btnClose.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Logout Logic
    document.getElementById('btn-admin-logout').addEventListener('click', () => {
        Swal.fire({
            title: 'Logout Admin?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Logout'
        }).then((result) => {
            if (result.isConfirmed) {
                auth.signOut().then(() => window.location.reload());
            }
        });
    });

    // Tab switching logic
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => {
                t.classList.remove('bg-adminPrimary', 'text-white', 'shadow-md');
                t.classList.add('hover:bg-gray-800', 'hover:text-white');
            });
            const clickedTab = e.currentTarget;
            clickedTab.classList.remove('hover:bg-gray-800', 'hover:text-white');
            clickedTab.classList.add('bg-adminPrimary', 'text-white', 'shadow-md');
            
            const tabName = clickedTab.innerText.trim();
            if (mobileHeaderTitle) mobileHeaderTitle.innerText = tabName;
            if (window.innerWidth < 768) closeSidebar(); 
            
            const contentArea = document.getElementById('admin-content-area');

                       // Routing Logic
            if(clickedTab.dataset.tab === 'dashboard') {
                loadAdminDashboard();
            } else if (clickedTab.dataset.tab === 'wallet') {
                contentArea.innerHTML = adminWalletHTML;
                setupAdminWalletEvents();
            } else if (clickedTab.dataset.tab === 'users') {
                contentArea.innerHTML = adminUsersHTML;
                setupAdminUsersEvents();
            } else if (clickedTab.dataset.tab === 'withdraw') {
                contentArea.innerHTML = adminWithdrawHTML;
                setupAdminWithdrawEvents();
            } else if (clickedTab.dataset.tab === 'notify') {
                contentArea.innerHTML = adminNotifyHTML;
                setupAdminNotifyEvents();
            } else if (clickedTab.dataset.tab === 'settings') {
                contentArea.innerHTML = adminSettingsHTML;
                setupAdminSettingsEvents();
            } else if (clickedTab.dataset.tab === 'distributor') {
                contentArea.innerHTML = adminDistributorHTML;
                setupAdminDistributorEvents();
            } else if (clickedTab.dataset.tab === 'funds') {
                contentArea.innerHTML = adminFundsHTML;
                setupAdminFundsEvents();
            } else {
                contentArea.innerHTML = `
                    <div class="space-y-6 w-full max-w-6xl mx-auto">
                        <h2 class="text-2xl font-black text-gray-800 hidden md:block">${tabName} Module</h2>
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-12">
                            <i class="fa-solid fa-person-digging text-4xl text-gray-300 mb-4"></i>
                            <p class="text-gray-500 font-bold">This module is under construction.</p>
                        </div>
                    </div>
                `;
            }
        });
    });
};

const initAdminApp = () => {
    appContainer.innerHTML = adminLayoutHTML;
    
    gsap.from("aside", { opacity: 0, duration: 0.5, ease: "power2.out" });
    gsap.from("header", { y: -20, opacity: 0, duration: 0.4, delay: 0.1 });
    gsap.from("#admin-content-area", { opacity: 0, duration: 0.5, delay: 0.2 });
    
    setupAdminLayoutEvents();
    loadAdminDashboard();
};

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user && user.uid === ADMIN_UID) {
            initAdminApp();
        } else {
            if(user) auth.signOut();
            appContainer.innerHTML = adminLoginHTML;
            setupAdminLoginEvents(initAdminApp);
        }
    });
});