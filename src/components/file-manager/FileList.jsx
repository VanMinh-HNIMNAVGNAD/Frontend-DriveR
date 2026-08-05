import React from 'react';
import FileCard from './FileCard';
import FolderCard from './FolderCard';

export default function FileList({ items = [], onFolderDoubleClick, onFileDoubleClick, onContextMenu }) {
    if (!items || items.length === 0) return null;

    const folders = items.filter(i => i.type === 'folder');
    const files = items.filter(i => i.type === 'file');

    return (
        <div className="space-y-6">
            {folders.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {folders.map(folder => (
                        <FolderCard key={folder.id} folder={folder} onDoubleClick={onFolderDoubleClick} onContextMenu={onContextMenu} />
                    ))}
                </div>
            )}
            {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {files.map(file => (
                        <FileCard key={file.id} file={file} onDoubleClick={onFileDoubleClick} onContextMenu={onContextMenu} />
                    ))}
                </div>
            )}
        </div>
    );
}
