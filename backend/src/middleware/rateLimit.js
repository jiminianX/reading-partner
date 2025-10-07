const admin = require('firebase-admin');
const db = admin.firestore();

const trackUsage = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const today = new Date().toISOString().split('T')[0];
        const usageRef = db.collection('usage').doc(userId);
        
        const doc = await usageRef.get();
        const usage = doc.exists ? doc.data() : {};
        const dailyCount = usage[today] || 0;
        
        if (dailyCount >= parseInt(process.env.DAILY_LIMIT || 100)) {
            return res.status(429).json({ 
                error: 'Daily usage limit reached. Please try again tomorrow.' 
            });
        }
        
        await usageRef.set({
            [today]: dailyCount + 1
        }, { merge: true });
        
        next();
    } catch (error) {
        console.error('Usage tracking error:', error);
        next();
    }
};

module.exports = { trackUsage };