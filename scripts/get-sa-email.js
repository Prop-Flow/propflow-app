#!/usr/bin/env node
/**
 * Safely extract service account email from GCP_SA_KEY without printing full JSON
 * Usage: node scripts/get-sa-email.js [path-to-key-file]
 */

const fs = require('fs');
const path = require('path');

// Accept file path as argument, fallback to env var or default location
const keyPath = process.argv[2] ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(__dirname, '..', 'firebase-service-account-key.json');

try {
    if (!fs.existsSync(keyPath)) {
        console.error('❌ Service account key file not found at:', keyPath);
        process.exit(1);
    }

    const keyContent = fs.readFileSync(keyPath, 'utf8');
    const keyData = JSON.parse(keyContent);

    if (!keyData.client_email) {
        console.error('❌ client_email not found in service account key');
        process.exit(1);
    }

    // Print formatted output for IAM admin
    console.log('Service Account:', keyData.client_email);

} catch (error) {
    console.error('❌ Error reading service account key:', error.message);
    process.exit(1);
}
