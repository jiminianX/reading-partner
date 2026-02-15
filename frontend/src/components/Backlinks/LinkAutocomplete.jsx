import { useState, useEffect, useRef } from 'react';
import { useReading } from '../../contexts/ReadingContext';
import './LinkAutocomplete.css';

export default function LinkAutocomplete({ query, position, onSelect, onClose }) {
    const { allReadings } = useReading();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef(null);

    const filtered = allReadings.filter(r => {
        const name = (r.fileName || r.name || '').toLowerCase();
        return name.includes(query.toLowerCase());
    });

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && filtered.length > 0) {
                e.preventDefault();
                onSelect(filtered[selectedIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [filtered, selectedIndex, onSelect, onClose]);

    useEffect(() => {
        const active = listRef.current?.querySelector('.link-option.active');
        active?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (filtered.length === 0) {
        return (
            <div className="link-autocomplete" style={{ top: position.top, left: position.left }}>
                <div className="link-no-results">No readings found</div>
            </div>
        );
    }

    return (
        <div className="link-autocomplete" style={{ top: position.top, left: position.left }}>
            <div className="link-autocomplete-header">Link to reading</div>
            <div className="link-options" ref={listRef}>
                {filtered.map((reading, i) => (
                    <div
                        key={reading.id}
                        className={`link-option ${i === selectedIndex ? 'active' : ''}`}
                        onClick={() => onSelect(reading)}
                        onMouseEnter={() => setSelectedIndex(i)}
                    >
                        <span className="link-option-icon">📄</span>
                        <span className="link-option-name">
                            {reading.fileName || reading.name || 'Untitled'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
