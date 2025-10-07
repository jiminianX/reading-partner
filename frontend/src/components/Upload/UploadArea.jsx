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
        console.log('📁 File selected:', file.name, file.type);

        // Handle PDFs directly
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

        // Handle images with OCR
        if (file.type.startsWith('image/')) {
            setProcessing(true);
            setOcrProgress(0);

            try {
                console.log('🔍 Running OCR on image...');
                
                // Convert image to data URL for display
                const imageURL = URL.createObjectURL(file);
                
                // Run OCR
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

                console.log('✅ OCR complete, confidence:', result.data.confidence);

                // Create a document object with the extracted text and image
                onFileSelect({
                    fileName: file.name,
                    fileURL: imageURL,
                    id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'image',
                    text: result.data.text,
                    ocrData: result.data, // Full OCR data including word positions
                    confidence: result.data.confidence
                });

            } catch (error) {
                console.error('❌ OCR error:', error);
                alert('Failed to extract text from image. Please try again.');
            } finally {
                setProcessing(false);
                setOcrProgress(0);
            }
            return;
        }

        // Unsupported file type
        alert('Please upload a PDF or image file (JPG, PNG)');
    };

    return (
        <div className="upload-section">
            {processing ? (
                <div className="upload-area processing">
                    <div className="processing-animation">
                        <div className="upload-icon">🔍</div>
                        <div style={{ fontSize: '1.2em', marginTop: '20px' }}>
                            Extracting text from image...
                        </div>
                        <div className="progress-bar" style={{ marginTop: '20px' }}>
                            <div 
                                className="progress-fill" 
                                style={{ width: `${ocrProgress}%` }}
                            />
                        </div>
                        <div style={{ fontSize: '0.9em', marginTop: '10px', color: 'var(--text-secondary)' }}>
                            {ocrProgress}% complete
                        </div>
                    </div>
                </div>
            ) : (
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
                        PDFs render directly • Images use OCR to extract text
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9em', marginBottom: '20px' }}>
                        Supports: PDF, JPG, PNG, JPEG
                    </div>
                    <button className="btn">Choose File</button>
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