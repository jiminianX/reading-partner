import { useState } from 'react';
import Tesseract from 'tesseract.js';
import './UploadArea.css';

export default function UploadArea({ onFileSelect }) {
    const [dragOver, setDragOver] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);

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
        if (file) processFile(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    };

    const processFile = async (file) => {
        if (file.type === 'application/pdf') {
            const fileURL = URL.createObjectURL(file);
            onFileSelect({
                fileName: file.name,
                fileURL: fileURL,
                id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'pdf'
            });
            return;
        }

        if (file.type.startsWith('image/')) {
            setProcessing(true);
            setOcrProgress(0);

            try {
                const imageURL = URL.createObjectURL(file);
                const result = await Tesseract.recognize(
                    file,
                    'eng',
                    {
                        logger: (m) => {
                            if (m.status === 'recognizing text') {
                                setOcrProgress(Math.round(m.progress * 100));
                            }
                        }
                    }
                );

                onFileSelect({
                    fileName: file.name,
                    fileURL: imageURL,
                    id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'image',
                    text: result.data.text,
                    ocrData: result.data,
                    confidence: result.data.confidence
                });
            } catch (error) {
                console.error('OCR error:', error);
                alert('Failed to extract text from image. Please try again.');
            } finally {
                setProcessing(false);
                setOcrProgress(0);
            }
            return;
        }

        alert('Please upload a PDF or image file (JPG, PNG)');
    };

    return (
        <div className="upload-section">
            {processing ? (
                <div className="upload-editorial processing">
                    <div className="processing-content">
                        <div className="processing-label">Extracting</div>
                        <div className="processing-title">Reading your document...</div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${ocrProgress}%` }}
                            />
                        </div>
                        <div className="progress-text">{ocrProgress}% complete</div>
                    </div>
                </div>
            ) : (
                <div
                    className={`upload-editorial ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    <div className="masthead">
                        <div className="masthead-rule" />
                        <div className="masthead-number">No. 001</div>
                        <h2 className="masthead-title">Reading Partner</h2>
                        <p className="masthead-subtitle">Your personal reading & research companion</p>
                        <div className="masthead-rule" />
                    </div>

                    <div className="feature-callouts">
                        <div className="callout">
                            <span className="callout-number">01</span>
                            <div className="callout-content">
                                <span className="callout-title">PDF Rendering</span>
                                <span className="callout-desc">High-fidelity document display</span>
                            </div>
                        </div>
                        <div className="callout">
                            <span className="callout-number">02</span>
                            <div className="callout-content">
                                <span className="callout-title">OCR Extraction</span>
                                <span className="callout-desc">Text from scanned images</span>
                            </div>
                        </div>
                        <div className="callout">
                            <span className="callout-number">03</span>
                            <div className="callout-content">
                                <span className="callout-title">Smart Highlights</span>
                                <span className="callout-desc">Annotate and organize notes</span>
                            </div>
                        </div>
                    </div>

                    <div className="upload-drop-zone">
                        <p className="drop-instruction">Drop your file here, or click to browse</p>
                        <p className="drop-formats">PDF, JPG, PNG</p>
                    </div>
                </div>
            )}
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
