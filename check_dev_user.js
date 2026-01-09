
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account-key.json');
require('dotenv').config();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'propflow-ai-483621'
    });
}

async function checkAndCreateDevUser() {
    const email = 'dev@propflow.ai';
    try {
        const user = await admin.auth().getUserByEmail(email);
        console.log(`User ${email} exists with UID: ${user.uid}`);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log(`User ${email} not found. Creating...`);
            try {
                const user = await admin.auth().createUser({
                    email: email,
                    emailVerified: true,
                    password: 'Sharktank101!',
                    displayName: 'Developer Account',
                    disabled: false
                });
                console.log(`Successfully created new user: ${user.uid}`);

                // Add to users collection in Firestore if needed
                const db = admin.firestore();
                await db.collection('users').doc(user.uid).set({
                    email: email,
                    role: 'OWNER', // Grants access to owner dashboard
                    firstName: 'Dev',
                    lastName: 'Account',
                    createdAt: new Date().toISOString()
                });
                console.log('Created Firestore profile for dev user.');

            } catch (createError) {
                console.error('Error creating user:', createError);
            }
        } else {
            console.error('Error fetching user:', error);
        }
    }
}

checkAndCreateDevUser();
