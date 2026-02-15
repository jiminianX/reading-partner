import { useState } from 'react';
import './CheckInModal.css';

const TYPE_LABELS = {
    summarize: 'Summary',
    predict: 'Prediction',
    connect: 'Connection',
    vocabulary: 'Vocabulary',
};

export default function CheckInModal({ prompt, checkInType, pageNumber, onSubmit, onSkip }) {
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
            <div className="scaffold-modal check-in-modal">
                <div className="check-in-header">
                    <span className="check-in-type-pill">
                        {TYPE_LABELS[checkInType] || checkInType}
                    </span>
                    {pageNumber && (
                        <span className="check-in-page">Page {pageNumber}</span>
                    )}
                </div>

                <span className="scaffold-label">Reading Check-In</span>
                <p className="check-in-prompt">{prompt}</p>

                <div className="scaffold-field">
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Take a moment to reflect..."
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
                        {loading ? 'Saving...' : 'Continue Reading'}
                    </button>
                    <button
                        className="scaffold-skip"
                        onClick={onSkip}
                    >
                        Skip this check-in
                    </button>
                </div>
            </div>
        </div>
    );
}
