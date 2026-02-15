import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import LinkAutocomplete from '../Backlinks/LinkAutocomplete';
import ReaderMode from './ReaderMode';
import { saveLink } from '../../services/storage';
import './PDFViewer.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export default function PDFViewer({
    pdf,
    highlights,
    onAddHighlight,
    onAddNote,
    onNavigateToHighlight,
    onPageChange,
    onClosePDF,
    onDeleteReading
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
    const [ocrMode, setOcrMode] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showLinkAutocomplete, setShowLinkAutocomplete] = useState(false);
    const [linkQuery, setLinkQuery] = useState('');
    const [linkPosition, setLinkPosition] = useState({ top: 0, left: 0 });
    const [readerMode, setReaderMode] = useState(false);
    const [pageTextContent, setPageTextContent] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const containerRef = useRef(null);
    const noteTextareaRef = useRef(null);
    const pageRef = useRef(null);
    const deleteTimeoutRef = useRef(null);

    // Load PDF
    useEffect(() => {
        const loadPDF = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument(pdf.fileURL);
                const pdfDocument = await loadingTask.promise;
                setPdfDoc(pdfDocument);
                setNumPages(pdfDocument.numPages);
                setCurrentPage(1);
            } catch (error) {
                console.error('Error loading PDF:', error);
            }
        };

        if (pdf?.fileURL) {
            loadPDF();
        }
    }, [pdf]);

    // Render current page only
    useEffect(() => {
        if (!pdfDoc || numPages === 0 || readerMode) return;
        renderPage(currentPage);
    }, [pdfDoc, numPages, scale, currentPage, readerMode]);

    // Extract text content for reader mode
    useEffect(() => {
        const extractText = async () => {
            if (!pdfDoc || !readerMode) return;
            const page = await pdfDoc.getPage(currentPage);
            const textContent = await page.getTextContent();
            setPageTextContent(textContent);
        };
        extractText();
    }, [pdfDoc, currentPage, readerMode]);

    const renderPage = async (pageNum) => {
        if (!pdfDoc) return;

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const pageContainer = pageRef.current;
        if (!pageContainer) return;

        const canvas = pageContainer.querySelector('canvas');
        const textLayer = pageContainer.querySelector('.textLayer');

        if (!canvas || !textLayer) return;

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Text layer
        const textContent = await page.getTextContent();
        textLayer.style.height = `${viewport.height}px`;
        textLayer.style.width = `${viewport.width}px`;
        textLayer.innerHTML = '';

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

    // OCR Mode
    const enableOCR = async () => {
        setProcessing(true);
        const pageContainer = pageRef.current;
        const canvas = pageContainer.querySelector('canvas');

        try {
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
        } catch (error) {
            console.error('OCR error:', error);
        } finally {
            setProcessing(false);
        }
    };

    // Page navigation
    const goToPage = useCallback((page) => {
        const clamped = Math.max(1, Math.min(page, numPages));
        if (clamped !== currentPage) {
            setCurrentPage(clamped);
            onPageChange?.(clamped);
        }
    }, [currentPage, numPages, onPageChange]);

    // Expose navigation for highlight clicking in RightPanel
    useEffect(() => {
        if (onNavigateToHighlight) {
            onNavigateToHighlight.current = goToPage;
        }
    }, [onNavigateToHighlight, goToPage]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showNoteInput || showLinkAutocomplete) return;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToPage(currentPage - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToPage(currentPage + 1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, goToPage, showNoteInput, showLinkAutocomplete]);

    // Click navigation on page (left half = prev, right half = next)
    const handlePageClick = useCallback((e) => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) return;
        if (e.target.closest('.textLayer')) return;
        if (e.target.closest('.highlight-overlay')) return;

        const pageEl = e.currentTarget;
        const rect = pageEl.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const isLeftHalf = relativeX < rect.width / 2;

        if (isLeftHalf) {
            goToPage(currentPage - 1);
        } else {
            goToPage(currentPage + 1);
        }
    }, [currentPage, goToPage]);

    // Text selection
    const handleMouseUp = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rects = Array.from(range.getClientRects());

            const pageNumber = findPageNumber(range.startContainer);
            const pageContainer = readerMode
                ? containerRef.current?.querySelector('.reader-mode')
                : pageRef.current;

            if (!pageContainer) return;
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
                position: relativeRects[0],
                allPositions: relativeRects
            });
        }
    };

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
            if (element.dataset?.pageNumber) {
                return parseInt(element.dataset.pageNumber);
            }
            if (element.classList?.contains('pdf-page') || element.classList?.contains('reader-mode')) {
                return currentPage;
            }
            element = element.parentElement;
        }
        return currentPage;
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
        setShowLinkAutocomplete(false);
        clearSelection();
    };

    const handleNoteTextChange = useCallback((e) => {
        const value = e.target.value;
        setNoteText(value);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPos);
        const lastDoubleBracket = textBeforeCursor.lastIndexOf('[[');

        if (lastDoubleBracket !== -1) {
            const afterBracket = textBeforeCursor.slice(lastDoubleBracket + 2);
            if (!afterBracket.includes(']]')) {
                setLinkQuery(afterBracket);
                const textarea = noteTextareaRef.current;
                if (textarea) {
                    const rect = textarea.getBoundingClientRect();
                    setLinkPosition({ top: rect.bottom + 4, left: rect.left });
                }
                setShowLinkAutocomplete(true);
                return;
            }
        }
        setShowLinkAutocomplete(false);
    }, []);

    const handleLinkSelect = async (reading) => {
        const cursorPos = noteTextareaRef.current?.selectionStart || noteText.length;
        const textBeforeCursor = noteText.slice(0, cursorPos);
        const lastDoubleBracket = textBeforeCursor.lastIndexOf('[[');
        const readingName = reading.fileName || reading.name || 'Untitled';

        const newText = noteText.slice(0, lastDoubleBracket) + `[[${readingName}]]` + noteText.slice(cursorPos);
        setNoteText(newText);
        setShowLinkAutocomplete(false);

        if (pdf?.id) {
            try {
                await saveLink({
                    sourceReadingId: pdf.id,
                    targetReadingId: reading.id,
                });
            } catch (error) {
                console.error('Error saving link:', error);
            }
        }
        noteTextareaRef.current?.focus();
    };

    const clearSelection = () => {
        window.getSelection().removeAllRanges();
        setSelectedText(null);
        setShowContextMenu(false);
    };

    const handleDeleteClick = () => {
        if (confirmDelete) {
            onDeleteReading?.();
            setConfirmDelete(false);
        } else {
            setConfirmDelete(true);
            clearTimeout(deleteTimeoutRef.current);
            deleteTimeoutRef.current = setTimeout(() => setConfirmDelete(false), 3000);
        }
    };

    const renderHighlights = (pageNum) => {
        return highlights
            .filter(h => h.pageNumber === pageNum)
            .map(highlight => {
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

    const pageHighlights = useMemo(() => {
        return highlights.filter(h => h.pageNumber === currentPage);
    }, [highlights, currentPage]);

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
                            if (!ocrMode) enableOCR();
                        }}
                        title="Enable OCR for scanned PDFs"
                        disabled={processing}
                    >
                        {processing ? '...' : 'OCR'}
                    </button>
                    <button
                        className={`toolbar-btn ${readerMode ? 'active' : ''}`}
                        onClick={() => setReaderMode(!readerMode)}
                        title={readerMode ? 'PDF View' : 'Reader Mode'}
                    >
                        {readerMode ? 'PDF' : 'Aa'}
                    </button>

                    <span className="toolbar-separator" />

                    <button
                        className="toolbar-btn"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        title="Previous Page"
                    >
                        ‹
                    </button>
                    <span className="page-info">
                        {currentPage} / {numPages}
                    </span>
                    <button
                        className="toolbar-btn"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= numPages}
                        title="Next Page"
                    >
                        ›
                    </button>

                    <span className="toolbar-separator" />

                    <button
                        className="toolbar-btn"
                        onClick={onClosePDF}
                        title="Close Reading"
                    >
                        ×
                    </button>
                    <button
                        className={`toolbar-btn toolbar-btn-delete ${confirmDelete ? 'confirming' : ''}`}
                        onClick={handleDeleteClick}
                        title={confirmDelete ? 'Click again to confirm delete' : 'Delete Reading'}
                    >
                        {confirmDelete ? '?' : 'Del'}
                    </button>
                </div>
            </div>

            {processing && (
                <div className="ocr-banner">
                    Running OCR... This may take a moment.
                </div>
            )}

            <div
                className="pdf-content"
                ref={containerRef}
                onMouseUp={handleMouseUp}
                onContextMenu={handleContextMenu}
            >
                {readerMode ? (
                    <div data-page-number={currentPage}>
                        <ReaderMode
                            textContent={pageTextContent}
                            pageNumber={currentPage}
                            totalPages={numPages}
                            highlights={pageHighlights}
                            onPrevPage={() => goToPage(currentPage - 1)}
                            onNextPage={() => goToPage(currentPage + 1)}
                        />
                    </div>
                ) : (
                    <div
                        className="pdf-page"
                        data-page-number={currentPage}
                        ref={pageRef}
                        onClick={handlePageClick}
                    >
                        <canvas />
                        <div className="textLayer" />
                        <div className="highlightLayer">
                            {renderHighlights(currentPage)}
                        </div>
                        {currentPage > 1 && (
                            <div className="nav-zone nav-zone-prev" />
                        )}
                        {currentPage < numPages && (
                            <div className="nav-zone nav-zone-next" />
                        )}
                    </div>
                )}

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
                                Add Note
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
                            <div className="note-textarea-wrapper">
                                <textarea
                                    ref={noteTextareaRef}
                                    value={noteText}
                                    onChange={handleNoteTextChange}
                                    placeholder='Write your note here... Type [[ to link to another reading'
                                    autoFocus
                                />
                                {showLinkAutocomplete && (
                                    <LinkAutocomplete
                                        query={linkQuery}
                                        position={linkPosition}
                                        onSelect={handleLinkSelect}
                                        onClose={() => setShowLinkAutocomplete(false)}
                                    />
                                )}
                            </div>
                            <div className="note-actions">
                                <button className="btn btn-primary" onClick={handleSaveNote}>
                                    Save Note
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setShowNoteInput(false);
                                        setNoteText('');
                                        setShowLinkAutocomplete(false);
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
