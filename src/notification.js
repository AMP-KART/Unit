// notification.js - Modern Rich Media Notification Component Module
import { auth, db } from './firebase.js';
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

export const notificationHTML = `
    <div class="min-h-screen bg-appBg pb-24 font-sans text-appText relative" id="notification-page-wrapper">
        <div class="bg-white px-6 py-5 shadow-sm rounded-b-3xl flex justify-between items-center z-10 relative">
            <div class="flex items-center gap-4">
                <button id="btn-back-from-notification" class="text-gray-600 hover:text-appGreen transition-colors flex items-center justify-center p-2 active:scale-95">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h2 class="text-lg font-bold text-appText">Notifications</h2>
            </div>
            <button id="btn-mark-all-read" class="text-xs font-bold text-appGreen hover:text-appGold transition-colors uppercase tracking-wide hidden">
                Mark all read
            </button>
        </div>

        <div class="p-4 md:p-6 space-y-4" id="notification-list">
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col items-center justify-center h-40">
                <i class="fa-solid fa-spinner fa-spin text-appGreen text-2xl mb-3"></i>
                <p class="text-gray-400 text-sm font-medium">Loading notifications...</p>
            </div>
        </div>

        <div id="image-modal" class="fixed inset-0 z-[99999] hidden bg-black/95 backdrop-blur-md flex-col items-center justify-center transition-opacity duration-300 opacity-0">
            <div class="absolute top-6 right-6 flex gap-4 z-50">
                <button id="btn-download-image" class="text-white hover:text-appGreen p-3 bg-white/20 rounded-full transition-colors backdrop-blur-md active:scale-95" title="Download Image">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </button>
                <button id="btn-close-modal" class="text-white hover:text-red-500 p-3 bg-white/20 rounded-full transition-colors backdrop-blur-md active:scale-95" title="Close">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="w-full h-full p-4 flex items-center justify-center relative">
                <img id="modal-image" src="" class="max-w-full max-h-full object-contain rounded-xl shadow-2xl transform scale-95 transition-transform duration-300">
            </div>
        </div>
    </div>
`;

