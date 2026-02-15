import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReading } from '../../contexts/ReadingContext';
import { deleteReading, renameReading, moveReadingToFolder } from '../../services/storage';
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

    // Context menu state
    const [contextMenu, setContextMenu] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Inline rename state
    const [renameTarget, setRenameTarget] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const renameInputRef = useRef(null);

    // Move submenu state
    const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);

    useEffect(() => {
        loadAllReadings();
    }, [loadAllReadings]);

    useEffect(() => {
        if (renameTarget && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renameTarget]);

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

    // Context menu handlers
    const handleReadingContextMenu = (e, reading) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ readingId: reading.id, x: e.clientX, y: e.clientY });
        setDeleteConfirm(null);
        setShowMoveSubmenu(false);
    };

    const closeContextMenu = () => {
        setContextMenu(null);
        setDeleteConfirm(null);
        setShowMoveSubmenu(false);
    };

    const handleRename = () => {
        const reading = allReadings.find(r => r.id === contextMenu?.readingId);
        if (!reading) return;
        setRenameTarget(contextMenu.readingId);
        setRenameValue(reading.fileName || reading.name || 'Untitled');
        closeContextMenu();
    };

    const handleRenameSubmit = async () => {
        if (!renameTarget || !renameValue.trim()) {
            setRenameTarget(null);
            return;
        }
        try {
            await renameReading(renameTarget, renameValue.trim());
            await loadAllReadings();
        } catch (error) {
            console.error('Error renaming reading:', error);
        }
        setRenameTarget(null);
    };

    const handleRenameKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            setRenameTarget(null);
        }
    };

    const handleDeleteReading = async () => {
        if (!contextMenu?.readingId) return;
        if (deleteConfirm === contextMenu.readingId) {
            try {
                await deleteReading(contextMenu.readingId);
                await loadAllReadings();
            } catch (error) {
                console.error('Error deleting reading:', error);
            }
            closeContextMenu();
        } else {
            setDeleteConfirm(contextMenu.readingId);
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const handleMoveToFolder = async (folderId) => {
        if (!contextMenu?.readingId) return;
        try {
            await moveReadingToFolder(contextMenu.readingId, folderId === 'all' ? null : folderId);
            await loadAllReadings();
        } catch (error) {
            console.error('Error moving reading:', error);
        }
        closeContextMenu();
    };

    const handleItemKeyDown = (e, callback) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback();
        }
    };

    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter readings by active folder
    const filteredReadings = activeFolder === 'all'
        ? allReadings
        : allReadings.filter(r => r.folderId === activeFolder);

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
                    aria-label="Search folders"
                />
            </div>

            <div className="folders-section">
                <div className="folders-header">
                    <span>Folders</span>
                    <button
                        className="btn-icon-small"
                        onClick={() => setShowNewFolderInput(true)}
                        aria-label="Create new folder"
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
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                            aria-label="New folder name"
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
                            onKeyDown={(e) => handleItemKeyDown(e, () => setActiveFolder(folder.id))}
                            tabIndex={0}
                            role="button"
                            aria-label={`${folder.name} folder`}
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
                                    aria-label={`Delete ${folder.name} folder`}
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
                    <span className="reading-count">{filteredReadings.length}</span>
                </div>
                <div className="readings-list">
                    {filteredReadings.length === 0 ? (
                        <div className="empty-state">No readings yet</div>
                    ) : (
                        filteredReadings.map(reading => (
                            <div
                                key={reading.id}
                                className="reading-item"
                                onClick={() => renameTarget !== reading.id && onSelectReading?.(reading)}
                                onContextMenu={(e) => handleReadingContextMenu(e, reading)}
                                onKeyDown={(e) => handleItemKeyDown(e, () => onSelectReading?.(reading))}
                                tabIndex={0}
                                role="button"
                                aria-label={`Open ${reading.fileName || reading.name || 'Untitled'}`}
                            >
                                <span className="reading-icon">📄</span>
                                <div className="reading-info">
                                    {renameTarget === reading.id ? (
                                        <input
                                            ref={renameInputRef}
                                            type="text"
                                            className="reading-rename-input"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={handleRenameKeyDown}
                                            onBlur={handleRenameSubmit}
                                            onClick={(e) => e.stopPropagation()}
                                            aria-label="Rename reading"
                                        />
                                    ) : (
                                        <span className="reading-name">{reading.fileName || reading.name || 'Untitled'}</span>
                                    )}
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
                    aria-label="Open graph view"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

            {/* Reading Context Menu */}
            {contextMenu && (
                <>
                    <div
                        className="context-menu-backdrop"
                        onClick={closeContextMenu}
                    />
                    <div
                        className="context-menu sidebar-context-menu"
                        style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
                        role="menu"
                    >
                        <button role="menuitem" onClick={handleRename}>
                            Rename
                        </button>
                        <button
                            role="menuitem"
                            onClick={() => setShowMoveSubmenu(!showMoveSubmenu)}
                            className={showMoveSubmenu ? 'has-submenu open' : 'has-submenu'}
                        >
                            Move to Folder
                            <span className="submenu-arrow">›</span>
                        </button>
                        {showMoveSubmenu && (
                            <div className="move-submenu">
                                {folders.map(folder => (
                                    <button
                                        key={folder.id}
                                        role="menuitem"
                                        onClick={() => handleMoveToFolder(folder.id)}
                                    >
                                        {folder.icon} {folder.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="menu-divider"></div>
                        <button
                            role="menuitem"
                            className={`context-menu-delete ${deleteConfirm === contextMenu.readingId ? 'confirming' : ''}`}
                            onClick={handleDeleteReading}
                        >
                            {deleteConfirm === contextMenu.readingId ? 'Click again to confirm' : 'Delete'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
