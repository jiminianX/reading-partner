import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReading } from '../../contexts/ReadingContext';
import './Sidebar.css';

export default function Sidebar({ onSelectReading }) {
    const navigate = useNavigate();
    const { allReadings, loadAllReadings } = useReading();
    const [searchQuery, setSearchQuery] = useState('');
    const [folders, setFolders] = useState([
        { id: 'all', name: 'All Readings', count: 0, icon: '' }
    ]);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [activeFolder, setActiveFolder] = useState('all');

    useEffect(() => {
        loadAllReadings();
    }, [loadAllReadings]);

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            const newFolder = {
                id: Date.now().toString(),
                name: newFolderName.trim(),
                count: 0,
                icon: ''
            };
            setFolders([...folders, newFolder]);
            setNewFolderName('');
            setShowNewFolderInput(false);
        }
    };

    const handleDeleteFolder = (folderId) => {
        if (folderId === 'all') return;
        setFolders(folders.filter(f => f.id !== folderId));
        if (activeFolder === folderId) setActiveFolder('all');
    };

    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="sidebar-content">
            <div className="sidebar-header">
                <h3>Library</h3>
            </div>

            <div className="sidebar-search">
                <input
                    type="text"
                    placeholder="Search folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="folders-section">
                <div className="folders-header">
                    <span>Folders</span>
                    <button
                        className="btn-icon-small"
                        onClick={() => setShowNewFolderInput(true)}
                        title="New Folder"
                    >
                        +
                    </button>
                </div>

                {showNewFolderInput && (
                    <div className="new-folder-input">
                        <input
                            type="text"
                            placeholder="Folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                            autoFocus
                        />
                        <div className="new-folder-actions">
                            <button 
                                className="btn-small btn-primary"
                                onClick={handleCreateFolder}
                            >
                                Create
                            </button>
                            <button 
                                className="btn-small btn-ghost"
                                onClick={() => {
                                    setShowNewFolderInput(false);
                                    setNewFolderName('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="folders-list">
                    {filteredFolders.map(folder => (
                        <div
                            key={folder.id}
                            className={`folder-item ${activeFolder === folder.id ? 'active' : ''}`}
                            onClick={() => setActiveFolder(folder.id)}
                        >
                            <div className="folder-main">
                                <span className="folder-icon">{folder.icon}</span>
                                <span className="folder-name">{folder.name}</span>
                                <span className="folder-count">{folder.count}</span>
                            </div>
                            {folder.id !== 'all' && (
                                <button
                                    className="folder-delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFolder(folder.id);
                                    }}
                                    title="Delete folder"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {filteredFolders.length === 0 && (
                    <div className="empty-state">
                        No folders match your search
                    </div>
                )}
            </div>

            <div className="readings-section">
                <div className="folders-header">
                    <span>Readings</span>
                    <span className="reading-count">{allReadings.length}</span>
                </div>
                <div className="readings-list">
                    {allReadings.length === 0 ? (
                        <div className="empty-state">No readings yet</div>
                    ) : (
                        allReadings.map(reading => (
                            <div
                                key={reading.id}
                                className="reading-item"
                                onClick={() => onSelectReading?.(reading)}
                            >
                                <span className="reading-icon">📄</span>
                                <div className="reading-info">
                                    <span className="reading-name">{reading.fileName || reading.name || 'Untitled'}</span>
                                    {reading.createdAt && (
                                        <span className="reading-date">
                                            {new Date(reading.createdAt.seconds ? reading.createdAt.seconds * 1000 : reading.createdAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="sidebar-footer">
                <button
                    className="graph-view-btn"
                    onClick={() => navigate('/app/graph')}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="4" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="12" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="5.5" y1="5.5" x2="7" y2="11" stroke="currentColor" strokeWidth="1.2" />
                        <line x1="10.5" y1="5.5" x2="9" y2="11" stroke="currentColor" strokeWidth="1.2" />
                        <line x1="6" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    Graph View
                </button>
            </div>
        </div>
    );
}