export const setupNotificationEvents = (navigateToCallback, previousPageHTML, previousPageEvents) => {
    
    // --- GSAP ANIMATION FIX & MODAL PLACEMENT ---
    const imageModal = document.getElementById('image-modal');
    // NAYA FIX: Modal ko app container se bahar nikal kar direct body me daal diya taaki GSAP aur Z-index isko disturb na kare
    if (imageModal && imageModal.parentNode !== document.body) {
        document.body.appendChild(imageModal);
    }

    // Back Button Logic
    document.getElementById('btn-back-from-notification').addEventListener('click', () => {
        // NAYA FIX: Wapas jate waqt modal ko body se clear kar do
        if (imageModal && imageModal.parentNode === document.body) {
            document.body.removeChild(imageModal);
        }
        navigateToCallback(previousPageHTML, previousPageEvents);
    });

    const user = auth.currentUser;
    if (!user) return;

    const notifRef = ref(db, 'notifications/' + user.uid);
    const listContainer = document.getElementById('notification-list');
    const markAllBtn = document.getElementById('btn-mark-all-read');

    const modalImage = document.getElementById('modal-image');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnDownloadImage = document.getElementById('btn-download-image');

    // --- BULLETPROOF MODAL LOGIC ---
    const openImageModal = (imgSrc) => {
        modalImage.src = imgSrc;
        
        // Remove any inline styles GSAP might have forcefully applied
        imageModal.removeAttribute('style'); 
        
        imageModal.classList.remove('hidden');
        imageModal.classList.add('flex'); 
        
        // Trigger reflow (CSS Animation ke liye)
        void imageModal.offsetWidth;
        
        imageModal.classList.remove('opacity-0');
        imageModal.classList.add('opacity-100');
        modalImage.classList.remove('scale-95');
        modalImage.classList.add('scale-100');
    };

    const closeImageModal = () => {
        imageModal.classList.remove('opacity-100');
        imageModal.classList.add('opacity-0');
        modalImage.classList.remove('scale-100');
        modalImage.classList.add('scale-95');
        
        setTimeout(() => {
            imageModal.classList.add('hidden');
            imageModal.classList.remove('flex');
            modalImage.src = '';
        }, 300); // 300ms transition ke hisaab se
    };

    btnCloseModal.addEventListener('click', (e) => {
        e.stopPropagation();
        closeImageModal();
    });

    imageModal.addEventListener('click', (e) => {
        // Bahar click karne par band
        if (e.target === imageModal || e.target.parentElement === imageModal) {
            closeImageModal();
        }
    });

    btnDownloadImage.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            const response = await fetch(modalImage.src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `AGU_Alert_${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            window.open(modalImage.src, '_blank'); 
        }
    });

    let currentNotifs = {};

    onValue(notifRef, (snapshot) => {
        if (snapshot.exists()) {
            currentNotifs = snapshot.val();
            let html = '';
            let hasUnread = false;

            const sortedNotifs = Object.entries(currentNotifs).sort((a, b) => b[1].timestamp - a[1].timestamp);

            sortedNotifs.forEach(([id, notif]) => {
                if (!notif.isRead) hasUnread = true;

                let mediaHtml = '';
                if (notif.imageUrl) {
                    mediaHtml = `
                        <div class="relative mt-3 mb-1 cursor-pointer image-trigger overflow-hidden rounded-xl bg-gray-100 border border-gray-100 active:scale-95 transition-transform" data-img-src="${notif.imageUrl}">
                            <img src="${notif.imageUrl}" class="w-full h-40 object-cover shadow-sm pointer-events-none">
                            <div class="absolute inset-0 bg-black/10 flex flex-col justify-end p-2">
                                <span class="self-end bg-black/70 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 shadow-lg pointer-events-none">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                                    Tap to view
                                </span>
                            </div>
                        </div>
                    `;
                }

                let actionBtnHtml = '';
                if (notif.actionUrl) {
                    actionBtnHtml = `
                        <div class="mt-2">
                            <a href="${notif.actionUrl}" target="_blank" class="inline-flex items-center gap-1.5 bg-appGreen text-white text-[11px] font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-green-800 transition-colors">
                                ${notif.actionText || 'Open Link'}
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </a>
                        </div>
                    `;
                }

                const timeAgo = formatTimeAgo(notif.timestamp);

                html += `
                    <div class="p-4 rounded-2xl border transition-all ${notif.isRead ? 'bg-white border-gray-100' : 'bg-green-50/70 border-green-200 shadow-sm'} notif-card" data-id="${id}">
                        <div class="flex gap-3 items-start relative">
                            ${!notif.isRead ? '<span class="absolute top-1 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>' : ''}
                            
                            <div class="w-9 h-9 rounded-full ${notif.isRead ? 'bg-gray-50 text-gray-400' : 'bg-white text-appGreen shadow-inner'} flex items-center justify-center shrink-0 mt-0.5 pointer-events-none">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                </svg>
                            </div>
                            
                            <div class="flex-1 min-w-0 pr-3">
                                <h4 class="text-xs font-black text-gray-800 tracking-tight">${notif.title || 'Notification'}</h4>
                                <p class="text-[11px] text-gray-500 mt-1 leading-relaxed pointer-events-none">${notif.message || ''}</p>
                                ${mediaHtml}
                                ${actionBtnHtml}
                                <p class="text-[9px] font-bold text-gray-400 uppercase mt-2 tracking-wider pointer-events-none">${timeAgo}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            listContainer.innerHTML = html;

            if (hasUnread) {
                markAllBtn.classList.remove('hidden');
            } else {
                markAllBtn.classList.add('hidden');
            }
        } else {
            markAllBtn.classList.add('hidden');
            listContainer.innerHTML = `
                <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-50 flex flex-col items-center justify-center h-48 text-center">
                    <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.5 13H4"></path></svg>
                    </div>
                    <h4 class="text-xs font-bold text-gray-700">You're all caught up!</h4>
                    <p class="text-[11px] text-gray-400 mt-1">No new alerts or offers at the moment.</p>
                </div>
            `;
        }
    });

    // --- EVENT DELEGATION FOR ALL CLICKS ---
    listContainer.addEventListener('click', async (e) => {
        // 1. Agar Image pe click hua
        const imgTrigger = e.target.closest('.image-trigger');
        if (imgTrigger) {
            e.stopPropagation();
            openImageModal(imgTrigger.getAttribute('data-img-src'));
            
            // Mark as read immediately
            const card = imgTrigger.closest('.notif-card');
            if (card) {
                const notifId = card.getAttribute('data-id');
                if (currentNotifs[notifId] && !currentNotifs[notifId].isRead) {
                    await update(ref(db, `notifications/${user.uid}/${notifId}`), { isRead: true });
                }
            }
            return;
        }

        // 2. Agar kisi Link button par click hua (ignore modal)
        if (e.target.closest('a')) return;

        // 3. Normal Notification Card par click hua toh bas mark as read kare
        const card = e.target.closest('.notif-card');
        if (card) {
            const notifId = card.getAttribute('data-id');
            if (currentNotifs[notifId] && !currentNotifs[notifId].isRead) {
                await update(ref(db, `notifications/${user.uid}/${notifId}`), { isRead: true });
            }
        }
    });

    // Mark all read button
    markAllBtn.addEventListener('click', async () => {
        const updates = {};
        Object.keys(currentNotifs).forEach(id => {
            if (!currentNotifs[id].isRead) {
                updates[`notifications/${user.uid}/${id}/isRead`] = true;
            }
        });

        if (Object.keys(updates).length > 0) {
            markAllBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            await update(ref(db), updates);
            markAllBtn.innerText = 'Mark all read';
        }
    });
};

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
};
