import { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import './PDFViewer.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export default function PDFViewer({ 
    pdf, 
    highlights, 
    notes,
    onAddHighlight, 
    onAddNote,
    onDeleteHighlight,
    onDeleteNote,
    onNavigateToHighlight 
}) {
    const [scale, setScale] = useState(1.5);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [selectedText, setSelectedText] = useState(null);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ocrMode, setOcrMode] = useState(false); // OCR for scanned PDFs
    const [processing, setProcessing] = useState(false);
    
    const containerRef = useRef(null);
    const pageRefs = useRef([]);

    // Load PDF
    useEffect(() => {
        const loadPDF = async () => {
            try {
                console.log('📄 Loading PDF:', pdf.fileName);
                const loadingTask = pdfjsLib.getDocument(pdf.fileURL);
                const pdfDocument = await loadingTask.promise;
                setPdfDoc(pdfDocument);
                setNumPages(pdfDocument.numPages);
                console.log('✅ PDF loaded, pages:', pdfDocument.numPages);
            } catch (error) {
                console.error('❌ Error loading PDF:', error);
            }
        };

        if (pdf?.fileURL) {
            loadPDF();
        }
    }, [pdf]);

    // Render all pages with improved text layer
    useEffect(() => {
        if (!pdfDoc || numPages === 0) return;

        const renderPages = async () => {
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                await renderPage(pageNum);
            }
        };

        renderPages();
    }, [pdfDoc, numPages, scale]);

    const renderPage = async (pageNum) => {
        if (!pdfDoc) return;

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const pageContainer = pageRefs.current[pageNum - 1];
        if (!pageContainer) return;

        const canvas = pageContainer.querySelector('canvas');
        const textLayer = pageContainer.querySelector('.textLayer');

        if (!canvas || !textLayer) return;

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Enhanced text layer with better positioning
        const textContent = await page.getTextContent();
        textLayer.style.height = `${viewport.height}px`;
        textLayer.style.width = `${viewport.width}px`;
        textLayer.innerHTML = '';

        // Better text rendering
        textContent.items.forEach((item, index) => {
            const div = document.createElement('div');
            div.textContent = item.str;
            div.dataset.index = index;
            
            const tx = pdfjsLib.Util.transform(
                viewport.transform,
                item.transform
            );
            
            const fontSize = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
            
            div.style.position = 'absolute';
            div.style.left = `${tx[4]}px`;
            div.style.top = `${tx[5] - fontSize}px`;
            div.style.fontSize = `${fontSize}px`;
            div.style.fontFamily = item.fontName || 'sans-serif';
            div.style.whiteSpace = 'pre';
            div.style.transformOrigin = '0% 0%';
            
            textLayer.appendChild(div);
        });
    };

    // OCR Mode for scanned PDFs
    const enableOCR = async (pageNum) => {
        setProcessing(true);
        const pageContainer = pageRefs.current[pageNum - 1];
        const canvas = pageContainer.querySelector('canvas');

        try {
            console.log('🔍 Running OCR on page', pageNum);
            const result = await Tesseract.recognize(
                canvas.toDataURL(),
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                        }
                    }
                }
            );

            // Create selectable text layer from OCR
            const textLayer = pageContainer.querySelector('.textLayer');
            textLayer.innerHTML = '';
            
            result.data.words.forEach(word => {
                const div = document.createElement('div');
                div.textContent = word.text;
                div.style.position = 'absolute';
                div.style.left = `${word.bbox.x0 * scale}px`;
                div.style.top = `${word.bbox.y0 * scale}px`;
                div.style.width = `${(word.bbox.x1 - word.bbox.x0) * scale}px`;
                div.style.height = `${(word.bbox.y1 - word.bbox.y0) * scale}px`;
                textLayer.appendChild(div);
            });

            console.log('✅ OCR complete');
        } catch (error) {
            console.error('❌ OCR error:', error);
        } finally {
            setProcessing(false);
        }
    };

    // Improved text selection with better position tracking
    const handleMouseUp = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rects = Array.from(range.getClientRects());
            
            // Get the most accurate bounding box
            const containerRect = containerRef.current.getBoundingClientRect();
            const pageNumber = findPageNumber(range.startContainer);
            
            // Calculate position relative to page, not viewport
            const pageContainer = pageRefs.current[pageNumber - 1];
            const pageRect = pageContainer.getBoundingClientRect();
            
            const relativeRects = rects.map(rect => ({
                x: rect.left - pageRect.left,
                y: rect.top - pageRect.top,
                width: rect.width,
                height: rect.height
            }));

            setSelectedText({
                text,
                range,
                pageNumber,
                position: relativeRects[0], // Use first rect for primary position
                allPositions: relativeRects // Store all positions for multi-line selections
            });
        }
    };

    // Handle right-click context menu
    const handleContextMenu = (e) => {
        e.preventDefault();
        
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text) {
            setShowContextMenu(true);
            setContextMenuPos({ x: e.clientX, y: e.clientY });
        }
    };

    const findPageNumber = (node) => {
        let element = node;
        while (element) {
            if (element.classList?.contains('pdf-page')) {
                return parseInt(element.dataset.pageNumber);
            }
            element = element.parentElement;
        }
        return 1;
    };

    const handleAddHighlight = (color) => {
        if (!selectedText) return;

        const highlightData = {
            text: selectedText.text,
            color,
            pageNumber: selectedText.pageNumber,
            position: selectedText.position,
            allPositions: selectedText.allPositions,
            timestamp: Date.now()
        };

        onAddHighlight(highlightData);
        clearSelection();
    };

    const handleOpenNoteInput = () => {
        setShowContextMenu(false);
        setShowNoteInput(true);
    };

    const handleSaveNote = () => {
        if (!selectedText || !noteText.trim()) return;

        const noteData = {
            text: noteText.trim(),
            context: selectedText.text,
            pageNumber: selectedText.pageNumber,
            position: selectedText.position,
            timestamp: Date.now()
        };

        onAddNote(noteData);
        setNoteText('');
        setShowNoteInput(false);
        clearSelection();
    };

    const clearSelection = () => {
        window.getSelection().removeAllRanges();
        setSelectedText(null);
        setShowContextMenu(false);
    };

    const scrollToPage = (pageNumber) => {
        const pageElement = pageRefs.current[pageNumber - 1];
        if (pageElement) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        if (onNavigateToHighlight) {
            onNavigateToHighlight.current = scrollToPage;
        }
    }, [onNavigateToHighlight]);

    const renderHighlights = (pageNum) => {
        return highlights
            .filter(h => h.pageNumber === pageNum)
            .map(highlight => {
                // Handle multi-line highlights
                const positions = highlight.allPositions || [highlight.position];
                return positions.map((pos, idx) => (
                    <div
                        key={`${highlight.id}-${idx}`}
                        className="highlight-overlay"
                        style={{
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            width: `${pos.width}px`,
                            height: `${pos.height}px`,
                            backgroundColor: highlight.color,
                            opacity: 0.4,
                            pointerEvents: 'none'
                        }}
                    />
                ));
            });
    };

    return (
        <div className="pdf-viewer-container">
            <div className="pdf-toolbar">
                <div className="pdf-title">{pdf.fileName}</div>
                <div className="pdf-controls">
                    <button 
                        className="toolbar-btn"
                        onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                        title="Zoom Out"
                    >
                        −
                    </button>
                    <span className="zoom-level">{Math.round(scale * 100)}%</span>
                    <button 
                        className="toolbar-btn"
                        onClick={() => setScale(Math.min(3.0, scale + 0.1))}
                        title="Zoom In"
                    >
                        +
                    </button>
                    <button 
                        className={`toolbar-btn ${ocrMode ? 'active' : ''}`}
                        onClick={() => {
                            setOcrMode(!ocrMode);
                            if (!ocrMode) enableOCR(currentPage);
                        }}
                        title="Enable OCR for scanned PDFs"
                        disabled={processing}
                    >
                        {processing ? '⏳' : '🔍'}
                    </button>
                    <span className="page-info">
                        Page {currentPage} / {numPages}
                    </span>
                </div>
            </div>

            {processing && (
                <div style={{
                    padding: '10px',
                    background: 'var(--bg-secondary)',
                    textAlign: 'center',
                    color: 'var(--primary)'
                }}>
                    Running OCR... This may take a moment.
                </div>
            )}

            <div 
                className="pdf-content" 
                ref={containerRef}
                onMouseUp={handleMouseUp}
                onContextMenu={handleContextMenu}
            >
                {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
                    <div
                        key={pageNum}
                        className="pdf-page"
                        data-page-number={pageNum}
                        ref={el => pageRefs.current[pageNum - 1] = el}
                    >
                        <canvas />
                        <div className="textLayer" />
                        <div className="highlightLayer">
                            {renderHighlights(pageNum)}
                        </div>
                    </div>
                ))}

                {/* Context Menu */}
                {showContextMenu && (
                    <>
                        <div 
                            className="context-menu-backdrop"
                            onClick={() => setShowContextMenu(false)}
                        />
                        <div
                            className="context-menu"
                            style={{
                                left: `${contextMenuPos.x}px`,
                                top: `${contextMenuPos.y}px`
                            }}
                        >
                            <button onClick={() => handleAddHighlight('yellow')}>
                                <span className="color-icon" style={{ background: 'yellow' }}></span>
                                Yellow Highlight
                            </button>
                            <button onClick={() => handleAddHighlight('lightgreen')}>
                                <span className="color-icon" style={{ background: 'lightgreen' }}></span>
                                Green Highlight
                            </button>
                            <button onClick={() => handleAddHighlight('lightpink')}>
                                <span className="color-icon" style={{ background: 'lightpink' }}></span>
                                Pink Highlight
                            </button>
                            <button onClick={() => handleAddHighlight('lightblue')}>
                                <span className="color-icon" style={{ background: 'lightblue' }}></span>
                                Blue Highlight
                            </button>
                            <div className="menu-divider"></div>
                            <button onClick={handleOpenNoteInput}>
                                📝 Add Note
                            </button>
                        </div>
                    </>
                )}

                {/* Note Input Modal */}
                {showNoteInput && (
                    <div className="note-input-modal">
                        <div className="note-input-content">
                            <h4>Add Note</h4>
                            <p className="note-context">"{selectedText?.text}"</p>
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Write your note here..."
                                autoFocus
                            />
                            <div className="note-actions">
                                <button className="btn btn-primary" onClick={handleSaveNote}>
                                    Save Note
                                </button>
                                <button 
                                    className="btn btn-ghost" 
                                    onClick={() => {
                                        setShowNoteInput(false);
                                        setNoteText('');
                                        clearSelection();
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}