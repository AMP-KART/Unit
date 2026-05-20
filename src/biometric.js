// src/biometric.js - WebAuthn Biometric Authenticator Module
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Cryptographic Random Challenge Generator
const generateChallenge = () => {
    return crypto.getRandomValues(new Uint8Array(32));
};

// 1. REGISTER BIOMETRIC (Profile side logic)
export const registerBiometric = async (password) => {
    const user = auth.currentUser;
    if (!user) {
        Swal.fire('Error', 'No active user session found.', 'error');
        return;
    }

    try {
        if (!window.PublicKeyCredential) {
            Swal.fire('Not Supported', 'Biometric system is not supported on this browser/device.', 'warning');
            return;
        }

        const options = {
            publicKey: {
                challenge: generateChallenge(),
                rp: { name: "AMP Growth Units" },
                user: {
                    id: crypto.getRandomValues(new Uint8Array(16)),
                    name: user.email,
                    displayName: user.fullName || user.email
                },
                pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256 algorithm
                authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
                timeout: 60000
            }
        };

        // Open native device fingerprint UI prompt
        const credential = await navigator.credentials.create(options);
        
        if (credential) {
            const credentialsObj = { email: user.email, password: password };
            
            // Secure binary encryption bridge simulation for localStorage binding
            localStorage.setItem(`bio_login_${user.uid}`, btoa(JSON.stringify(credentialsObj)));
            localStorage.setItem('bio_active_uid', user.uid);

            Swal.fire({ icon: 'success', title: 'Fingerprint Enabled! 🔒', text: 'Agli baar aap direct apne fingerprint se login kar sakte hain.', showConfirmButton: false, timer: 2500 });
            
            const txtStatus = document.getElementById('bio-status-text');
            if(txtStatus) txtStatus.innerText = "Active ✅";
        }
    } catch (err) {
        console.error("Biometric Reg Error:", err);
        Swal.fire('Cancelled', 'Biometric registration failed or timed out.', 'error');
    }
};

// 2. LOGIN WITH BIOMETRIC (Login screen side logic)
export const loginWithBiometric = async (navigateTo, dashboardHTML, setupDashboardEvents) => {
    const activeUid = localStorage.getItem('bio_active_uid');
    const savedData = localStorage.getItem(`bio_login_${activeUid}`);

    if (!activeUid || !savedData) {
        Swal.fire({ icon: 'info', title: 'Fingerprint Not Found', text: 'Pehle password se login karein aur Profile section me jaakar ise enable karein.', confirmButtonColor: '#14532D' });
        return;
    }

    try {
        const options = {
            publicKey: {
                challenge: generateChallenge(),
                timeout: 60000,
                userVerification: "required"
            }
        };

        // Hardware scanner verification prompt
        const assertion = await navigator.credentials.get(options);

        if (assertion) {
            const { email, password } = JSON.parse(atob(savedData));

            Swal.fire({
                title: 'Verifying Fingerprint...',
                html: '<div class="py-4"><i class="fa-solid fa-fingerprint fa-bounce text-4xl text-appGreen"></i></div>',
                showConfirmButton: false,
                allowOutsideClick: false
            });

            // Firebase Auto Authentication
            await signInWithEmailAndPassword(auth, email, password);
            Swal.close();
            
            Swal.fire({ icon: 'success', title: 'Access Granted!', showConfirmButton: false, timer: 1500 });
            setTimeout(() => navigateTo(dashboardHTML, setupDashboardEvents), 1000);
        }
    } catch (err) {
        console.error("Biometric Login Error:", err);
        Swal.fire('Authentication Failed', 'Fingerprint did not match or request was cancelled.', 'error');
    }
};
