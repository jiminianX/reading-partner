require('dotenv').config();

console.log('🔍 Checking Environment Variables...\n');

const checks = [
    { name: 'NODE_ENV', value: process.env.NODE_ENV },
    { name: 'PORT', value: process.env.PORT },
    { name: 'FRONTEND_URL', value: process.env.FRONTEND_URL },
    { name: 'FIREBASE_PROJECT_ID', value: process.env.FIREBASE_PROJECT_ID },
    { name: 'FIREBASE_CLIENT_EMAIL', value: process.env.FIREBASE_CLIENT_EMAIL },
    { name: 'FIREBASE_PRIVATE_KEY', value: process.env.FIREBASE_PRIVATE_KEY ? `Set (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : 'NOT SET' },
    { name: 'ANTHROPIC_API_KEY', value: process.env.ANTHROPIC_API_KEY ? `Set (starts with ${process.env.ANTHROPIC_API_KEY.substring(0, 15)}...)` : 'NOT SET' },
    { name: 'DAILY_LIMIT', value: process.env.DAILY_LIMIT },
];

let allGood = true;

checks.forEach(check => {
    const status = check.value ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${check.value || 'NOT SET'}`);
    if (!check.value) allGood = false;
});

console.log('\n' + (allGood ? '✅ All environment variables are set!' : '❌ Some environment variables are missing!'));