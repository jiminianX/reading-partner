const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');
const { trackUsage } = require('../middleware/rateLimit');
const { callAnthropicAPI } = require('../services/anthropic');
const { admin } = require('../services/firebase');

const db = admin.firestore();

const CHECK_IN_PROMPT = `You are a reading comprehension tutor helping a student engage deeply with a text. The student is on page {PAGE} of their reading.

Their prior knowledge: {PRIOR_KNOWLEDGE}
Their learning goals: {LEARNING_GOALS}

Based on the following passage they are currently reading, generate ONE check-in question to help them process and engage with the material. Choose one of these question types and pick the most appropriate for this passage:
- "summarize": Ask them to summarize what they just read in their own words
- "predict": Ask them to predict what might come next or what the author will argue
- "connect": Ask them to connect what they read to their prior knowledge or learning goals
- "vocabulary": Ask about a specific word or concept from the passage

Return ONLY a JSON object with this structure:
{
  "prompt": "the question to ask",
  "checkInType": "summarize|predict|connect|vocabulary"
}

PASSAGE:
{TEXT}`;

// Save pre-reading data
router.post('/pre-reading', authenticate, async (req, res) => {
    try {
        const { readingId, priorKnowledge, learningGoals } = req.body;

        if (!readingId) {
            return res.status(400).json({ error: 'readingId is required' });
        }

        const doc = {
            userId: req.user.uid,
            readingId,
            type: 'pre-reading',
            priorKnowledge: sanitizeInput(priorKnowledge || ''),
            learningGoals: sanitizeInput(learningGoals || ''),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('scaffolding').add(doc);
        res.json({ id: docRef.id, message: 'Pre-reading saved' });
    } catch (error) {
        console.error('Error saving pre-reading:', error);
        res.status(500).json({ error: 'Failed to save pre-reading data' });
    }
});

// Get pre-reading data for a reading
router.get('/pre-reading/:readingId', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('scaffolding')
            .where('userId', '==', req.user.uid)
            .where('readingId', '==', req.params.readingId)
            .where('type', '==', 'pre-reading')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.json({ preReading: null });
        }

        const doc = snapshot.docs[0];
        res.json({ preReading: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('Error fetching pre-reading:', error);
        res.status(500).json({ error: 'Failed to fetch pre-reading data' });
    }
});

// Generate AI check-in question
router.post('/generate-check-in', authenticate, trackUsage, async (req, res) => {
    try {
        const { text, priorKnowledge, learningGoals, pageNumber } = req.body;

        if (!text || text.length < 50) {
            return res.status(400).json({ error: 'Text must be at least 50 characters' });
        }

        const prompt = CHECK_IN_PROMPT
            .replace('{PAGE}', pageNumber || '?')
            .replace('{PRIOR_KNOWLEDGE}', sanitizeInput(priorKnowledge || 'Not provided'))
            .replace('{LEARNING_GOALS}', sanitizeInput(learningGoals || 'Not provided'))
            .replace('{TEXT}', sanitizeInput(text));

        const data = await callAnthropicAPI(text, prompt);
        const aiResponse = data.content[0].text;

        let result;
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            result = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
        } catch (e) {
            result = {
                prompt: 'Take a moment to summarize what you just read in your own words. What were the key points?',
                checkInType: 'summarize'
            };
        }

        await db.collection('analytics').add({
            userId: req.user.uid,
            action: 'generate_check_in',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            textLength: text.length,
            tokensUsed: data.usage
        });

        res.json(result);
    } catch (error) {
        console.error('Error generating check-in:', error);
        res.status(500).json({ error: 'Failed to generate check-in question' });
    }
});

// Save check-in response
router.post('/check-in', authenticate, async (req, res) => {
    try {
        const { readingId, prompt, response, checkInType, pageNumber } = req.body;

        if (!readingId || !response) {
            return res.status(400).json({ error: 'readingId and response are required' });
        }

        const doc = {
            userId: req.user.uid,
            readingId,
            type: 'check-in',
            prompt: sanitizeInput(prompt || ''),
            response: sanitizeInput(response),
            checkInType: sanitizeInput(checkInType || 'summarize'),
            pageNumber: parseInt(pageNumber) || 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('scaffolding').add(doc);
        res.json({ id: docRef.id, message: 'Check-in saved' });
    } catch (error) {
        console.error('Error saving check-in:', error);
        res.status(500).json({ error: 'Failed to save check-in' });
    }
});

// Get all check-ins for a reading
router.get('/check-ins/:readingId', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('scaffolding')
            .where('userId', '==', req.user.uid)
            .where('readingId', '==', req.params.readingId)
            .where('type', '==', 'check-in')
            .orderBy('createdAt', 'asc')
            .get();

        const checkIns = [];
        snapshot.forEach(doc => {
            checkIns.push({ id: doc.id, ...doc.data() });
        });

        res.json({ checkIns });
    } catch (error) {
        console.error('Error fetching check-ins:', error);
        res.status(500).json({ error: 'Failed to fetch check-ins' });
    }
});

// Save post-reading reflection
router.post('/reflection', authenticate, async (req, res) => {
    try {
        const { readingId, response } = req.body;

        if (!readingId || !response) {
            return res.status(400).json({ error: 'readingId and response are required' });
        }

        const doc = {
            userId: req.user.uid,
            readingId,
            type: 'reflection',
            response: sanitizeInput(response),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('scaffolding').add(doc);
        res.json({ id: docRef.id, message: 'Reflection saved' });
    } catch (error) {
        console.error('Error saving reflection:', error);
        res.status(500).json({ error: 'Failed to save reflection' });
    }
});

// Get reflection for a reading
router.get('/reflection/:readingId', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('scaffolding')
            .where('userId', '==', req.user.uid)
            .where('readingId', '==', req.params.readingId)
            .where('type', '==', 'reflection')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.json({ reflection: null });
        }

        const doc = snapshot.docs[0];
        res.json({ reflection: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error('Error fetching reflection:', error);
        res.status(500).json({ error: 'Failed to fetch reflection' });
    }
});

module.exports = router;
