import { useState } from 'react';
import './RightPanel.css';

export default function RightPanel({ 
    questions, 
    notes, 
    highlights,
    onDeleteNote,
    onDeleteHighlight,
    onNavigateToItem 
}) {
    const [activeTab, setActiveTab] = useState('highlights');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleNavigate = (item) => {
        if (onNavigateToItem && item.pageNumber) {
            onNavigateToItem(item.pageNumber);
        }
    };

    const handleDelete = (type, id) => {
        if (deleteConfirm === id) {
            // Confirmed - perform delete
            if (type === 'note') {
                onDeleteNote(id);
            } else if (type === 'highlight') {
                onDeleteHighlight(id);
            }
            setDeleteConfirm(null);
        } else {
            // First click - show confirmation
            setDeleteConfirm(id);
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="right-panel-container">
            <div className="panel-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
                    onClick={() => setActiveTab('highlights')}
                >
                    Highlights
                    {highlights.length > 0 && <span className="tab-badge">{highlights.length}</span>}
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                >
                    Notes
                    {notes.length > 0 && <span className="tab-badge">{notes.length}</span>}
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questions')}
                >
                    Questions
                </button>
            </div>

            <div className="panel-content">
                {activeTab === 'highlights' && (
                    <div className="highlights-tab">
                        {highlights.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <img 
                                        src="https://www.clipartmax.com/png/middle/157-1574277_highlight-icon-highlight.png" 
                                        alt="Highlighter pen" 
                                        style={{ width: '80px', height: '60px' }}
                                    />

                                </div>
                                <p>No highlights yet</p>
                                <small>Select text and choose a color to highlight</small>
                            </div>
                        ) : (
                            <div className="highlights-list">
                                {highlights.map((highlight) => (
                                    <div 
                                        key={highlight.id} 
                                        className="highlight-item"
                                        onClick={() => handleNavigate(highlight)}
                                    >
                                        <div className="highlight-header">
                                            <div 
                                                className="highlight-color"
                                                style={{ background: highlight.color }}
                                            />
                                            <span className="highlight-page">
                                                Page {highlight.pageNumber}
                                            </span>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete('highlight', highlight.id);
                                                }}
                                                title={deleteConfirm === highlight.id ? 'Click again to confirm' : 'Delete'}
                                            >
                                                {deleteConfirm === highlight.id ? '✓' : '×'}
                                            </button>
                                        </div>
                                        <div className="highlight-text">{highlight.text}</div>
                                        {highlight.timestamp && (
                                            <div className="item-timestamp">
                                                {formatTimestamp(highlight.timestamp)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="notes-tab">
                        {notes.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <img 
                                        src="https://cdn-icons-png.freepik.com/512/7235/7235470.png" 
                                        alt="Page with bullet points and a pencil" 
                                        style={{ width: '60px', height: '60px' }}
                                    />
                                </div>
                                <p>No notes yet</p>
                                <small>Select text and right-click to add a note</small>
                            </div>
                        ) : (
                            <div className="notes-list">
                                {notes.map((note) => (
                                    <div 
                                        key={note.id} 
                                        className="note-item"
                                        onClick={() => handleNavigate(note)}
                                    >
                                        <div className="note-header">
                                            <span className="note-page">Page {note.pageNumber}</span>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete('note', note.id);
                                                }}
                                                title={deleteConfirm === note.id ? 'Click again to confirm' : 'Delete'}
                                            >
                                                {deleteConfirm === note.id ? '✓' : '×'}
                                            </button>
                                        </div>
                                        <div className="note-context">"{note.context}"</div>
                                        <div className="note-text">{note.text}</div>
                                        {note.timestamp && (
                                            <div className="item-timestamp">
                                                {formatTimestamp(note.timestamp)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="questions-tab">
                        <div className="generate-section">
                            <p className="helper-text">
                                Questions feature coming soon!
                            </p>
                            <small style={{ color: 'var(--text-tertiary)' }}>
                                Select text to generate comprehension questions
                            </small>
                        </div>
                        
                        {questions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">❓</div>
                                <p>No questions yet</p>
                                <small>Questions will appear here after generation</small>
                            </div>
                        ) : (
                            <div className="questions-list">
                                {questions.map((q, index) => (
                                    <div key={index} className="question-item">
                                        <div className="question-text">{q.question}</div>
                                        <textarea 
                                            placeholder="Write your answer..."
                                            rows="3"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}