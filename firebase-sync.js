// ============================================
// FIREBASE SYNC MODULE
// ============================================

// Firebase configuration
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemo-ReplaceWithYourKey",
  authDomain: "agri-fine-ventures-ec293.firebaseapp.com",
  databaseURL: "https://agri-fine-ventures-ec293-default-rtdb.firebaseio.com",
  projectId: "agri-fine-ventures-ec293",
  storageBucket: "agri-fine-ventures-ec293.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

let firebaseApp = null;
let db = null;
let firebaseReady = false;

// Initialize Firebase
async function initFirebase() {
  try {
    if (window.firebaseModules) {
      const { initializeApp, getDatabase } = window.firebaseModules;
      firebaseApp = initializeApp(FIREBASE_CONFIG);
      db = getDatabase(firebaseApp);
      firebaseReady = true;
      console.log('Firebase initialized successfully');
      return true;
    }
  } catch (e) {
    console.error('Firebase init error:', e);
  }
  return false;
}

// Save state to Firebase
async function saveToFirebase(stateData) {
  if (!firebaseReady || !db) return false;
  try {
    const { set, ref } = window.firebaseModules;
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
    const { get, ref } = window.firebaseModules;
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
