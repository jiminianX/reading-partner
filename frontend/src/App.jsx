import { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import PDFViewer from './components/PDFViewer/PDFViewer';
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
    const [currentPDF, setCurrentPDF] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [notes, setNotes] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const navigateRef = useRef(null);

    // Load highlights and notes when PDF changes
    useEffect(() => {
        if (currentPDF?.id) {
            loadPDFData();
        }
    }, [currentPDF?.id]);

    const loadPDFData = async () => {
        if (!currentPDF?.id) return;
        
        setLoading(true);
        try {
            const [highlightsData, notesData] = await Promise.all([
                getHighlights(currentPDF.id),
                getNotes(currentPDF.id)
            ]);
            
            setHighlights(highlightsData);
            setNotes(notesData);
        } catch (error) {
            console.error('Error loading PDF data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (file) => {
        console.log('📁 File selected:', file.name, file.type, file.size);
        if (file.type === 'application/pdf') {
            const fileURL = URL.createObjectURL(file);
            console.log('🔗 Created blob URL:', fileURL);
            const pdfData = {
                fileName: file.name,
                fileURL: fileURL,
                id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            console.log('📦 Setting PDF data:', pdfData);

            setCurrentPDF(pdfData);
            setHighlights([]);
            setNotes([]);
            setQuestions([]);
        } else {
            alert('Please upload a PDF file');
        }
    };

    // Optimistic update for highlights
    const handleAddHighlight = async (highlightData) => {
        if (!currentPDF?.id) return;

        // Optimistic update
        const tempId = `temp_${Date.now()}`;
        const optimisticHighlight = { ...highlightData, id: tempId };
        setHighlights(prev => [...prev, optimisticHighlight]);

        try {
            // Save to Firebase
            const savedHighlight = await saveHighlight(currentPDF.id, highlightData);
            
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
        if (!currentPDF?.id) return;

        // Optimistic update
        const tempId = `temp_${Date.now()}`;
        const optimisticNote = { ...noteData, id: tempId };
        setNotes(prev => [optimisticNote, ...prev]);

        try {
            // Save to Firebase
            const savedNote = await saveNote(currentPDF.id, noteData);
            
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
        if (!currentPDF?.id) return;

        // Optimistic update
        const backup = highlights.find(h => h.id === highlightId);
        setHighlights(prev => prev.filter(h => h.id !== highlightId));

        try {
            await deleteHighlight(currentPDF.id, highlightId);
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
        if (!currentPDF?.id) return;

        // Optimistic update
        const backup = notes.find(n => n.id === noteId);
        setNotes(prev => prev.filter(n => n.id !== noteId));

        try {
            await deleteNote(currentPDF.id, noteId);
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

    return (
        <div className="main-app">
            <div className="container">
                <Header />
                <div className="layout">
                    <div className="left-panel">
                        <Sidebar />
                    </div>
                    
                    <div className="main-content">
                        {currentPDF ? (
                            <PDFViewer 
                                pdf={currentPDF}
                                highlights={highlights}
                                notes={notes}
                                onAddHighlight={handleAddHighlight}
                                onAddNote={handleAddNote}
                                onDeleteHighlight={handleDeleteHighlight}
                                onDeleteNote={handleDeleteNote}
                                onNavigateToHighlight={navigateRef}
                            />
                        ) : (
                            <UploadArea onFileSelect={handleFileSelect} />
                        )}
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