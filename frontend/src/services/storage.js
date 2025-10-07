import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    query, 
    where,
    orderBy,
    serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Get user-specific collection path
const getUserCollection = (userId, pdfId, collectionName) => {
    return collection(db, 'users', userId, 'pdfs', pdfId, collectionName);
};

// HIGHLIGHTS
export const saveHighlight = async (pdfId, highlightData) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Not authenticated');

        const highlightsRef = getUserCollection(userId, pdfId, 'highlights');
        const docRef = await addDoc(highlightsRef, {
            ...highlightData,
            createdAt: serverTimestamp(),
            userId
        });

        return { id: docRef.id, ...highlightData };
    } catch (error) {
        console.error('Error saving highlight:', error);
        throw error;
    }
};

export const getHighlights = async (pdfId) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];

        const highlightsRef = getUserCollection(userId, pdfId, 'highlights');
        const q = query(highlightsRef, orderBy('createdAt', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting highlights:', error);
        return [];
    }
};

export const deleteHighlight = async (pdfId, highlightId) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Not authenticated');

        const highlightRef = doc(db, 'users', userId, 'pdfs', pdfId, 'highlights', highlightId);
        await deleteDoc(highlightRef);
        return true;
    } catch (error) {
        console.error('Error deleting highlight:', error);
        throw error;
    }
};

// NOTES
export const saveNote = async (pdfId, noteData) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Not authenticated');

        const notesRef = getUserCollection(userId, pdfId, 'notes');
        const docRef = await addDoc(notesRef, {
            ...noteData,
            createdAt: serverTimestamp(),
            userId
        });

        return { id: docRef.id, ...noteData };
    } catch (error) {
        console.error('Error saving note:', error);
        throw error;
    }
};

export const getNotes = async (pdfId) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];

        const notesRef = getUserCollection(userId, pdfId, 'notes');
        const q = query(notesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting notes:', error);
        return [];
    }
};

export const updateNote = async (pdfId, noteId, updates) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Not authenticated');

        const noteRef = doc(db, 'users', userId, 'pdfs', pdfId, 'notes', noteId);
        await updateDoc(noteRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating note:', error);
        throw error;
    }
};

export const deleteNote = async (pdfId, noteId) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Not authenticated');

        const noteRef = doc(db, 'users', userId, 'pdfs', pdfId, 'notes', noteId);
        await deleteDoc(noteRef);
        return true;
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
};