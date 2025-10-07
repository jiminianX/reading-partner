const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');
const { admin } = require('../services/firebase');

const db = admin.firestore();

// Save response
router.post('/', authenticate, async (req, res) => {
    try {
        const { readingId, questionIndex, response } = req.body;
        
        if (!response) {
            return res.status(400).json({ error: 'response is required' });
        }
        
        const responseDoc = {
            userId: req.user.uid,
            readingId: sanitizeInput(readingId),
            questionIndex: parseInt(questionIndex),
            response: sanitizeInput(response),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('responses').add(responseDoc);
        res.json({ id: docRef.id, message: 'Response saved successfully' });
        
    } catch (error) {
        console.error('Error saving response:', error);
        res.status(500).json({ error: 'Failed to save response' });
    }
});

module.exports = router;
