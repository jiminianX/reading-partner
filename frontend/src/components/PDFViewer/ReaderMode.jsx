import { useMemo } from 'react';
import './ReaderMode.css';

function groupTextIntoParagraphs(textContent) {
    if (!textContent?.items?.length) return [];

    const items = textContent.items.filter(item => item.str.trim());
    if (items.length === 0) return [];

    // Sort by vertical position (transform[5]), then horizontal (transform[4])
    const sorted = [...items].sort((a, b) => {
        const ay = a.transform[5];
        const by = b.transform[5];
        if (Math.abs(ay - by) > 2) return ay - by;
        return a.transform[4] - b.transform[4];
    });

    // Group into lines (items within ~5px vertical threshold)
    const lines = [];
    let currentLine = [];
    let lastY = null;

    for (const item of sorted) {
        const y = item.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.length) lines.push(currentLine);
            currentLine = [];
        }
        currentLine.push(item);
        lastY = y;
    }
    if (currentLine.length) lines.push(currentLine);

    // Group lines into paragraphs (larger gap = new paragraph)
    const paragraphs = [];
    let currentParagraph = [];
    let lastLineY = null;

    for (const line of lines) {
        const lineY = line[0].transform[5];
        const lineText = line.map(item => item.str).join(' ');
        const fontSize = Math.abs(line[0].transform[0]) || 12;

        if (lastLineY !== null) {
            const gap = Math.abs(lineY - lastLineY);
            if (gap > fontSize * 1.8) {
                if (currentParagraph.length) {
                    paragraphs.push(currentParagraph.join(' '));
                }
                currentParagraph = [];
            }
        }
        currentParagraph.push(lineText);
        lastLineY = lineY;
    }
    if (currentParagraph.length) {
        paragraphs.push(currentParagraph.join(' '));
    }

    return paragraphs;
}

function renderWithHighlights(text, highlights) {
    if (!highlights || highlights.length === 0) return text;

    let segments = [{ text, highlighted: false }];

    for (const highlight of highlights) {
        segments = segments.flatMap(segment => {
            if (segment.highlighted) return [segment];
            const idx = segment.text.indexOf(highlight.text);
            if (idx === -1) return [segment];
            return [
                { text: segment.text.slice(0, idx), highlighted: false },
                { text: segment.text.slice(idx, idx + highlight.text.length), highlighted: true, color: highlight.color },
                { text: segment.text.slice(idx + highlight.text.length), highlighted: false },
            ].filter(s => s.text);
        });
    }

    return segments.map((seg, i) =>
        seg.highlighted
            ? <mark key={i} style={{ backgroundColor: seg.color, opacity: 0.5, borderRadius: '2px', padding: '0 1px' }}>{seg.text}</mark>
            : seg.text
    );
}

export default function ReaderMode({
    textContent,
    pageNumber,
    totalPages,
    highlights,
    onPrevPage,
    onNextPage
}) {
    const paragraphs = useMemo(() => {
        return groupTextIntoParagraphs(textContent);
    }, [textContent]);

    if (!textContent) {
        return (
            <div className="reader-mode">
                <div className="reader-loading">Extracting text...</div>
            </div>
        );
    }

    return (
        <div className="reader-mode" data-page-number={pageNumber}>
            <div className="reader-page-label">Page {pageNumber} of {totalPages}</div>

            {paragraphs.length === 0 ? (
                <div className="reader-empty">
                    <p>No extractable text found on this page.</p>
                    <p className="reader-empty-hint">This may be a scanned document. Try OCR mode in PDF view.</p>
                </div>
            ) : (
                <div className="reader-body">
                    {paragraphs.map((para, i) => (
                        <p key={i} className="reader-paragraph">
                            {renderWithHighlights(para, highlights)}
                        </p>
                    ))}
                </div>
            )}

            <div className="reader-disclaimer">
                Text formatting is best-effort and may differ from the original layout.
            </div>

            <div className="reader-nav">
                <button
                    className="reader-nav-btn"
                    onClick={onPrevPage}
                    disabled={pageNumber <= 1}
                >
                    ← Previous
                </button>
                <span className="reader-nav-page">{pageNumber} / {totalPages}</span>
                <button
                    className="reader-nav-btn"
                    onClick={onNextPage}
                    disabled={pageNumber >= totalPages}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
