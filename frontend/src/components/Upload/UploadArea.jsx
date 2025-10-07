import { useState } from 'react';
import './UploadArea.css';

export default function UploadArea({ onFileSelect }) {
    const [dragOver, setDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileSelect(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) onFileSelect(file);
    };

    return (
        <div className="upload-section">
            <div 
                className={`upload-area ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
            >
                <div className="upload-icon">📄</div>
                <div style={{ fontSize: '1.1em', marginBottom: '10px' }}>
                    Drag & drop your PDF or image here
                </div>
                <div style={{ color: 'var(--text-tertiary)', marginBottom: '20px' }}>
                    Supports: PDF, JPG, PNG
                </div>
                <button className="btn">Choose File</button>
            </div>
            <input
                type="file"
                id="fileInput"
                accept=".pdf,image/*"
                style={{ display: 'none' }}
                onChange={handleFileInput}
            />
        </div>
    );
}
