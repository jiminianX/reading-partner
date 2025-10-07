import './NotesPanel.css';

export default function NotesPanel() {
    return (
        <div className="notes-panel">
            <h3>My Notes</h3>
            <div className="notes-list">
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9em', textAlign: 'center' }}>
                    No notes yet. Select text and click "Add Note"
                </p>
            </div>
        </div>
    );
}
