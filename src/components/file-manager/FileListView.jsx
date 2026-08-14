import { useState, useEffect } from 'react';
import { useFiles } from '../../context/FileContext';
import { storageApi } from '../../services/api';
import { formatBytes } from '../../utils/formatFileSize';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
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
    Users,
    CheckSquare,
    Square,
    Minus
} from 'lucide-react';

// ── Mini thumbnail helpers ──────────────────────────────────────
const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024; // 10MB

function getFileCategoryForThumb(name = '') {
    const n = name.toLowerCase();
    if (n.endsWith('.pdf')) return 'pdf';
    if (n.endsWith('.xlsx') || n.endsWith('.csv')) return 'sheet';
    if (n.endsWith('.png') || n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.svg') || n.endsWith('.webp') || n.endsWith('.gif')) return 'image';
    if (n.endsWith('.mp4') || n.endsWith('.mkv') || n.endsWith('.mov')) return 'video';
    if (n.endsWith('.docx') || n.endsWith('.doc')) return 'docx';
    if (n.endsWith('.txt') || n.endsWith('.md')) return 'textdoc';
    // Code + JSON + YAML + XML + shell + ...
    if (
        n.endsWith('.js') || n.endsWith('.jsx') || n.endsWith('.ts') || n.endsWith('.tsx') ||
        n.endsWith('.py') || n.endsWith('.java') || n.endsWith('.c') || n.endsWith('.cpp') ||
        n.endsWith('.cs') || n.endsWith('.go') || n.endsWith('.rb') || n.endsWith('.php') ||
        n.endsWith('.sh') || n.endsWith('.bash') || n.endsWith('.zsh') ||
        n.endsWith('.json') || n.endsWith('.xml') || n.endsWith('.yaml') || n.endsWith('.yml') ||
        n.endsWith('.toml') || n.endsWith('.ini') || n.endsWith('.env') ||
        n.endsWith('.css') || n.endsWith('.scss') || n.endsWith('.html') || n.endsWith('.htm') ||
        n.endsWith('.vue') || n.endsWith('.svelte') || n.endsWith('.kt') || n.endsWith('.swift') ||
        n.endsWith('.rs') || n.endsWith('.dart') || n.endsWith('.lua') || n.endsWith('.sql') ||
        n.endsWith('.exe')
    ) return 'code';
    return 'none';
}

/**
 * FileRowThumb – mini thumbnail (40×28px) trong list view.
 * Component riêng để dùng hooks hợp lệ.
 */
function FileRowThumb({ file }) {
    const cat = getFileCategoryForThumb(file?.name);
    // thumbType: 'image'|'video'|'pdf-blob'|'sheet'|'text'|null
    const [thumbType, setThumbType] = useState(null);
    const [thumbUrl, setThumbUrl] = useState(null);
    const [textContent, setTextContent] = useState(null);
    const [sheetData, setSheetData] = useState(null);

    useEffect(() => {
        if (!file?.id || cat === 'none') return;
        const sizeOk = !file.size || file.size <= MAX_THUMBNAIL_SIZE;
        if (!sizeOk) return; // quá lớn → fallback icon ngay

        let isMounted = true;
        let blobUrlToRevoke = null;

        const n = file.name.toLowerCase();

        if (cat === 'image' || cat === 'video') {
            storageApi.getPreviewUrl(file.id)
                .then(res => {
                    if (isMounted && res?.previewUrl) {
                        setThumbUrl(res.previewUrl);
                        setThumbType(cat);
                    }
                }).catch(() => {});

        } else if (cat === 'pdf') {
            (async () => {
                try {
                    const res = await storageApi.getPreviewUrl(file.id);
                    if (!res?.previewUrl || !isMounted) return;
                    const response = await fetch(res.previewUrl);
                    if (!response.ok || !isMounted) return;
                    const buffer = await response.arrayBuffer();
                    if (!isMounted) return;
                    const blob = new Blob([buffer], { type: 'application/pdf' });
                    blobUrlToRevoke = URL.createObjectURL(blob);
                    setThumbUrl(blobUrlToRevoke);
                    setThumbType('pdf-blob');
                } catch { /* fallback icon */ }
            })();

        } else if (cat === 'sheet') {
            (async () => {
                try {
                    const res = await storageApi.getPreviewUrl(file.id);
                    if (!res?.previewUrl || !isMounted) return;
                    const response = await fetch(res.previewUrl);
                    if (!response.ok || !isMounted) return;
                    const buffer = await response.arrayBuffer();
                    if (!isMounted) return;
                    const wb = XLSX.read(buffer, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                    if (isMounted && rows.length > 0) {
                        setSheetData(rows.slice(0, 3));
                        setThumbType('sheet');
                    }
                } catch { /* fallback icon */ }
            })();

        } else if (cat === 'docx') {
            (async () => {
                try {
                    const res = await storageApi.getPreviewUrl(file.id);
                    if (!res?.previewUrl || !isMounted) return;
                    const response = await fetch(res.previewUrl);
                    if (!response.ok || !isMounted) return;
                    const buffer = await response.arrayBuffer();
                    if (!isMounted) return;
                    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
                    if (isMounted && result?.value?.trim()) {
                        setTextContent(result.value.slice(0, 80));
                        setThumbType('text');
                    }
                } catch { /* fallback icon */ }
            })();

        } else if (cat === 'textdoc' || cat === 'code') {
            storageApi.getFileTextContent(file.id)
                .then(res => {
                    if (isMounted && res?.content) {
                        setTextContent(res.content.slice(0, 80));
                        setThumbType('text');
                    }
                }).catch(() => {});
        }

        return () => {
            isMounted = false;
            if (blobUrlToRevoke) URL.revokeObjectURL(blobUrlToRevoke);
        };
    }, [cat, file?.id, file?.size]);

    if (!thumbType) return null;

    return (
        <div className="w-10 h-7 rounded overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200/60" style={{ minWidth: '2.5rem' }}>
            {thumbType === 'image' && thumbUrl ? (
                <img src={thumbUrl} alt={file.name} className="w-full h-full object-cover" />

            ) : thumbType === 'video' && thumbUrl ? (
                <video
                    src={thumbUrl} muted preload="metadata"
                    className="w-full h-full object-cover pointer-events-none"
                    onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
                />

            ) : thumbType === 'pdf-blob' && thumbUrl ? (
                <iframe
                    src={`${thumbUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`}
                    title={file.name}
                    className="pointer-events-none border-0"
                    style={{ width: '200%', height: '200%', transform: 'scale(0.5)', transformOrigin: 'top left' }}
                />

            ) : thumbType === 'sheet' && sheetData ? (
                <div className="w-full h-full bg-emerald-50 p-px overflow-hidden">
                    <table className="w-full border-collapse" style={{ fontSize: '5px', lineHeight: 1.2 }}>
                        <tbody>
                            {sheetData.map((row, ri) => (
                                <tr key={ri} className={ri === 0 ? 'bg-emerald-100 font-bold' : ''}>
                                    {Array.from({ length: Math.min(row.length, 4) }).map((_, ci) => (
                                        <td key={ci} className="border border-emerald-200/40 px-px truncate text-emerald-900 opacity-70">
                                            {String(row[ci] ?? '').slice(0, 6)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            ) : thumbType === 'text' && textContent ? (
                <div className="w-full h-full bg-gray-50 p-0.5 overflow-hidden">
                    <pre className="text-[6px] font-mono leading-tight opacity-50 whitespace-pre-wrap break-all text-gray-700" style={{ overflow: 'hidden', maxHeight: '100%' }}>
                        {textContent}
                    </pre>
                </div>

            ) : null}
        </div>
    );
}
// ──────────────────────────────────────────────────────────────────

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
        setSortDirection,
        // Selection
        selectedIds,
        selectedCount,
        isSelected,
        toggleSelect,
        selectRange,
        selectAll,
        deselectAll,
        // Clipboard
        clipboard,
        isPasting,
        cutItems,
        copyItems,
        pasteItems,
    } = useFiles();

    // Context menu state
    const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, item: null });

    // Modals state
    const [renameItemTarget, setRenameItemTarget] = useState(null);
    const [shareItemTarget, setShareItemTarget] = useState(null);
    const [geminiItemTarget, setGeminiItemTarget] = useState(null);

    // ── Selection Helpers ──
    const allCurrentCount = (folders?.length || 0) + (files?.length || 0);
    const allSelected = allCurrentCount > 0 && selectedCount >= allCurrentCount;
    const someSelected = selectedCount > 0 && !allSelected;

    // Row click: no selection here.
    // Selection is handled exclusively by the checkbox column.

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
                            {/* Checkbox Header */}
                            <th className="py-3 px-3 w-8 text-center">
                                <button
                                    onClick={() => allSelected ? deselectAll() : selectAll(folders, files)}
                                    className="flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors"
                                    title={allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                >
                                    {allSelected ? (
                                        <CheckSquare className="w-4 h-4 text-blue-600" />
                                    ) : someSelected ? (
                                        <Minus className="w-4 h-4 text-blue-500" />
                                    ) : (
                                        <Square className="w-4 h-4" />
                                    )}
                                </button>
                            </th>
                            
                            {/* Star Header */}
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

                            {/* Type Header (Hidden on Mobile & Tablet) */}
                            <th 
                                onClick={() => handleSort('type')}
                                className="py-3 px-3 font-semibold hover:text-gray-900 cursor-pointer transition-colors hidden lg:table-cell"
                            >
                                <div className="flex items-center gap-1">
                                    <span>Type</span>
                                    {sortField === 'type' && (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                    )}
                                </div>
                            </th>

                            {/* Owner Header (Hidden on Mobile) */}
                            <th 
                                onClick={() => handleSort('owner')}
                                className="py-3 px-3 font-semibold hover:text-gray-900 cursor-pointer transition-colors hidden sm:table-cell"
                            >
                                <div className="flex items-center gap-1">
                                    <span>Owner</span>
                                    {sortField === 'owner' && (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                    )}
                                </div>
                            </th>

                            {/* Modified Header (Hidden on Mobile) */}
                            <th 
                                onClick={() => handleSort('updatedAt')}
                                className="py-3 px-3 font-semibold hover:text-gray-900 cursor-pointer transition-colors hidden sm:table-cell"
                            >
                                <div className="flex items-center gap-1">
                                    <span>Modified</span>
                                    {sortField === 'updatedAt' && (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                                    )}
                                </div>
                            </th>

                            {/* Actions Header */}
                            <th className="py-3 px-3 w-10 text-center"></th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 text-xs">
                        {/* Render Folders */}
                        {sortedFolders.map((folder) => {
                            const itemSelected = isSelected(folder.id);
                            const isCut = clipboard.mode === 'cut' && clipboard.items.some((e) => e.id === folder.id);
                            return (
                            <tr
                                key={folder.id}
                                tabIndex={0}
                                onKeyDown={(e) => handleKeyDown(e, folder)}
                                onDoubleClick={() => handleItemDoubleClick(folder)}
                                onContextMenu={(e) => openContextMenu(e, folder)}
                                className={`transition-colors group cursor-pointer ${
                                    isCut ? 'opacity-50 border-dashed' : ''
                                } ${
                                    itemSelected
                                        ? 'bg-blue-50 ring-1 ring-inset ring-blue-200'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                {/* Checkbox Column – only this triggers selection */}
                                <td
                                    className="py-2.5 px-3 text-center"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (e.shiftKey) {
                                            e.preventDefault();
                                            selectRange(folder.id, folders, files);
                                        } else {
                                            toggleSelect(folder.id);
                                        }
                                    }}
                                >
                                    <button className="flex items-center justify-center text-gray-300 hover:text-blue-600 transition-colors">
                                        {itemSelected
                                            ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                            : <Square className="w-4 h-4" />}
                                    </button>
                                </td>

                                {/* Star Column – moved after checkbox */}
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
                                <td className="py-2.5 px-3 hidden lg:table-cell">
                                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200/60">
                                        Thư mục
                                    </span>
                                </td>

                                {/* Owner Column */}
                                <td className="py-2.5 px-3 text-gray-700 font-medium truncate max-w-[100px] hidden sm:table-cell">
                                    {folder.owner || 'Tôi'}
                                </td>

                                {/* Modified Column */}
                                <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap hidden sm:table-cell">
                                    {folder.updatedAt}
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
                            const itemSelected = isSelected(file.id);
                            const isCut = clipboard.mode === 'cut' && clipboard.items.some((e) => e.id === file.id);
                            return (
                            <tr
                                key={file.id}
                                tabIndex={0}
                                onKeyDown={(e) => handleKeyDown(e, file)}
                                onDoubleClick={() => handleItemDoubleClick(file)}
                                onContextMenu={(e) => openContextMenu(e, file)}
                                className={`transition-colors group cursor-pointer ${
                                    isCut ? 'opacity-50 border-dashed' : ''
                                } ${
                                    itemSelected
                                        ? 'bg-blue-50 ring-1 ring-inset ring-blue-200'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                {/* Checkbox Column – only this triggers selection */}
                                <td
                                    className="py-2.5 px-3 text-center"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (e.shiftKey) {
                                            e.preventDefault();
                                            selectRange(file.id, folders, files);
                                        } else {
                                            toggleSelect(file.id);
                                        }
                                    }}
                                >
                                    <button className="flex items-center justify-center text-gray-300 hover:text-blue-600 transition-colors">
                                        {itemSelected
                                            ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                            : <Square className="w-4 h-4" />}
                                    </button>
                                </td>

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
                                    <div className="flex items-center gap-2">
                                        {getFileIcon(file)}
                                        <FileRowThumb file={file} />
                                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 truncate max-w-[180px]" title={file.name}>
                                            {file.name}
                                        </span>
                                    </div>
                                </td>

                                {/* Size Column */}
                                <td className="py-2.5 px-3 text-gray-700 font-mono font-medium text-[11px]">
                                    {formatBytes(file.size)}
                                </td>

                                {/* Type Column */}
                                <td className="py-2.5 px-3 hidden lg:table-cell">
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-200/60 whitespace-nowrap">
                                        {getFileTypeLabel(file)}
                                    </span>
                                </td>

                                {/* Owner Column */}
                                <td className="py-2.5 px-3 text-gray-700 font-medium truncate max-w-[100px] hidden sm:table-cell">
                                    {file.owner || 'Tôi'}
                                </td>

                                {/* Modified Column */}
                                <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap hidden sm:table-cell">
                                    {file.updatedAt}
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
                onCut={(targetItem) => {
                    if (selectedIds.has(targetItem.id) && selectedIds.size > 1) {
                        cutItems(Array.from(selectedIds));
                    } else {
                        cutItems([targetItem.id]);
                    }
                }}
                onCopy={(targetItem) => {
                    if (selectedIds.has(targetItem.id) && selectedIds.size > 1) {
                        copyItems(Array.from(selectedIds));
                    } else {
                        copyItems([targetItem.id]);
                    }
                }}
                onPaste={(targetParentId) => pasteItems(targetParentId)}
                canPaste={clipboard.items.length > 0}
                isPasting={isPasting}
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
