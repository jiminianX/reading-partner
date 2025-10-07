import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [folders, setFolders] = useState([
        { id: 'all', name: 'All Readings', count: 0, icon: '' }
    ]);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [activeFolder, setActiveFolder] = useState('all');

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
        </div>
    );
}