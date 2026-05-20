// src/admin-notify.js
import { db, storage } from './firebase.js'; // Make sure storage is exported from firebase.js
import { ref as dbRef, get, push, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

export const adminNotifyHTML = `
    <div class="space-y-6 w-full max-w-4xl mx-auto pb-10">
        <div class="flex justify-between items-center hidden md:flex mb-6">
            <div>
                <h2 class="text-2xl font-black text-gray-800">Notification Center</h2>
                <p class="text-xs text-gray-500 font-bold mt-1">Send push alerts, updates, and promotional banners to users</p>
            </div>
            <div class="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-purple-100 shadow-sm">
                <i class="fa-solid fa-satellite-dish animate-pulse"></i> Broadcast Live
            </div>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div class="space-y-5">
                
                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Target Audience</label>
                    <select id="notify-target" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none text-gray-800 font-black focus:border-adminPrimary transition-all cursor-pointer">
                        <option value="all">📢 Broadcast to ALL Users</option>
                        <option value="specific">👤 Send to a Specific User</option>
                    </select>
                </div>

                <div id="specific-user-container" class="hidden border-l-4 border-adminPrimary pl-4 py-2">
                    <label class="text-xs font-bold text-adminPrimary uppercase tracking-wider ml-1">Select User</label>
                    <select id="notify-user-select" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-gray-800 font-medium focus:border-adminPrimary transition-all cursor-pointer">
                        <option value="">Loading users...</option>
                    </select>
                </div>

                <hr class="border-gray-100 my-4">

                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Quick Templates</label>
                    <div class="flex flex-wrap gap-2 mt-2">
                        <button type="button" class="btn-quick-tag px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-[10px] font-bold hover:bg-adminPrimary hover:text-white hover:border-adminPrimary transition-all active:scale-95" 
                            data-title="Wallet mein balance kam hai ⚠️" 
                            data-msg="Aapke wallet mein balance kam hai. Kripya jald se jald wallet recharge karein taaki aapki SIP installments miss na ho.">
                            #InsufficientBalance
                        </button>
                        <button type="button" class="btn-quick-tag px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-[10px] font-bold hover:bg-adminPrimary hover:text-white hover:border-adminPrimary transition-all active:scale-95" 
                            data-title="Invest in AGU Units 🚀" 
                            data-msg="Aapke paas ek shandaar mauka hai! Aaj hi AGU units purchase karein aur long-term portfolio growth ka fayda uthayein.">
                            #BuyAGU
                        </button>
                        <button type="button" id="btn-clear-tags" class="px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100">
                            Clear Text
                        </button>
                    </div>
                </div>

                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Notification Title</label>
                    <input type="text" id="notify-title" placeholder="e.g., Wallet Recharge Successful! 🎉" class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-gray-800 font-black focus:border-adminPrimary transition-all">
                </div>

                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Message Body</label>
                    <textarea id="notify-message" rows="3" placeholder="Write your detailed message here..." class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-gray-800 font-medium focus:border-adminPrimary transition-all resize-none"></textarea>
                </div>

                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Attach Image Banner (Optional)</label>
                    <div class="mt-2 flex items-center gap-4">
                        <label class="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-adminPrimary hover:bg-green-50 transition-colors overflow-hidden relative shadow-sm">
                            <input type="file" id="notify-image-input" accept="image/jpeg, image/png, image/jpg" class="hidden">
                            <i class="fa-solid fa-cloud-arrow-up text-gray-400 text-2xl" id="notify-image-icon"></i>
                            <img id="notify-image-preview" src="" class="absolute inset-0 w-full h-full object-cover hidden">
                        </label>
                        <div class="flex-1">
                            <p class="text-sm font-bold text-gray-700">Upload promotional poster</p>
                            <p class="text-[10px] text-gray-400 font-medium mt-0.5">JPG or PNG format. Max size: 2MB.</p>
                            <button type="button" id="btn-remove-image" class="text-[10px] font-bold text-red-500 mt-2 hidden hover:underline bg-red-50 px-2 py-1 rounded">
                                <i class="fa-solid fa-trash-can mr-1"></i> Remove Image
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Message Theme</label>
                    <div class="flex flex-wrap gap-4 mt-2">
                        <label class="flex items-center gap-2 cursor-pointer bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                            <input type="radio" name="notify_type" value="info" checked class="accent-blue-600 w-4 h-4">
                            <span class="text-sm font-bold text-blue-600"><i class="fa-solid fa-circle-info mr-1"></i> Info</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer bg-green-50 px-4 py-2 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
                            <input type="radio" name="notify_type" value="success" class="accent-green-600 w-4 h-4">
                            <span class="text-sm font-bold text-green-600"><i class="fa-solid fa-check-circle mr-1"></i> Success</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100 hover:bg-yellow-100 transition-colors">
                            <input type="radio" name="notify_type" value="warning" class="accent-yellow-600 w-4 h-4">
                            <span class="text-sm font-bold text-yellow-600"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Warning</span>
                        </label>
                    </div>
                </div>

                <button id="btn-send-notification" class="w-full bg-adminPrimary hover:bg-[#0a4d2c] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 mt-6 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg">
                    <i class="fa-solid fa-paper-plane"></i> Send Notification
                </button>
            </div>
        </div>
    </div>
`;

// Helper: Compress Image before upload
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
                const maxDim = 800; // Limit dimensions for notifications
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

export const setupAdminNotifyEvents = () => {
    const targetSelect = document.getElementById('notify-target');
    const specificContainer = document.getElementById('specific-user-container');
    const userSelect = document.getElementById('notify-user-select');
    const titleInput = document.getElementById('notify-title');
    const messageInput = document.getElementById('notify-message');
    
    // Image Elements
    const imageInput = document.getElementById('notify-image-input');
    const imagePreview = document.getElementById('notify-image-preview');
    const imageIcon = document.getElementById('notify-image-icon');
    const btnRemoveImage = document.getElementById('btn-remove-image');

    let allUsers = [];
    let selectedImageFile = null;

    // Users load karna
    get(dbRef(db, 'users')).then((snapshot) => {
        if (snapshot.exists()) {
            let optionsHtml = '<option value="">-- Select a User --</option>';
            snapshot.forEach(child => {
                const u = child.val();
                if (child.key !== "2OcCMmUcVORQyXMMXuk94rLwP1G2") { // Admin ID hide
                    allUsers.push({ uid: child.key, ...u });
                    optionsHtml += `<option value="${child.key}">${u.fullName || 'Unknown User'} (${u.phone || 'No Number'})</option>`;
                }
            });
            userSelect.innerHTML = optionsHtml;
        } else {
            userSelect.innerHTML = '<option value="">No users found</option>';
        }
    });

    // Dropdown Toggle
    targetSelect.addEventListener('change', (e) => {
        if (e.target.value === 'specific') {
            specificContainer.classList.remove('hidden');
        } else {
            specificContainer.classList.add('hidden');
        }
    });

    // --- QUICK TEMPLATES LOGIC ---
    document.querySelectorAll('.btn-quick-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
            titleInput.value = e.target.getAttribute('data-title');
            messageInput.value = e.target.getAttribute('data-msg');
        });
    });

    document.getElementById('btn-clear-tags').addEventListener('click', () => {
        titleInput.value = '';
        messageInput.value = '';
    });

    // --- IMAGE UPLOAD LOGIC ---
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedImageFile = file;
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreview.classList.remove('hidden');
                imageIcon.classList.add('hidden');
                btnRemoveImage.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    btnRemoveImage.addEventListener('click', () => {
        selectedImageFile = null;
        imageInput.value = '';
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        imageIcon.classList.remove('hidden');
        btnRemoveImage.classList.add('hidden');
    });

    // --- SEND NOTIFICATION LOGIC ---
    document.getElementById('btn-send-notification').addEventListener('click', async () => {
        const target = targetSelect.value;
        const selectedUid = userSelect.value;
        const title = titleInput.value.trim();
        const message = messageInput.value.trim();
        const type = document.querySelector('input[name="notify_type"]:checked').value;

        // Validations
        if (!title || !message) {
            Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Title and Message are required.', confirmButtonColor: '#0F6B3F' });
            return;
        }
        if (target === 'specific' && !selectedUid) {
            Swal.fire({ icon: 'warning', title: 'Select User', text: 'Please select a user to send the notification.', confirmButtonColor: '#0F6B3F' });
            return;
        }

        const btn = document.getElementById('btn-send-notification');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

        try {
            let uploadedImageUrl = null;

            // 1. Upload Image to Storage (If attached)
            if (selectedImageFile) {
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading Image...';
                const compressedBlob = await compressImage(selectedImageFile, 500);
                const fileName = `notification_images/${Date.now()}_${selectedImageFile.name}`;
                const imageRef = storageRef(storage, fileName);
                
                const snapshot = await uploadBytes(imageRef, compressedBlob);
                uploadedImageUrl = await getDownloadURL(snapshot.ref);
            }

            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Alert...';

            // 2. Prepare Data
            const notifData = {
                title: title,
                message: message,
                type: type,
                isRead: false,
                timestamp: serverTimestamp(),
                imageUrl: uploadedImageUrl || null // Attach image URL if exists
            };

            // 3. Send to Database
            if (target === 'all') {
                if(allUsers.length === 0) throw new Error("No users to send to.");
                const promises = allUsers.map(u => {
                    const newRef = push(dbRef(db, `notifications/${u.uid}`));
                    return set(newRef, { notifId: newRef.key, ...notifData });
                });
                await Promise.all(promises);
            } else {
                const newRef = push(dbRef(db, `notifications/${selectedUid}`));
                await set(newRef, { notifId: newRef.key, ...notifData });
            }

            Swal.fire({icon: 'success', title: 'Sent Successfully!', text: 'Notification has been delivered.', timer: 2000, showConfirmButton: false});
            
            // Clear Form
            titleInput.value = '';
            messageInput.value = '';
            btnRemoveImage.click(); // Reset image box
            
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to send notification.', 'error');
        } finally {
            btn.innerHTML = originalText;
        }
    });
};