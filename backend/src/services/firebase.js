const admin = require('firebase-admin');

const initializeFirebase = () => {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
        console.log('✅ Firebase Admin initialized successfully');
        return admin.firestore();
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error.message);
        process.exit(1);
    }
};

module.exports = { initializeFirebase, admin };