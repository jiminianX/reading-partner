import { useState } from 'react';
import './PDFViewer.css'; // Reuse same styles

export default function ImageViewer({
    image,
    onAddHighlight,
    onAddNote,
}) {
    const [scale, setScale] = useState(1.0);
    const [selectedText, setSelectedText] = useState(null);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [noteText, setNoteText] = useState('');

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            setSelectedText({
                text,
                range,
                pageNumber: 1, // Images are single page
                position: {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height
                }
            });
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text) {
            setShowContextMenu(true);
            setContextMenuPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleAddHighlight = (color) => {
        if (!selectedText) return;

        const highlightData = {
            text: selectedText.text,
            color,
            pageNumber: 1,
            position: selectedText.position,
            timestamp: Date.now()
        };

        onAddHighlight(highlightData);
        clearSelection();
    };

    const handleOpenNoteInput = () => {
        setShowContextMenu(false);
        setShowNoteInput(true);
    };

    const handleSaveNote = () => {
        if (!selectedText || !noteText.trim()) return;

        const noteData = {
            text: noteText.trim(),
            context: selectedText.text,
            pageNumber: 1,
            position: selectedText.position,
            timestamp: Date.now()
        };

        onAddNote(noteData);
        setNoteText('');
        setShowNoteInput(false);
        clearSelection();
    };

    const clearSelection = () => {
        window.getSelection().removeAllRanges();
        setSelectedText(null);
        setShowContextMenu(false);
    };

    return (
        <div className="pdf-viewer-container">
            <div className="pdf-toolbar">
                <div className="pdf-title">{image.fileName}</div>
                <div className="pdf-controls">
                    <button 
                        className="toolbar-btn"
                        onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                        title="Zoom Out"
                    >
                        −
                    </button>
                    <span className="zoom-level">{Math.round(scale * 100)}%</span>
                    <button 
                        className="toolbar-btn"
                        onClick={() => setScale(Math.min(3.0, scale + 0.1))}
                        title="Zoom In"
                    >
                        +
                    </button>
                    {image.confidence && (
                        <span className="page-info" title="OCR Confidence">
                            📊 {Math.round(image.confidence)}% accurate
                        </span>
                    )}
                </div>
            </div>

            <div 
                className="pdf-content"
                onMouseUp={handleTextSelection}
                onContextMenu={handleContextMenu}
                style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '30px',
                    padding: '30px'
                }}
            >
                {/* Image Display */}
                <div style={{ 
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    maxWidth: '100%'
                }}>
                    <img 
                        src={image.fileURL}
                        alt={image.fileName}
                        style={{
                            transform: `scale(${scale})`,
                            transformOrigin: 'top center',
                            display: 'block',
                            maxWidth: '100%',
                            height: 'auto'
                        }}
                    />
                </div>

                {/* Extracted Text */}
                <div style={{
                    background: 'var(--bg-primary)',
                    padding: '30px',
                    borderRadius: '12px',
                    maxWidth: '800px',
                    width: '100%',
                    boxShadow: '0 2px 10px var(--shadow)'
                }}>
                    <h3 style={{ 
                        color: 'var(--primary)',
                        marginBottom: '20px',
                        fontSize: '1.2em'
                    }}>
                        Extracted Text
                    </h3>
                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '20px',
                        borderRadius: '8px',
                        lineHeight: '1.8',
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        userSelect: 'text',
                        fontSize: '1em'
                    }}>
                        {image.text || 'No text extracted'}
                    </div>
                </div>

                {/* Context Menu */}
                {showContextMenu && (
                    <>
                        <div 
                            className="context-menu-backdrop"
                            onClick={() => setShowContextMenu(false)}
                        />
                        <div
                            className="context-menu"
                            style={{
                                left: `${contextMenuPos.x}px`,
                                top: `${contextMenuPos.y}px`
                            }}
                        >
                            <button onClick={() => handleAddHighlight('yellow')}>
                                <span className="color-icon" style={{ background: 'yellow' }}></span>
                                Yellow Highlight
                            </button>
                            <button onClick={() => handleAddHighlight('lightgreen')}>
                                <span className="color-icon" style={{ background: 'lightgreen' }}></span>
                                Green Highlight
                            </button>
                            <button onClick={() => handleAddHighlight('lightpink')}>
                                <span className="color-icon" style={{ background: 'lightpink' }}></span>
                                Pink Highlight
                            </button>
                            <button onClick={() => handleAddHighlight('lightblue')}>
                                <span className="color-icon" style={{ background: 'lightblue' }}></span>
                                Blue Highlight
                            </button>
                            <div className="menu-divider"></div>
                            <button onClick={handleOpenNoteInput}>
                                📝 Add Note
                            </button>
                        </div>
                    </>
                )}

                {/* Note Input Modal */}
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
                                <button className="btn btn-primary" onClick={handleSaveNote}>
                                    Save Note
                                </button>
                                <button 
                                    className="btn btn-ghost" 
                                    onClick={() => {
                                        setShowNoteInput(false);
                                        setNoteText('');
                                        clearSelection();
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