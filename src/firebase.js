// src/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
// Naya: Storage Import
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5sOeB50QpurQaKYXe_rjaKE9Uy2J-w9E",
  authDomain: "amp-vendor.firebaseapp.com",
  databaseURL: "https://amp-vendor-default-rtdb.asia-southeast1.firebasedatabase.app", 
  projectId: "amp-vendor",
  storageBucket: "amp-vendor.firebasestorage.app",
  messagingSenderId: "928890157783",
  appId: "1:928890157783:web:b282c14e8c8cf9ca120e92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const db = getDatabase(app); 
export const storage = getStorage(app); // Storage Initialize ho gaya
export const googleProvider = new GoogleAuthProvider();

console.log("Firebase Services Connected Successfully! 🚀");
