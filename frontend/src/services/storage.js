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

// ALL READINGS
export const getAllReadings = async () => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];

        const pdfsRef = collection(db, 'users', userId, 'pdfs');
        const snapshot = await getDocs(pdfsRef);

        return snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
    } catch (error) {
        console.error('Error getting all readings:', error);
        return [];
    }
};

// Save a reading reference (when PDF is uploaded)
export const saveReading = async (readingData) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Not authenticated');

        const pdfsRef = collection(db, 'users', userId, 'pdfs');
        const docRef = await addDoc(pdfsRef, {
            ...readingData,
            createdAt: serverTimestamp(),
            userId
        });

        return { id: docRef.id, ...readingData };
    } catch (error) {
        console.error('Error saving reading:', error);
        throw error;
    }
};

export const deleteReading = async (readingId) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Not authenticated');

        const readingRef = doc(db, 'users', userId, 'pdfs', readingId);
        await deleteDoc(readingRef);
        return true;
    } catch (error) {
        console.error('Error deleting reading:', error);
        throw error;
    }
};

// LINKS (Backlinks)
export const saveLink = async (linkData) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Not authenticated');

        const linksRef = collection(db, 'users', userId, 'links');
        const docRef = await addDoc(linksRef, {
            ...linkData,
            createdAt: serverTimestamp()
        });

        return { id: docRef.id, ...linkData };
    } catch (error) {
        console.error('Error saving link:', error);
        throw error;
    }
};

export const getLinksForReading = async (readingId) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];

        const linksRef = collection(db, 'users', userId, 'links');

        // Get outgoing links
        const outQ = query(linksRef, where('sourceReadingId', '==', readingId));
        const outSnap = await getDocs(outQ);
        const outgoing = outSnap.docs.map(d => ({ id: d.id, direction: 'outgoing', ...d.data() }));

        // Get incoming links
        const inQ = query(linksRef, where('targetReadingId', '==', readingId));
        const inSnap = await getDocs(inQ);
        const incoming = inSnap.docs.map(d => ({ id: d.id, direction: 'incoming', ...d.data() }));

        return [...outgoing, ...incoming];
    } catch (error) {
        console.error('Error getting links:', error);
        return [];
    }
};

export const getAllLinks = async () => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];

        const linksRef = collection(db, 'users', userId, 'links');
        const snapshot = await getDocs(linksRef);

        return snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
    } catch (error) {
        console.error('Error getting all links:', error);
        return [];
    }
};

export const deleteLink = async (linkId) => {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Not authenticated');

        const linkRef = doc(db, 'users', userId, 'links', linkId);
        await deleteDoc(linkRef);
        return true;
    } catch (error) {
        console.error('Error deleting link:', error);
        throw error;
    }
};