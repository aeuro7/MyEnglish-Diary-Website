import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAutiLS8dxNiRHQrx0BUGLvtoeMsKPZZa4",
  authDomain: "myeng-fd4fc.firebaseapp.com",
  projectId: "myeng-fd4fc",
  storageBucket: "myeng-fd4fc.firebasestorage.app",
  messagingSenderId: "1063834456789",
  appId: "1:1063834456789:web:d82c5b1ae5729b17cac85c",
  measurementId: "G-HM1VM80EZY"
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
const db: Firestore = getFirestore(app);

// Initialize Analytics (only in browser)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics, db };

