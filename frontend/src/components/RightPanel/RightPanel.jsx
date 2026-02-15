import { useState, useEffect } from 'react';
import { useReading } from '../../contexts/ReadingContext';
import { getLinksForReading } from '../../services/storage';
import { saveResponse } from '../../services/api';
import './RightPanel.css';

function renderNoteWithLinks(text, onLinkClick, allReadings) {
    if (!text) return null;
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
        const match = part.match(/^\[\[(.*?)\]\]$/);
        if (match) {
            const name = match[1];
            const reading = allReadings.find(r =>
                (r.fileName || r.name || '') === name
            );
            return (
                <span
                    key={i}
                    className="note-link"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (reading) onLinkClick?.(reading);
                    }}
                >
                    {name}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

export default function RightPanel({
    questions,
    notes,
    highlights,
    onDeleteNote,
    onDeleteHighlight,
    onNavigateToItem,
    onSelectReading,
    onGenerateQuestions,
    questionsLoading,
    currentPdfId
}) {
    const { allReadings } = useReading();
    const [activeTab, setActiveTab] = useState('highlights');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [backlinks, setBacklinks] = useState([]);
    const [answers, setAnswers] = useState({});
    const [savedAnswers, setSavedAnswers] = useState({});

    useEffect(() => {
        if (!currentPdfId) {
            setBacklinks([]);
            return;
        }
        getLinksForReading(currentPdfId).then(setBacklinks).catch(() => setBacklinks([]));
    }, [currentPdfId, notes]);

    // Reset answers when questions change
    useEffect(() => {
        setAnswers({});
        setSavedAnswers({});
    }, [questions]);

    const handleSaveAnswer = async (index) => {
        const answer = answers[index]?.trim();
        if (!answer || !currentPdfId) return;
        try {
            await saveResponse(currentPdfId, index, answer);
            setSavedAnswers(prev => ({ ...prev, [index]: true }));
        } catch (error) {
            console.error('Error saving response:', error);
        }
    };

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
                    aria-label="Show highlights panel"
                >
                    H
                </button>
                <button
                    className="collapse-shortcut"
                    onClick={() => { setCollapsed(false); setActiveTab('notes'); }}
                    title="Notes"
                    aria-label="Show notes panel"
                >
                    N
                </button>
                <button
                    className="collapse-shortcut"
                    onClick={() => { setCollapsed(false); setActiveTab('questions'); }}
                    title="Questions"
                    aria-label="Show questions panel"
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
                        {questions.length > 0 && <span className="tab-badge">{questions.length}</span>}
                    </button>
                </div>
                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(true)}
                    title="Collapse panel"
                    aria-label="Collapse panel"
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
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNavigate(highlight); } }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Highlight on page ${highlight.pageNumber}: ${highlight.text?.slice(0, 50)}`}
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
                                                aria-label={deleteConfirm === highlight.id ? 'Click again to confirm delete' : 'Delete highlight'}
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
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNavigate(note); } }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Note on page ${note.pageNumber}`}
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
                                                aria-label={deleteConfirm === note.id ? 'Click again to confirm delete' : 'Delete note'}
                                            >
                                                {deleteConfirm === note.id ? '\u2713' : '\u00d7'}
                                            </button>
                                        </div>
                                        {note.context && (
                                            <div className="note-context">{note.context}</div>
                                        )}
                                        <div className="note-text">
                                            {renderNoteWithLinks(note.text, onSelectReading, allReadings)}
                                        </div>
                                        {note.timestamp && (
                                            <div className="item-timestamp">
                                                {formatTimestamp(note.timestamp)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {backlinks.length > 0 && (
                            <div className="backlinks-section">
                                <div className="backlinks-header">
                                    <span className="backlinks-label">Linked Mentions</span>
                                    <span className="backlinks-count">{backlinks.length}</span>
                                </div>
                                {backlinks.map(link => {
                                    const linkedId = link.direction === 'incoming' ? link.sourceReadingId : link.targetReadingId;
                                    const linkedReading = allReadings.find(r => r.id === linkedId);
                                    return (
                                        <div
                                            key={link.id}
                                            className="backlink-item"
                                            onClick={() => linkedReading && onSelectReading?.(linkedReading)}
                                        >
                                            <span className="backlink-direction">
                                                {link.direction === 'incoming' ? '←' : '→'}
                                            </span>
                                            <span className="backlink-name">
                                                {linkedReading?.fileName || linkedReading?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="questions-tab">
                        <div className="generate-section">
                            {onGenerateQuestions ? (
                                <>
                                    <p className="helper-text">
                                        Generate comprehension questions from the current reading
                                    </p>
                                    <button
                                        className="generate-btn"
                                        onClick={onGenerateQuestions}
                                        disabled={questionsLoading}
                                    >
                                        {questionsLoading ? (
                                            <>
                                                <span className="btn-spinner" />
                                                Generating...
                                            </>
                                        ) : (
                                            questions.length > 0 ? 'Regenerate Questions' : 'Generate Questions'
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="helper-text">
                                        Open a reading to generate questions
                                    </p>
                                    <p className="helper-hint">
                                        AI-powered comprehension questions based on the text
                                    </p>
                                </>
                            )}
                        </div>

                        {questions.length === 0 ? (
                            !questionsLoading && (
                                <div className="empty-state">
                                    <p className="empty-title">No questions yet</p>
                                    <p className="empty-hint">Questions will appear here after generation</p>
                                </div>
                            )
                        ) : (
                            <div className="questions-list">
                                {questions.map((q, index) => (
                                    <div key={index} className="question-item">
                                        {q.type && (
                                            <span className="question-type-pill">{q.type}</span>
                                        )}
                                        {q.title && (
                                            <div className="question-title">{q.title}</div>
                                        )}
                                        <div className="question-text">{q.question}</div>
                                        <textarea
                                            placeholder="Write your answer..."
                                            rows="3"
                                            value={answers[index] || ''}
                                            onChange={(e) => {
                                                setAnswers(prev => ({ ...prev, [index]: e.target.value }));
                                                setSavedAnswers(prev => ({ ...prev, [index]: false }));
                                            }}
                                        />
                                        <div className="answer-actions">
                                            {savedAnswers[index] ? (
                                                <span className="answer-saved">Saved</span>
                                            ) : (
                                                <button
                                                    className="save-answer-btn"
                                                    onClick={() => handleSaveAnswer(index)}
                                                    disabled={!answers[index]?.trim()}
                                                >
                                                    Save
                                                </button>
                                            )}
                                        </div>
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
