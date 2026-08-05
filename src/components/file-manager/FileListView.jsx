import { useState } from 'react';
import { useFiles } from '../../context/FileContext';
import FileSkeleton from '../common/FileSkeleton';
import ContextMenu from './ContextMenu';
import RenameModal from './RenameModal';
import ShareModal from './ShareModal';
import GeminiModal from './GeminiModal';
import { 
    Folder, 
    FileText, 
    FileSpreadsheet, 
    Image as ImageIcon, 
    FileCode, 
    FileArchive, 
    File, 
    Video, 
    Music, 
    Database, 
    Layers, 
    Star, 
    MoreVertical, 
    FolderOpen,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    Shield,
    Users
} from 'lucide-react';

export default function FileListView() {
    const { 
        folders, 
        files, 
        currentFilteredItems, 
        openFolder, 
        toggleStar, 
        moveToTrash, 
        restoreFromTrash, 
        deletePermanently, 
        renameItem,
        openInfoDrawer,
        openPreview,
        getDownloadUrl,
        activeTab,
        isLoading,
        currentPage,
        setCurrentPage,
        pageSize,
        totalItems,
        totalPages,
        sortField, 
        setSortField,
        sortDirection, 
        setSortDirection
    } = useFiles();

    // Context menu state
    const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, item: null });

    // Modals state
    const [renameItemTarget, setRenameItemTarget] = useState(null);
    const [shareItemTarget, setShareItemTarget] = useState(null);
    const [geminiItemTarget, setGeminiItemTarget] = useState(null);

    const formatBytes = (bytes) => {
        if (!bytes) return '--';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileTypeLabel = (item) => {
        if (item.type === 'folder') return 'Thư mục';
        const name = item.name.toLowerCase();
        if (name.endsWith('.pdf')) return 'Tài liệu PDF';
        if (name.endsWith('.xlsx') || name.endsWith('.csv')) return 'Bảng tính Excel';
        if (name.endsWith('.docx') || name.endsWith('.doc')) return 'Văn bản Word';
        if (name.endsWith('.pptx') || name.endsWith('.ppt')) return 'Trình chiếu PPT';
        if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'Hình ảnh PNG/JPG';
        if (name.endsWith('.svg')) return 'Đồ họa Vector SVG';
        if (name.endsWith('.mp4') || name.endsWith('.mkv')) return 'Video Clip MP4';
        if (name.endsWith('.mp3') || name.endsWith('.wav')) return 'Âm thanh MP3';
        if (name.endsWith('.py')) return 'Mã nguồn Python';
        if (name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.ts')) return 'Mã nguồn Script';
        if (name.endsWith('.sql') || name.endsWith('.db')) return 'Cơ sở dữ liệu SQL';
        if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return 'Tệp nén ZIP/RAR';
        if (name.endsWith('.md')) return 'Tài liệu Markdown';
        if (name.endsWith('.fig')) return 'Thiết kế Figma';
        if (name.endsWith('.exe')) return 'Tệp Thực thi EXE';
        return 'Tệp tin';
    };

    const getFileIcon = (file) => {
        const name = file.name.toLowerCase();
        if (name.endsWith('.pdf')) return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
        if (name.endsWith('.xlsx') || name.endsWith('.csv')) return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />;
        if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) return <ImageIcon className="w-4 h-4 text-purple-500 shrink-0" />;
        if (name.endsWith('.svg')) return <ImageIcon className="w-4 h-4 text-pink-500 shrink-0" />;
        if (name.endsWith('.docx') || name.endsWith('.txt') || name.endsWith('.md')) return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
        if (name.endsWith('.mp4') || name.endsWith('.mkv')) return <Video className="w-4 h-4 text-violet-500 shrink-0" />;
        if (name.endsWith('.mp3') || name.endsWith('.wav')) return <Music className="w-4 h-4 text-pink-500 shrink-0" />;
        if (name.endsWith('.py') || name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.ts')) return <FileCode className="w-4 h-4 text-amber-500 shrink-0" />;
        if (name.endsWith('.sql') || name.endsWith('.db')) return <Database className="w-4 h-4 text-cyan-600 shrink-0" />;
        if (name.endsWith('.fig')) return <Layers className="w-4 h-4 text-purple-600 shrink-0" />;
        if (name.endsWith('.zip') || name.endsWith('.rar')) return <FileArchive className="w-4 h-4 text-amber-600 shrink-0" />;
        if (name.endsWith('.exe')) return <FileCode className="w-4 h-4 text-rose-600 shrink-0" />;
        return <File className="w-4 h-4 text-gray-500 shrink-0" />;
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Folders and files are already sorted by FileContext
    const sortedFolders = folders || [];
    const sortedFiles = files || [];

    const handleItemDoubleClick = (item) => {
        if (item.type === 'folder' && !item.isTrash && !item.isSpam) {
            openFolder(item);
        } else {
            openPreview(item);
        }
    };

    const openContextMenu = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
            item
        });
    };

    const closeContextMenu = () => {
        setContextMenu({ isOpen: false, x: 0, y: 0, item: null });
    };

    const handleKeyDown = (e, item) => {
        if (e.ctrlKey && e.altKey && (e.key === 'e' || e.key === 'E')) {
            e.preventDefault();
            setRenameItemTarget(item);
        } else if (e.key === 'Delete') {
            e.preventDefault();
            moveToTrash(item.id);
        }
    };

    if (isLoading) {
        return <FileSkeleton count={10} type="table" />;
    }

    if (currentFilteredItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 select-none">
                <FolderOpen className="w-16 h-16 stroke-1 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">Chưa có tệp hoặc thư mục nào ở đây</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col h-full justify-between select-none text-xs sm:text-sm relative">
            {/* Extended Metadata Table View */}
            <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-2xs bg-white">
                <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead>
                        <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/80 select-none">
                            <th className="py-3 px-3 w-8 text-center"></th>
                            
                            {/* Name Header */}
                            <th 
                                onClick={() => handleSort('name')}
                                className="py-3 px-3 font-semibold hover:text-gray-900 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-1">
                                    <span>Name</span>
                                    {sortField === 'name' && (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                    )}
                                </div>
                            </th>

                            {/* Size Header */}
                            <th 
                                onClick={() => handleSort('size')}
                                className="py-3 px-3 font-semibold hover:text-gray-900 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-1">
                                    <span>Size</span>
                                    {sortField === 'size' && (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                    )}
                                </div>
                            </th>

                            {/* Type Header */}
                            <th 
                                onClick={() => handleSort('type')}
                                className="py-3 px-3 font-semibold hover:text-gray-900 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-1">
                                    <span>Type</span>
                                    {sortField === 'type' && (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                    )}
                                </div>
                            </th>

                            {/* Owner Header */}
                            <th 
                                onClick={() => handleSort('owner')}
                                className="py-3 px-3 font-semibold hover:text-gray-900 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-1">
                                    <span>Owner</span>
                                    {sortField === 'owner' && (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                    )}
                                </div>
                            </th>

                            {/* Group Header */}
                            <th 
                                onClick={() => handleSort('group')}
                                className="py-3 px-3 font-semibold hover:text-gray-900 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-1">
                                    <span>Group</span>
                                    {sortField === 'group' && (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                    )}
                                </div>
                            </th>

                            {/* Permissions Header */}
                            <th className="py-3 px-3 font-semibold text-gray-500">
                                <span>Permissions</span>
                            </th>

                            {/* Modified Header */}
                            <th 
                                onClick={() => handleSort('updatedAt')}
                                className="py-3 px-3 font-semibold hover:text-gray-900 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-1">
                                    <span>Modified</span>
                                    {sortField === 'updatedAt' && (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                    )}
                                </div>
                            </th>

                            {/* Created Header */}
                            <th 
                                onClick={() => handleSort('createdAt')}
                                className="py-3 px-3 font-semibold hover:text-gray-900 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-1">
                                    <span>Created</span>
                                    {sortField === 'createdAt' && (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                    )}
                                </div>
                            </th>

                            <th className="py-3 px-3 w-10 text-center"></th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 text-xs">
                        {/* Render Folders */}
                        {sortedFolders.map((folder) => {
                            const isSelected = false; // TODO: Implement selection logic (B18)
                            return (
                            <tr
                                key={folder.id}
                                tabIndex={0}
                                onKeyDown={(e) => handleKeyDown(e, folder)}
                                onDoubleClick={() => handleItemDoubleClick(folder)}
                                onContextMenu={(e) => openContextMenu(e, folder)}
                                className={`transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                                {/* Star Column */}
                                <td className="py-2.5 px-3 text-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStar(folder.id);
                                        }}
                                        className="text-gray-300 hover:text-amber-400 p-1"
                                    >
                                        <Star className={`w-4 h-4 ${folder.isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
                                    </button>
                                </td>

                                {/* Name Column */}
                                <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                                            <Folder className="w-4 h-4 fill-amber-400" />
                                        </div>
                                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 truncate max-w-[200px]" title={folder.name}>
                                            {folder.name}
                                        </span>
                                    </div>
                                </td>

                                {/* Size Column */}
                                <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">--</td>

                                {/* Type Column */}
                                <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200/60">
                                        Thư mục
                                    </span>
                                </td>

                                {/* Owner Column */}
                                <td className="py-2.5 px-3 text-gray-700 font-medium truncate max-w-[100px]">
                                    {folder.owner || 'Tôi'}
                                </td>

                                {/* Group Column */}
                                <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">
                                    {folder.group || 'users'}
                                </td>

                                {/* Permissions Column */}
                                <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                        {folder.permissions || 'rwxr-xr-x'}
                                    </span>
                                </td>

                                {/* Modified Column */}
                                <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                                    {folder.updatedAt}
                                </td>

                                {/* Created Column */}
                                <td className="py-2.5 px-3 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                                    {folder.createdAt || '2026-05-10 08:00'}
                                </td>

                                {/* Action Options */}
                                <td className="py-2.5 px-3 text-center">
                                    <button
                                        onClick={(e) => openContextMenu(e, folder)}
                                        className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                            );
                        })}

                        {/* Render Files */}
                        {sortedFiles.map((file) => {
                            const isSelected = false; // TODO: Implement selection logic (B18)
                            return (
                            <tr
                                key={file.id}
                                tabIndex={0}
                                onKeyDown={(e) => handleKeyDown(e, file)}
                                onDoubleClick={() => handleItemDoubleClick(file)}
                                onContextMenu={(e) => openContextMenu(e, file)}
                                className={`transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                                {/* Star Column */}
                                <td className="py-2.5 px-3 text-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStar(file.id);
                                        }}
                                        className="text-gray-300 hover:text-amber-400 p-1"
                                    >
                                        <Star className={`w-4 h-4 ${file.isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
                                    </button>
                                </td>

                                {/* Name Column */}
                                <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2.5">
                                        {getFileIcon(file)}
                                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 truncate max-w-[200px]" title={file.name}>
                                            {file.name}
                                        </span>
                                    </div>
                                </td>

                                {/* Size Column */}
                                <td className="py-2.5 px-3 text-gray-700 font-mono font-medium text-[11px]">
                                    {formatBytes(file.size)}
                                </td>

                                {/* Type Column */}
                                <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-200/60 whitespace-nowrap">
                                        {getFileTypeLabel(file)}
                                    </span>
                                </td>

                                {/* Owner Column */}
                                <td className="py-2.5 px-3 text-gray-700 font-medium truncate max-w-[100px]">
                                    {file.owner || 'Tôi'}
                                </td>

                                {/* Group Column */}
                                <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">
                                    {file.group || 'users'}
                                </td>

                                {/* Permissions Column */}
                                <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                        {file.permissions || 'rw-r--r--'}
                                    </span>
                                </td>

                                {/* Modified Column */}
                                <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                                    {file.updatedAt}
                                </td>

                                {/* Created Column */}
                                <td className="py-2.5 px-3 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                                    {file.createdAt || '2026-07-01 09:15'}
                                </td>

                                {/* Action Options */}
                                <td className="py-2.5 px-3 text-center">
                                    <button
                                        onClick={(e) => openContextMenu(e, file)}
                                        className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 text-xs text-gray-500">
                    <div>
                        Hiển thị <span className="font-semibold text-gray-700">{((currentPage - 1) * pageSize) + 1}</span> - <span className="font-semibold text-gray-700">{Math.min(currentPage * pageSize, totalItems)}</span> trong <span className="font-semibold text-gray-700">{totalItems}</span> mục
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-2 font-medium">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Context Menu floating */}
            <ContextMenu
                isOpen={contextMenu.isOpen}
                x={contextMenu.x}
                y={contextMenu.y}
                item={contextMenu.item}
                isTrashTab={activeTab === 'trash'}
                activeTab={activeTab}
                onClose={closeContextMenu}
                onPreview={(item) => openPreview(item)}
                onDownload={async (item) => {
                    if (item.type === 'folder') {
                        alert('Đang tạo liên kết tải xuống thư mục dạng ZIP...');
                        return;
                    }
                    const url = await getDownloadUrl(item.id);
                    if (url) {
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = item.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }}
                onRename={(item) => setRenameItemTarget(item)}
                onShare={(item) => setShareItemTarget(item)}
                onGemini={(item) => setGeminiItemTarget(item)}
                onToggleStar={(item) => toggleStar(item.id)}
                onMoveToTrash={(item) => moveToTrash(item.id)}
                onRestore={(item) => restoreFromTrash(item.id)}
                onDeletePermanently={(item) => deletePermanently(item.id)}
                onShowInfo={(item, tab) => openInfoDrawer(item, tab)}
            />

            {/* Modals */}
            <RenameModal
                isOpen={!!renameItemTarget}
                item={renameItemTarget}
                onClose={() => setRenameItemTarget(null)}
                onRename={(id, newName) => renameItem(id, newName)}
            />

            <ShareModal
                isOpen={!!shareItemTarget}
                item={shareItemTarget}
                onClose={() => setShareItemTarget(null)}
            />

            <GeminiModal
                isOpen={!!geminiItemTarget}
                item={geminiItemTarget}
                onClose={() => setGeminiItemTarget(null)}
            />
        </div>
    );
}
