import { useState } from 'react';
import { saveResponse } from '../../services/api';
import './QuestionsList.css';

export default function QuestionsList({ questions, readingId }) {
    const [responses, setResponses] = useState({});
    const [saved, setSaved] = useState({});

    const handleResponseChange = (index, value) => {
        setResponses(prev => ({ ...prev, [index]: value }));
    };

    const handleSave = async (index) => {
        if (!responses[index]?.trim()) {
            alert('Please write a response first');
            return;
        }

        try {
            await saveResponse(readingId, index, responses[index]);
            setSaved(prev => ({ ...prev, [index]: true }));
            setTimeout(() => {
                setSaved(prev => ({ ...prev, [index]: false }));
            }, 3000);
        } catch (error) {
            console.error('Error saving response:', error);
            alert('Error saving response');
        }
    };

    return (
        <div className="questions-section">
            {questions.map((q, index) => (
                <div key={index} className="question-card">
                    <span className="activity-badge">{q.type}</span>
                    <div className="question-title">{q.title}</div>
                    <div className="question-text">{q.question}</div>
                    <textarea
                        value={responses[index] || ''}
                        onChange={(e) => handleResponseChange(index, e.target.value)}
                        placeholder="Type your response here..."
                    />
                    <button className="btn mt-1" onClick={() => handleSave(index)}>
                        Save Response
                    </button>
                    {saved[index] && (
                        <div className="response-saved">✓ Response saved!</div>
                    )}
                </div>
            ))}
        </div>
    );
}
