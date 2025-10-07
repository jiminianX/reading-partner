import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import PDFViewer from './components/PDFViewer/PDFViewer';
import UploadArea from './components/Upload/UploadArea';
import RightPanel from './components/RightPanel/RightPanel';
import './App.css';

function App() {
    const { currentUser } = useAuth();
    const [currentPDF, setCurrentPDF] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [notes, setNotes] = useState([]);
    const [questions, setQuestions] = useState([]);

    const handleFileSelect = async (file) => {
        if (file.type === 'application/pdf') {
            const fileURL = URL.createObjectURL(file);
            setCurrentPDF({
                fileName: file.name,
                fileURL: fileURL,
                id: Date.now().toString()
            });
        } else {
            alert('Please upload a PDF file');
        }
    };

    const handleAddHighlight = (highlight) => {
        setHighlights([...highlights, { ...highlight, id: Date.now() }]);
    };

    const handleAddNote = (note) => {
        setNotes([...notes, { ...note, id: Date.now() }]);
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
                                onAddHighlight={handleAddHighlight}
                                onAddNote={handleAddNote}
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
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;