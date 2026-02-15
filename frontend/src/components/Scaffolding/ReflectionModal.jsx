import { useState } from 'react';
import './ReflectionModal.css';

export default function ReflectionModal({ learningGoals, onSubmit, onSkip }) {
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!response.trim()) return;
        setLoading(true);
        await onSubmit(response);
        setLoading(false);
    };

    return (
        <div className="scaffold-overlay">
            <div className="scaffold-modal reflection-modal">
                <div className="scaffold-accent" />
                <span className="scaffold-label">Post-Reading Reflection</span>
                <h2 className="scaffold-title">What did you learn?</h2>
                <p className="scaffold-subtitle">
                    Reflecting on your reading helps solidify understanding and identify gaps.
                </p>

                {learningGoals && (
                    <div className="reflection-goals">
                        <span className="reflection-goals-label">Your learning goals were:</span>
                        <p className="reflection-goals-text">{learningGoals}</p>
                    </div>
                )}

                <div className="scaffold-field">
                    <label className="scaffold-field-label">
                        What are your key takeaways?
                    </label>
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="What surprised you? What confirmed what you already knew? What questions do you still have?"
                        rows={5}
                        autoFocus
                    />
                </div>

                <div className="scaffold-actions">
                    <button
                        className="btn"
                        onClick={handleSubmit}
                        disabled={loading || !response.trim()}
                    >
                        {loading ? 'Saving...' : 'Finish'}
                    </button>
                    <button
                        className="scaffold-skip"
                        onClick={onSkip}
                    >
                        Skip reflection
                    </button>
                </div>
            </div>
        </div>
    );
}
