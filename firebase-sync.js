// ============================================
// FIREBASE SYNC MODULE
// ============================================

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACPbxEIMbVGaV-Mo7KEfN6r-7MgvQRVpY",
  authDomain: "agri-fine-ventures-ec293.firebaseapp.com",
  databaseURL: "https://agri-fine-ventures-ec293-default-rtdb.firebaseio.com",
  projectId: "agri-fine-ventures-ec293",
  storageBucket: "agri-fine-ventures-ec293.firebasestorage.app",
  messagingSenderId: "95265953023",
  appId: "1:95265953023:web:283ea25b651e1a5ae4e8ca",
  measurementId: "G-MCT663JWEP"
};

let firebaseApp = null;
let db = null;
let firebaseReady = false;

// Initialize Firebase
async function initFirebase() {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    // Initialize Analytics
    getAnalytics(firebaseApp);
    db = getDatabase(firebaseApp);
    firebaseReady = true;
    console.log('Firebase initialized successfully');
    return true;
  } catch (e) {
    console.error('Firebase init error:', e);
  }
  return false;
}

// Save state to Firebase
async function saveToFirebase(stateData) {
  if (!firebaseReady || !db) return false;
  try {
    await set(ref(db, 'farmState'), stateData);
    console.log('State saved to Firebase');
    return true;
  } catch (e) {
    console.error('Error saving to Firebase:', e);
    return false;
  }
}

// Load state from Firebase
async function loadFromFirebase() {
  if (!firebaseReady || !db) return null;
  try {
    const snapshot = await get(ref(db, 'farmState'));
    if (snapshot.exists()) {
      console.log('State loaded from Firebase');
      return snapshot.val();
    }
  } catch (e) {
    console.error('Error loading from Firebase:', e);
  }
  return null;
}

// Check if Firebase is ready
function isFirebaseReady() {
  return firebaseReady;
}

// Export functions
window.FirebaseSync = {
  initFirebase,
  saveToFirebase,
  loadFromFirebase,
  isFirebaseReady
};
