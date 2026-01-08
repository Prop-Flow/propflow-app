
import 'dotenv/config';
import { db } from '../lib/services/firebase-admin';

async function testConnection() {
    console.log('--- Environment Debug ---');
    console.log('NEXT_PUBLIC_GCP_PROJECT_ID:', process.env.NEXT_PUBLIC_GCP_PROJECT_ID ? 'Set' : 'Missing');
    console.log('GCP_CLIENT_EMAIL:', process.env.GCP_CLIENT_EMAIL ? 'Set' : 'Missing');
    console.log('GCP_PRIVATE_KEY:', process.env.GCP_PRIVATE_KEY ? 'Set' : 'Missing');
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Set' : 'Missing');
    console.log('-------------------------');

    console.log('--- Testing Firestore Connection ---');
    try {
        const collections = await db.listCollections();
        console.log('Successfully connected to Firestore!');
        console.log('Collections fround:', collections.map(c => c.id).join(', ') || 'None (DB is empty but connected)');
        process.exit(0);
    } catch (error) {
        console.error('Firestore Connection Failed:', error);
        process.exit(1);
    }
}

testConnection();
