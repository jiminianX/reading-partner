const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');
const { admin } = require('../services/firebase');

const db = admin.firestore();

// Save reading
router.post('/', authenticate, async (req, res) => {
    try {
        const { fileName, text, tags } = req.body;
        
        if (!fileName || !text) {
            return res.status(400).json({ error: 'fileName and text are required' });
        }
        
        const reading = {
            userId: req.user.uid,
            fileName: sanitizeInput(fileName),
            text: sanitizeInput(text),
            tags: Array.isArray(tags) ? tags.map(t => sanitizeInput(t)).slice(0, 10) : [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('readings').add(reading);
        res.json({ id: docRef.id, message: 'Reading saved successfully' });
        
    } catch (error) {
        console.error('Error saving reading:', error);
        res.status(500).json({ error: 'Failed to save reading' });
    }
});

// Get readings
router.get('/', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('readings')
            .where('userId', '==', req.user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        
        const readings = [];
        snapshot.forEach(doc => {
            readings.push({ id: doc.id, ...doc.data() });
        });
        
        res.json({ readings });
        
    } catch (error) {
        console.error('Error fetching readings:', error);
        res.status(500).json({ error: 'Failed to fetch readings' });
    }
});

module.exports = router;