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
    const [collapsed, setCollapsed] = useState(false);

    const handleNavigate = (item) => {
        if (onNavigateToItem && item.pageNumber) {
            onNavigateToItem(item.pageNumber);
        }
    };

    const handleDelete = (type, id) => {
        if (deleteConfirm === id) {
            if (type === 'note') {
                onDeleteNote(id);
            } else if (type === 'highlight') {
                onDeleteHighlight(id);
            }
            setDeleteConfirm(null);
        } else {
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

    if (collapsed) {
        return (
            <div className="right-panel-collapsed">
                <button
                    className="collapse-shortcut"
                    onClick={() => { setCollapsed(false); setActiveTab('highlights'); }}
                    title="Highlights"
                >
                    H
                </button>
                <button
                    className="collapse-shortcut"
                    onClick={() => { setCollapsed(false); setActiveTab('notes'); }}
                    title="Notes"
                >
                    N
                </button>
                <button
                    className="collapse-shortcut"
                    onClick={() => { setCollapsed(false); setActiveTab('questions'); }}
                    title="Questions"
                >
                    Q
                </button>
            </div>
        );
    }

    return (
        <div className="right-panel-container">
            <div className="panel-header-bar">
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
                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(true)}
                    title="Collapse panel"
                >
                    &rsaquo;
                </button>
            </div>

            <div className="panel-content">
                {activeTab === 'highlights' && (
                    <div className="highlights-tab">
                        {highlights.length === 0 ? (
                            <div className="empty-state">
                                <p className="empty-title">No highlights yet</p>
                                <p className="empty-hint">Select text and choose a color to highlight</p>
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
                                                p. {highlight.pageNumber}
                                            </span>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete('highlight', highlight.id);
                                                }}
                                                title={deleteConfirm === highlight.id ? 'Click again to confirm' : 'Delete'}
                                            >
                                                {deleteConfirm === highlight.id ? '\u2713' : '\u00d7'}
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
                                <p className="empty-title">No notes yet</p>
                                <p className="empty-hint">Select text and right-click to add a note</p>
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
                                            <span className="note-page">p. {note.pageNumber}</span>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete('note', note.id);
                                                }}
                                                title={deleteConfirm === note.id ? 'Click again to confirm' : 'Delete'}
                                            >
                                                {deleteConfirm === note.id ? '\u2713' : '\u00d7'}
                                            </button>
                                        </div>
                                        {note.context && (
                                            <div className="note-context">{note.context}</div>
                                        )}
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
                                Questions feature coming soon
                            </p>
                            <p className="helper-hint">
                                Select text to generate comprehension questions
                            </p>
                        </div>

                        {questions.length === 0 ? (
                            <div className="empty-state">
                                <p className="empty-title">No questions yet</p>
                                <p className="empty-hint">Questions will appear here after generation</p>
                            </div>
                        ) : (
                            <div className="questions-list">
                                {questions.map((q, index) => (
                                    <div key={index} className="question-item">
                                        {q.type && (
                                            <span className="question-type-pill">{q.type}</span>
                                        )}
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
