const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');
const { admin } = require('../services/firebase');

const db = admin.firestore();

// Create note
router.post('/', authenticate, async (req, res) => {
    try {
        const { readingId, text, reference } = req.body;
        
        if (!text || !reference) {
            return res.status(400).json({ error: 'text and reference are required' });
        }
        
        const note = {
            userId: req.user.uid,
            readingId: sanitizeInput(readingId),
            text: sanitizeInput(text),
            reference: sanitizeInput(reference),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('notes').add(note);
        res.json({ id: docRef.id, message: 'Note saved successfully' });
        
    } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).json({ error: 'Failed to save note' });
    }
});

// Get notes
router.get('/', authenticate, async (req, res) => {
    try {
        const { readingId } = req.query;
        
        let query = db.collection('notes').where('userId', '==', req.user.uid);
        
        if (readingId) {
            query = query.where('readingId', '==', readingId);
        }
        
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        
        const notes = [];
        snapshot.forEach(doc => {
            notes.push({ id: doc.id, ...doc.data() });
        });
        
        res.json({ notes });
        
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Delete note
router.delete('/:noteId', authenticate, async (req, res) => {
    try {
        const { noteId } = req.params;
        const noteRef = db.collection('notes').doc(noteId);
        const doc = await noteRef.get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        if (doc.data().userId !== req.user.uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await noteRef.delete();
        res.json({ message: 'Note deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

module.exports = router;