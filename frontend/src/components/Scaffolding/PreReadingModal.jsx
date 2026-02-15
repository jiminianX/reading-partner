import { useState } from 'react';
import './PreReadingModal.css';

export default function PreReadingModal({ onSubmit, onSkip }) {
    const [priorKnowledge, setPriorKnowledge] = useState('');
    const [learningGoals, setLearningGoals] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        await onSubmit(priorKnowledge, learningGoals);
        setLoading(false);
    };

    return (
        <div className="scaffold-overlay">
            <div className="scaffold-modal pre-reading-modal">
                <div className="scaffold-accent" />
                <span className="scaffold-label">Before You Begin</span>
                <h2 className="scaffold-title">Prepare your mind</h2>
                <p className="scaffold-subtitle">
                    Taking a moment to reflect before reading helps you engage more deeply with the material.
                </p>

                <div className="scaffold-field">
                    <label className="scaffold-field-label">
                        What do you already know about this topic?
                    </label>
                    <textarea
                        value={priorKnowledge}
                        onChange={(e) => setPriorKnowledge(e.target.value)}
                        placeholder="Share any background knowledge, related experiences, or things you've heard about this topic..."
                        rows={4}
                    />
                </div>

                <div className="scaffold-field">
                    <label className="scaffold-field-label">
                        What would you like to learn?
                    </label>
                    <textarea
                        value={learningGoals}
                        onChange={(e) => setLearningGoals(e.target.value)}
                        placeholder="What questions do you hope to answer? What are you curious about?"
                        rows={4}
                    />
                </div>

                <div className="scaffold-actions">
                    <button
                        className="btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Begin Reading'}
                    </button>
                    <button
                        className="scaffold-skip"
                        onClick={onSkip}
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    );
}
