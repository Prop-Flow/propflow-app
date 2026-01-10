import { FirebaseApp, initializeApp, getApps, getApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// Initialize Firebase (Singleton)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD-MpLQYzlBruNZYcZUiEBIxZRWFMJ6MoU",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "propflow-ai-483621.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "propflow-ai-483621",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "propflow-ai-483621.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "638502512734",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:638502512734:web:d5a6d20ddbec647f91eccf",
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
        if (typeof window !== 'undefined') {
            console.log('[Firebase] Client initialized successfully for project:', firebaseConfig.projectId);
        }
    } catch (error) {
        if (typeof window !== 'undefined') {
            console.error('[Firebase] Initialization error:', error);
        }
    }
} else {
    if (typeof window !== 'undefined') {
        console.warn('[Firebase] API Key missing. Skipping initialization. Check environment variables.');
    }
}

// Export as non-null to avoid strict null checks in consumers (matches previous 'any' behavior)
// Runtime safety is handled by the initialization logic and global environment checks
export const app = _app!;
export const auth = _auth!;
export const db = _db!;
