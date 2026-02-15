import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import LandingPage from './components/Landing/LandingPage';
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import PDFViewer from './components/PDFViewer/PDFViewer';
import UploadArea from './components/Upload/UploadArea';
import RightPanel from './components/RightPanel/RightPanel';
import GraphView from './components/Graph/GraphView';
import PreReadingModal from './components/Scaffolding/PreReadingModal';
import CheckInModal from './components/Scaffolding/CheckInModal';
import ReflectionModal from './components/Scaffolding/ReflectionModal';
import { useReading } from './contexts/ReadingContext';
import {
    saveHighlight,
    getHighlights,
    deleteHighlight,
    saveNote,
    getNotes,
    deleteNote,
    saveReading,
    deleteReading
} from './services/storage';
import {
    savePreReading,
    getPreReading,
    generateCheckIn,
    saveCheckIn as apiSaveCheckIn,
    saveReflection as apiSaveReflection,
} from './services/api';
import './App.css';

const CHECK_IN_INTERVAL = 5; // pages between check-ins

function MainApp() {
    const { loadAllReadings } = useReading();
    const [currentPDF, setCurrentPDF] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [notes, setNotes] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Scaffolding state
    const [showPreReading, setShowPreReading] = useState(false);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showReflection, setShowReflection] = useState(false);
    const [scaffoldingData, setScaffoldingData] = useState(null);
    const [checkInData, setCheckInData] = useState(null);
    const lastCheckInPage = useRef(0);
    const currentPageRef = useRef(1);
    const pdfTextRef = useRef('');

    const navigateRef = useRef(null);

    useEffect(() => {
        if (currentPDF?.id) {
            loadPDFData();
            checkPreReading();
        }
    }, [currentPDF?.id]);

    const checkPreReading = async () => {
        if (!currentPDF?.id) return;
        try {
            const result = await getPreReading(currentPDF.id);
            if (result.preReading) {
                setScaffoldingData(result.preReading);
            } else {
                setShowPreReading(true);
            }
        } catch (error) {
            // If backend is unavailable, skip scaffolding silently
            console.error('Scaffolding unavailable:', error);
        }
    };

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

    const handleFileSelect = async (fileData) => {
        setHighlights([]);
        setNotes([]);
        setQuestions([]);
        setScaffoldingData(null);
        lastCheckInPage.current = 0;
        pdfTextRef.current = fileData.text || '';

        try {
            const saved = await saveReading({
                fileName: fileData.fileName,
                type: fileData.type,
            });
            setCurrentPDF({ ...fileData, id: saved.id });
            loadAllReadings();
        } catch (error) {
            console.error('Error saving reading:', error);
            setCurrentPDF(fileData);
        }
    };

    const handleClosePDF = () => {
        setCurrentPDF(null);
        setHighlights([]);
        setNotes([]);
        setQuestions([]);
        setScaffoldingData(null);
    };

    const handleDeleteReading = async () => {
        if (!currentPDF?.id) return;
        try {
            await deleteReading(currentPDF.id);
        } catch (error) {
            console.error('Error deleting reading:', error);
        }
        handleClosePDF();
        loadAllReadings();
    };

    const handlePreReadingSubmit = async (priorKnowledge, learningGoals) => {
        if (!currentPDF?.id) return;
        try {
            await savePreReading(currentPDF.id, priorKnowledge, learningGoals);
            setScaffoldingData({ priorKnowledge, learningGoals });
        } catch (error) {
            console.error('Error saving pre-reading:', error);
        }
        setShowPreReading(false);
    };

    const handlePreReadingSkip = () => {
        setShowPreReading(false);
    };

    const handlePageChange = useCallback(async (page) => {
        currentPageRef.current = page;

        // Trigger check-in every CHECK_IN_INTERVAL pages
        if (
            currentPDF?.id &&
            scaffoldingData &&
            page - lastCheckInPage.current >= CHECK_IN_INTERVAL &&
            !showCheckIn
        ) {
            lastCheckInPage.current = page;
            try {
                const text = pdfTextRef.current || '';
                const result = await generateCheckIn(
                    text,
                    scaffoldingData.priorKnowledge || '',
                    scaffoldingData.learningGoals || '',
                    page
                );
                setCheckInData({
                    prompt: result.prompt,
                    checkInType: result.checkInType,
                    pageNumber: page,
                });
                setShowCheckIn(true);
            } catch (error) {
                console.error('Error generating check-in:', error);
            }
        }
    }, [currentPDF?.id, scaffoldingData, showCheckIn]);

    const handleCheckInSubmit = async (response) => {
        if (!currentPDF?.id || !checkInData) return;
        try {
            await apiSaveCheckIn(
                currentPDF.id,
                checkInData.prompt,
                response,
                checkInData.checkInType,
                checkInData.pageNumber
            );
        } catch (error) {
            console.error('Error saving check-in:', error);
        }
        setShowCheckIn(false);
        setCheckInData(null);
    };

    const handleCheckInSkip = () => {
        setShowCheckIn(false);
        setCheckInData(null);
    };

    const handleReflectionSubmit = async (response) => {
        if (!currentPDF?.id) return;
        try {
            await apiSaveReflection(currentPDF.id, response);
        } catch (error) {
            console.error('Error saving reflection:', error);
        }
        setShowReflection(false);
    };

    const handleReflectionSkip = () => {
        setShowReflection(false);
    };

    const handleAddHighlight = async (highlightData) => {
        if (!currentPDF?.id) return;

        const tempId = `temp_${Date.now()}`;
        const optimisticHighlight = { ...highlightData, id: tempId };
        setHighlights(prev => [...prev, optimisticHighlight]);

        try {
            const savedHighlight = await saveHighlight(currentPDF.id, highlightData);
            setHighlights(prev =>
                prev.map(h => h.id === tempId ? savedHighlight : h)
            );
        } catch (error) {
            console.error('Error saving highlight:', error);
            setHighlights(prev => prev.filter(h => h.id !== tempId));
            alert('Failed to save highlight. Please try again.');
        }
    };

    const handleAddNote = async (noteData) => {
        if (!currentPDF?.id) return;

        const tempId = `temp_${Date.now()}`;
        const optimisticNote = { ...noteData, id: tempId };
        setNotes(prev => [optimisticNote, ...prev]);

        try {
            const savedNote = await saveNote(currentPDF.id, noteData);
            setNotes(prev =>
                prev.map(n => n.id === tempId ? savedNote : n)
            );
        } catch (error) {
            console.error('Error saving note:', error);
            setNotes(prev => prev.filter(n => n.id !== tempId));
            alert('Failed to save note. Please try again.');
        }
    };

    const handleDeleteHighlight = async (highlightId) => {
        if (!currentPDF?.id) return;

        const backup = highlights.find(h => h.id === highlightId);
        setHighlights(prev => prev.filter(h => h.id !== highlightId));

        try {
            await deleteHighlight(currentPDF.id, highlightId);
        } catch (error) {
            console.error('Error deleting highlight:', error);
            if (backup) {
                setHighlights(prev => [...prev, backup]);
            }
            alert('Failed to delete highlight. Please try again.');
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!currentPDF?.id) return;

        const backup = notes.find(n => n.id === noteId);
        setNotes(prev => prev.filter(n => n.id !== noteId));

        try {
            await deleteNote(currentPDF.id, noteId);
        } catch (error) {
            console.error('Error deleting note:', error);
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

    return (
        <div className="main-app">
            <div className="container">
                <Header
                    onReflect={currentPDF && scaffoldingData ? () => setShowReflection(true) : null}
                />
                <div className="layout">
                    <div className="left-panel">
                        <Sidebar onSelectReading={handleFileSelect} />
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
                                onPageChange={handlePageChange}
                                onClosePDF={handleClosePDF}
                                onDeleteReading={handleDeleteReading}
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
                            onSelectReading={handleFileSelect}
                            currentPdfId={currentPDF?.id}
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

            {showPreReading && (
                <PreReadingModal
                    onSubmit={handlePreReadingSubmit}
                    onSkip={handlePreReadingSkip}
                />
            )}

            {showCheckIn && checkInData && (
                <CheckInModal
                    prompt={checkInData.prompt}
                    checkInType={checkInData.checkInType}
                    pageNumber={checkInData.pageNumber}
                    onSubmit={handleCheckInSubmit}
                    onSkip={handleCheckInSkip}
                />
            )}

            {showReflection && (
                <ReflectionModal
                    learningGoals={scaffoldingData?.learningGoals || ''}
                    onSubmit={handleReflectionSubmit}
                    onSkip={handleReflectionSkip}
                />
            )}
        </div>
    );
}

function ProtectedRoute({ children }) {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { currentUser } = useAuth();
    return currentUser ? <Navigate to="/app" replace /> : children;
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/app" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
            <Route path="/app/graph" element={<ProtectedRoute><GraphView /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
