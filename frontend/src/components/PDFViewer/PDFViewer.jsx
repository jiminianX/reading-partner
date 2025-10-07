import { useState, useRef } from 'react';
import './PDFViewer.css';

export default function PDFViewer({ pdf, highlights, onAddHighlight, onAddNote }) {
    const [scale, setScale] = useState(1.0);
    const [selectedText, setSelectedText] = useState(null);
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [noteText, setNoteText] = useState('');
    const viewerRef = useRef(null);

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString();
        
        if (text.trim()) {
            setSelectedText({
                text: text,
                position: selection.getRangeAt(0).getBoundingClientRect()
            });
        }
    };

    const handleHighlight = (color) => {
        if (selectedText) {
            onAddHighlight({
                text: selectedText.text,
                color: color,
                position: selectedText.position
            });
            setSelectedText(null);
            window.getSelection().removeAllRanges();
        }
    };

    const handleAddNote = () => {
        if (selectedText && noteText.trim()) {
            onAddNote({
                text: noteText,
                context: selectedText.text,
                position: selectedText.position
            });
            setNoteText('');
            setShowNoteInput(false);
            setSelectedText(null);
            window.getSelection().removeAllRanges();
        }
    };

    return (
        <div className="pdf-viewer-container">
            <div className="pdf-toolbar">
                <div className="pdf-title">{pdf.fileName}</div>
                <div className="pdf-controls">
                    <button 
                        className="toolbar-btn"
                        onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                    >
                        −
                    </button>
                    <span className="zoom-level">{Math.round(scale * 100)}%</span>
                    <button 
                        className="toolbar-btn"
                        onClick={() => setScale(Math.min(2.0, scale + 0.1))}
                    >
                        +
                    </button>
                </div>
            </div>

            <div 
                className="pdf-content" 
                ref={viewerRef}
                onMouseUp={handleTextSelection}
            >
                <iframe
                    src={pdf.fileURL}
                    width="100%"
                    height="100%"
                    style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
                    title={pdf.fileName}
                />

                {selectedText && (
                    <div className="text-selection-toolbar">
                        <button 
                            className="highlight-btn yellow"
                            onClick={() => handleHighlight('yellow')}
                            title="Yellow highlight"
                        >
                            🟨
                        </button>
                        <button 
                            className="highlight-btn green"
                            onClick={() => handleHighlight('green')}
                            title="Green highlight"
                        >
                            🟩
                        </button>
                        <button 
                            className="highlight-btn pink"
                            onClick={() => handleHighlight('pink')}
                            title="Pink highlight"
                        >
                            🟪
                        </button>
                        <button 
                            className="note-btn"
                            onClick={() => setShowNoteInput(true)}
                            title="Add note"
                        >
                            📝
                        </button>
                    </div>
                )}

                {showNoteInput && (
                    <div className="note-input-modal">
                        <div className="note-input-content">
                            <h4>Add Note</h4>
                            <p className="note-context">"{selectedText?.text}"</p>
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Write your note here..."
                                autoFocus
                            />
                            <div className="note-actions">
                                <button className="btn btn-primary" onClick={handleAddNote}>
                                    Save Note
                                </button>
                                <button 
                                    className="btn btn-ghost" 
                                    onClick={() => {
                                        setShowNoteInput(false);
                                        setNoteText('');
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}