import { useState } from 'react';
import './ReadingView.css';

export default function ReadingView({ reading, onNewReading, onGenerateQuestions }) {
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const handleGenerateQuestions = async () => {
        setLoadingQuestions(true);
        await onGenerateQuestions();
        setLoadingQuestions(false);
    };

    return (
        <div className="reading-view">
            <div className="reading-header">
                <h2 className="reading-title">{reading.fileName}</h2>
                <button className="btn btn-secondary btn-small" onClick={onNewReading}>
                    New Reading
                </button>
            </div>

            <div className="progress-bar">
                <div className="progress-fill" style={{ width: '25%' }}></div>
            </div>

            <div className="text-display">
                {reading.text}
            </div>

            <div className="text-center mt-2">
                <button 
                    className="btn" 
                    onClick={handleGenerateQuestions}
                    disabled={loadingQuestions}
                >
                    {loadingQuestions ? 'Generating Questions...' : 'Generate Questions'}
                </button>
            </div>
        </div>
    );
}
