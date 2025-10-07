import { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import PDFViewer from './components/PDFViewer/PDFViewer';
import ImageViewer from './components/PDFViewer/ImageViewer';
import UploadArea from './components/Upload/UploadArea';
import RightPanel from './components/RightPanel/RightPanel';
import {
    saveHighlight,
    getHighlights,
    deleteHighlight,
    saveNote,
    getNotes,
    deleteNote
} from './services/storage';
import './App.css';

function App() {
    const { currentUser } = useAuth();
    const [currentDocument, setCurrentDocument] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [notes, setNotes] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const navigateRef = useRef(null);

    // Load highlights and notes when document changes
    useEffect(() => {
        if (currentDocument?.id) {
            loadDocumentData();
        }
    }, [currentDocument?.id]);

    const loadDocumentData = async () => {
        if (!currentDocument?.id) return;
        
        setLoading(true);
        try {
            const [highlightsData, notesData] = await Promise.all([
                getHighlights(currentDocument.id),
                getNotes(currentDocument.id)
            ]);
            
            setHighlights(highlightsData);
            setNotes(notesData);
        } catch (error) {
            console.error('Error loading document data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (fileData) => {
        console.log('📦 Document selected:', fileData);
        
        setCurrentDocument(fileData);
        setHighlights([]);
        setNotes([]);
        setQuestions([]);
    };

    // Optimistic update for highlights
    const handleAddHighlight = async (highlightData) => {
        if (!currentDocument?.id) return;

        // Optimistic update
        const tempId = `temp_${Date.now()}`;
        const optimisticHighlight = { ...highlightData, id: tempId };
        setHighlights(prev => [...prev, optimisticHighlight]);

        try {
            // Save to Firebase
            const savedHighlight = await saveHighlight(currentDocument.id, highlightData);
            
            // Replace temp with real data
            setHighlights(prev => 
                prev.map(h => h.id === tempId ? savedHighlight : h)
            );
        } catch (error) {
            console.error('Error saving highlight:', error);
            // Rollback on error
            setHighlights(prev => prev.filter(h => h.id !== tempId));
            alert('Failed to save highlight. Please try again.');
        }
    };

    // Optimistic update for notes
    const handleAddNote = async (noteData) => {
        if (!currentDocument?.id) return;

        // Optimistic update
        const tempId = `temp_${Date.now()}`;
        const optimisticNote = { ...noteData, id: tempId };
        setNotes(prev => [optimisticNote, ...prev]);

        try {
            // Save to Firebase
            const savedNote = await saveNote(currentDocument.id, noteData);
            
            // Replace temp with real data
            setNotes(prev => 
                prev.map(n => n.id === tempId ? savedNote : n)
            );
        } catch (error) {
            console.error('Error saving note:', error);
            // Rollback on error
            setNotes(prev => prev.filter(n => n.id !== tempId));
            alert('Failed to save note. Please try again.');
        }
    };

    const handleDeleteHighlight = async (highlightId) => {
        if (!currentDocument?.id) return;

        // Optimistic update
        const backup = highlights.find(h => h.id === highlightId);
        setHighlights(prev => prev.filter(h => h.id !== highlightId));

        try {
            await deleteHighlight(currentDocument.id, highlightId);
        } catch (error) {
            console.error('Error deleting highlight:', error);
            // Rollback on error
            if (backup) {
                setHighlights(prev => [...prev, backup]);
            }
            alert('Failed to delete highlight. Please try again.');
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!currentDocument?.id) return;

        // Optimistic update
        const backup = notes.find(n => n.id === noteId);
        setNotes(prev => prev.filter(n => n.id !== noteId));

        try {
            await deleteNote(currentDocument.id, noteId);
        } catch (error) {
            console.error('Error deleting note:', error);
            // Rollback on error
            if (backup) {
                setNotes(prev => [backup, ...prev]);
            }
            alert('Failed to delete note. Please try again.');
        }
    };

    const handleNavigateToItem = (pageNumber) => {
        if (navigateRef.current) {
            navigateRef.current(pageNumber);
        }
    };

    if (!currentUser) {
        return <Login />;
    }

    // Choose viewer based on document type
    const renderViewer = () => {
        if (!currentDocument) {
            return <UploadArea onFileSelect={handleFileSelect} />;
        }

        if (currentDocument.type === 'pdf') {
            return (
                <PDFViewer 
                    pdf={currentDocument}
                    highlights={highlights}
                    notes={notes}
                    onAddHighlight={handleAddHighlight}
                    onAddNote={handleAddNote}
                    onDeleteHighlight={handleDeleteHighlight}
                    onDeleteNote={handleDeleteNote}
                    onNavigateToHighlight={navigateRef}
                />
            );
        }

        if (currentDocument.type === 'image') {
            return (
                <ImageViewer 
                    image={currentDocument}
                    highlights={highlights}
                    notes={notes}
                    onAddHighlight={handleAddHighlight}
                    onAddNote={handleAddNote}
                    onDeleteHighlight={handleDeleteHighlight}
                    onDeleteNote={handleDeleteNote}
                />
            );
        }

        return <UploadArea onFileSelect={handleFileSelect} />;
    };

    return (
        <div className="main-app">
            <div className="container">
                <Header />
                <div className="layout">
                    <div className="left-panel">
                        <Sidebar />
                    </div>
                    
                    <div className="main-content">
                        {renderViewer()}
                    </div>

                    <div className="right-panel">
                        <RightPanel 
                            questions={questions}
                            notes={notes}
                            highlights={highlights}
                            onDeleteNote={handleDeleteNote}
                            onDeleteHighlight={handleDeleteHighlight}
                            onNavigateToItem={handleNavigateToItem}
                        />
                    </div>
                </div>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            )}
        </div>
    );
}

export default App;