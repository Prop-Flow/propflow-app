import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID || process.env.GCP_PROJECT_ID;
        const clientEmail = process.env.GCP_CLIENT_EMAIL;
        const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId,
            });
            console.log('Firebase Admin initialized with ADC');
        } else if (clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                projectId,
            });
            console.log('Firebase Admin initialized with Env Vars');
        } else {
            // Fallback: Try ADC anyway, but log warning
            console.warn('No GOOGLE_APPLICATION_CREDENTIALS or GCP_CLIENT_EMAIL/PRIVATE_KEY found. Attempting ADC...');
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId,
            });
        }
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
