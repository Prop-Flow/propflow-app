import { FirebaseApp, initializeApp, getApps, getApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// Initialize Firebase (Singleton)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};



if (typeof window === 'undefined') {
    // console.log('Firebase Client Init (Server): API Key exists?', !!firebaseConfig.apiKey);
}

// Initialize Firebase (Singleton)
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

if (firebaseConfig.apiKey) {
    try {
        _app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        _auth = getAuth(_app);
        _db = getFirestore(_app);
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
} else {
    console.warn('Firebase API Key missing. Skipping initialization (Build/Server Mode).');
}

// Export as non-null to avoid strict null checks in consumers (matches previous 'any' behavior)
// Runtime safety is handled by the initialization logic and global environment checks
export const app = _app!;
export const auth = _auth!;
export const db = _db!;
