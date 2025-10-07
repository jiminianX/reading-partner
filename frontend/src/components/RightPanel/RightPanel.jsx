import { useState } from 'react';
import './RightPanel.css';

export default function RightPanel({ questions, notes, highlights }) {
    const [activeTab, setActiveTab] = useState('questions');

    return (
        <div className="right-panel-container">
            <div className="panel-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questions')}
                >
                    Questions
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                >
                    Notes ({notes.length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
                    onClick={() => setActiveTab('highlights')}
                >
                    Highlights ({highlights.length})
                </button>
            </div>

            <div className="panel-content">
                {activeTab === 'questions' && (
                    <div className="questions-tab">
                        <div className="generate-section">
                            <p className="helper-text">
                                Select text in the PDF to generate questions
                            </p>
                            <button className="btn">
                                Generate Questions from Selection
                            </button>
                        </div>
                        
                        {questions.length === 0 ? (
                            <div className="empty-state">
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

                {activeTab === 'notes' && (
                    <div className="notes-tab">
                        {notes.length === 0 ? (
                            <div className="empty-state">
                                <p>No notes yet</p>
                                <small>Select text and click 📝 to add a note</small>
                            </div>
                        ) : (
                            <div className="notes-list">
                                {notes.map((note) => (
                                    <div key={note.id} className="note-item">
                                        <div className="note-context">"{note.context}"</div>
                                        <div className="note-text">{note.text}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'highlights' && (
                    <div className="highlights-tab">
                        {highlights.length === 0 ? (
                            <div className="empty-state">
                                <p>No highlights yet</p>
                                <small>Select text and choose a color to highlight</small>
                            </div>
                        ) : (
                            <div className="highlights-list">
                                {highlights.map((highlight) => (
                                    <div key={highlight.id} className="highlight-item">
                                        <div 
                                            className="highlight-color"
                                            style={{ background: highlight.color }}
                                        />
                                        <div className="highlight-text">{highlight.text}</div>
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