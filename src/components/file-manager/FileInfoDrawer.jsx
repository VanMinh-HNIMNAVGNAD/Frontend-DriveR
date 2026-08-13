import { useState, useEffect } from 'react';
import { useFiles } from '../../context/FileContext';
import { filesApi } from '../../services/api';
import { 
    X, 
    FileText, 
    FileSpreadsheet, 
    Image as ImageIcon, 
    FileCode, 
    FileArchive, 
    File, 
    Folder, 
    User, 
    Clock, 
    HardDrive, 
    FolderTree, 
    Lock, 
    Share2, 
    Pencil, 
    Sparkles, 
    Check, 
    Activity as ActivityIcon, 
    Info as InfoIcon,
    History,
    Shield,
    Users,
    Video,
    Music,
    Database,
    Layers,
    Eye
} from 'lucide-react';

export default function FileInfoDrawer({ isOpen, item, activeTab = 'details', onClose, onOpenShare, onOpenRename }) {
    const { openPreview } = useFiles();
    const [currentTab, setCurrentTab] = useState(activeTab);
    const [description, setDescription] = useState(item?.description || '');
    const [isSavingDesc, setIsSavingDesc] = useState(false);
    const [savedDescSuccess, setSavedDescSuccess] = useState(false);
    const [versions, setVersions] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [loadingTab, setLoadingTab] = useState(false);

    useEffect(() => {
        if (!isOpen || !item) return;
        if (currentTab === 'versions' && item.type !== 'folder') {
            setLoadingTab(true);
            filesApi.getFileVersions(item.id)
                .then((data) => setVersions(data))
                .catch((err) => console.error(err))
                .finally(() => setLoadingTab(false));
        } else if (currentTab === 'activity') {
            setLoadingTab(true);
            filesApi.getActivityLogs(item.id)
                .then((data) => setActivityLogs(data || []))
                .catch((err) => console.error(err))
                .finally(() => setLoadingTab(false));
        }
    }, [isOpen, item, currentTab]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose && onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !item) return null;

    const isFolder = item.type === 'folder';

    const formatBytes = (bytes) => {
        if (!bytes) return '--';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIconLarge = () => {
        if (isFolder) return <Folder className="w-16 h-16 text-amber-500 fill-amber-500/20 stroke-1" />;
        const name = item.name.toLowerCase();
        if (name.endsWith('.pdf')) return <FileText className="w-16 h-16 text-rose-500 stroke-1" />;
        if (name.endsWith('.xlsx') || name.endsWith('.csv')) return <FileSpreadsheet className="w-16 h-16 text-emerald-600 stroke-1" />;
        if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) return <ImageIcon className="w-16 h-16 text-purple-500 stroke-1" />;
        if (name.endsWith('.docx') || name.endsWith('.txt') || name.endsWith('.md')) return <FileText className="w-16 h-16 text-blue-500 stroke-1" />;
        if (name.endsWith('.mp4') || name.endsWith('.mkv')) return <Video className="w-16 h-16 text-violet-500 stroke-1" />;
        if (name.endsWith('.mp3') || name.endsWith('.wav')) return <Music className="w-16 h-16 text-pink-500 stroke-1" />;
        if (name.endsWith('.py') || name.endsWith('.js') || name.endsWith('.jsx')) return <FileCode className="w-16 h-16 text-amber-500 stroke-1" />;
        if (name.endsWith('.sql') || name.endsWith('.db')) return <Database className="w-16 h-16 text-cyan-600 stroke-1" />;
        if (name.endsWith('.fig')) return <Layers className="w-16 h-16 text-purple-600 stroke-1" />;
        if (name.endsWith('.zip') || name.endsWith('.rar')) return <FileArchive className="w-16 h-16 text-amber-600 stroke-1" />;
        return <File className="w-16 h-16 text-gray-500 stroke-1" />;
    };

    const handleSaveDescription = () => {
        setIsSavingDesc(true);
        setTimeout(() => {
            setIsSavingDesc(false);
            setSavedDescSuccess(true);
            setTimeout(() => setSavedDescSuccess(false), 2000);
        }, 400);
    };

    return (
        <>
            {/* Transparent backdrop overlay */}
            <div 
                className="fixed inset-0 z-40 bg-black/20 animate-fade-in cursor-pointer"
                onClick={onClose}
            />
            <aside 
                className="fixed right-0 top-0 bottom-0 z-50 w-96 bg-white dark:bg-[#1e1e1e] border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col font-sans animate-slide-left text-xs text-gray-800 dark:text-gray-200 overflow-hidden cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {getFileIconLarge() && <div className="shrink-0">{getFileIconLarge()}</div>}
                    <div className="min-w-0">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate" title={item.name}>
                            {item.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-medium truncate">
                            {isFolder ? 'Thư mục' : item.mimeType || 'Tệp dữ liệu'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
                    title="Đóng"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#252728]">
                <button
                    onClick={() => setCurrentTab('details')}
                    className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                        currentTab === 'details'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#1e1e1e]'
                            : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    <InfoIcon className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                </button>

                <button
                    onClick={() => setCurrentTab('activity')}
                    className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                        currentTab === 'activity'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#1e1e1e]'
                            : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                    <ActivityIcon className="w-3.5 h-3.5" />
                    <span>Hoạt động</span>
                </button>

                {!isFolder && (
                    <button
                        onClick={() => setCurrentTab('versions')}
                        className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                            currentTab === 'versions'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#1e1e1e]'
                                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        <History className="w-3.5 h-3.5" />
                        <span>Phiên bản</span>
                    </button>
                )}
            </div>

            {/* Tab Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {currentTab === 'details' ? (
                    <>
                        {/* Access & Sharing Section */}
                        <div className="space-y-2.5">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wider text-[11px]">
                                Quyền truy cập & Nhóm
                            </h4>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#282a2c] border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                        {(item.owner || 'T').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{item.owner || 'Tôi'}</p>
                                        <p className="text-[10px] text-gray-400">Group: {item.group || 'dev-team'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {!isFolder && (
                                        <button
                                            onClick={() => { openPreview(item); onClose?.(); }}
                                            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-blue-500" /> Xem trước
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const currentItem = item;
                                            onClose?.(); 
                                            setTimeout(() => onOpenShare?.(currentItem), 50);
                                        }}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                    >
                                        <Share2 className="w-3.5 h-3.5" /> Quản lý
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* File Details Properties List */}
                        <div className="space-y-3 pt-2">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wider text-[11px] mb-3">
                                Chi tiết {isFolder ? 'thư mục' : 'tệp'}
                            </h4>

                            {/* Property item: Loại tệp */}
                            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Loại tệp</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                    {isFolder ? 'Thư mục' : item.mimeType || 'Tệp dữ liệu'}
                                </span>
                            </div>

                            {/* Property item: Kích thước */}
                            {!isFolder && (
                                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Kích thước</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                                        {formatBytes(item.size)}
                                    </span>
                                </div>
                            )}

                            {/* Property item: Vị trí */}
                            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Vị trí</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                    <FolderTree className="w-3.5 h-3.5" />
                                    {item.parentId ? 'Thư mục con' : 'Driver riêng của tôi'}
                                </span>
                            </div>

                            {/* Property item: Người sở hữu */}
                            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Owner</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                    {item.owner || 'Tôi'}
                                </span>
                            </div>

                            {/* Property item: Group */}
                            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Group</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                                    {item.group || 'users'}
                                </span>
                            </div>

                            {/* Property item: Permissions */}
                            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Permissions</span>
                                <span className="font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                    {item.permissions || (isFolder ? 'rwxr-xr-x' : 'rw-r--r--')}
                                </span>
                            </div>

                            {/* Property item: Sửa đổi lần cuối */}
                            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Sửa đổi (Modified)</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                                    {item.updatedAt || 'Vừa xong'}
                                </span>
                            </div>

                            {/* Property item: Ngày tạo (Created) */}
                            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Ngày tạo (Created)</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200 font-mono">
                                    {item.createdAt || '2026-07-01 09:15'}
                                </span>
                            </div>
                        </div>

                        {/* Description field */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wider text-[11px]">
                                    Mô tả
                                </h4>
                                {savedDescSuccess && (
                                    <span className="text-emerald-500 font-medium flex items-center gap-1 text-[11px] animate-fade-in">
                                        <Check className="w-3.5 h-3.5" /> Đã lưu
                                    </span>
                                )}
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Thêm mô tả cho mục này..."
                                rows={3}
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#282a2c] text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs leading-relaxed"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveDescription}
                                    disabled={isSavingDesc}
                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                                >
                                    {isSavingDesc ? 'Đang lưu...' : 'Lưu mô tả'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : currentTab === 'activity' ? (
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wider text-[11px]">
                            Lịch sử hoạt động gần đây
                        </h4>
                        {loadingTab ? (
                            <p className="text-xs text-gray-400">Đang tải lịch sử hoạt động...</p>
                        ) : activityLogs.length > 0 ? (
                            <div className="space-y-3">
                                {activityLogs.map((log) => (
                                    <div key={log.id} className="flex gap-3 text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                                            <ActivityIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-gray-800 dark:text-gray-200 font-semibold">
                                                {log.action?.replace('_', ' ')}
                                            </p>
                                            <p className="text-[11px] text-gray-500">{JSON.stringify(log.details || {})}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-gray-400 py-4 text-center">Chưa có lịch sử hoạt động nào</div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wider text-[11px]">
                            Lịch sử phiên bản tệp (File Versioning)
                        </h4>
                        {loadingTab ? (
                            <p className="text-xs text-gray-400">Đang nạp danh sách phiên bản...</p>
                        ) : versions ? (
                            <div className="space-y-3">
                                {/* Current Version */}
                                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-extrabold text-blue-700 dark:text-blue-400 text-xs">Phiên bản hiện tại (Mới nhất)</span>
                                        <span className="text-[10px] font-mono text-blue-600">{formatBytes(versions.currentVersion.sizeBytes)}</span>
                                    </div>
                                    <p className="text-[11px] text-blue-900 dark:text-blue-200 font-medium">{versions.currentVersion.name}</p>
                                </div>

                                {/* Past Versions */}
                                {versions.pastVersions && versions.pastVersions.length > 0 ? (
                                    versions.pastVersions.map((v) => (
                                        <div key={v.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                                                    Phiên bản v{v.versionNumber}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono">
                                                    {new Date(v.createdAt).toLocaleString('vi-VN')} • {formatBytes(v.sizeBytes)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 py-2 text-center">Chưa có phiên bản cũ nào</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 py-4 text-center">Không tìm thấy thông tin phiên bản</p>
                        )}
                    </div>
                )}
            </div>
            </aside>
        </>
    );
}
