import { useState, useEffect, useRef } from 'react';
import {
    Download,
    Pencil,
    Sparkles,
    UserPlus,
    Info,
    Trash2,
    ThumbsDown,
    ChevronRight,
    Copy,
    Star,
    FolderInput,
    RotateCcw,
    Eye,
    Scissors,
    Loader2,
    ShieldOff,
    FileUp,
    FolderUp,
    FolderPlus
} from 'lucide-react';

export default function ContextMenu({
    isOpen = true,
    x,
    y,
    item,
    isTrashTab = false,
    activeTab = 'my-drive',
    onClose, 
    onPreview,
    onRename, 
    onCut,
    onCopy,
    onPaste,
    canPaste = false,
    isPasting = false,
    onShare, 
    onQuickCopyLink,
    onGemini, 
    onDownload, 
    onMoveToTrash, 
    onRestore,
    onDeletePermanently,
    onToggleStar,
    onShowInfo,
    onDismissSuggestion,
    // Menu cho vùng nền trống (right-click ngoài mọi file/folder) — không có `item`
    onUploadFile,
    onUploadFolder,
    onCreateFolder,
    isBuildingTree = false,
}) {
    const menuRef = useRef(null);

    // Reposition menu to stay inside window bounds
    const [pos, setPos] = useState({ top: y, left: x });

    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            let newTop = y;
            let newLeft = x;

            if (y + rect.height > window.innerHeight - 10) {
                newTop = Math.max(10, window.innerHeight - rect.height - 10);
            }
            if (x + rect.width > window.innerWidth - 10) {
                newLeft = Math.max(10, window.innerWidth - rect.width - 10);
            }

            setPos({ top: newTop, left: newLeft });
        }
    }, [x, y]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const hasBlankAreaActions = onUploadFile || onUploadFolder || onCreateFolder;

    // Menu vùng trống không có `item` để làm mốc ẩn/hiện, nên phải dựa vào `isOpen`
    if (!isOpen) return null;

    if (!item && !hasBlankAreaActions) return null;

    // ── Menu cho vùng nền trống: tải tệp/thư mục lên, tạo thư mục mới ──
    if (!item) {
        return (
            <div
                ref={menuRef}
                className="fixed z-50 w-60 bg-[#282a2c]/90 backdrop-blur-md text-gray-200 rounded-2xl shadow-2xl py-2 border border-gray-700/80 text-[13px] font-sans select-none animate-fade-in"
                style={{ top: pos.top, left: pos.left }}
                onClick={(e) => e.stopPropagation()}
                onContextMenu={(e) => e.preventDefault()}
            >
                <button
                    onClick={() => { onUploadFile?.(); onClose(); }}
                    className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center gap-3 text-gray-200 transition-colors"
                >
                    <FileUp className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Tải tệp lên</span>
                </button>

                <button
                    onClick={() => { onUploadFolder?.(); onClose(); }}
                    disabled={isBuildingTree}
                    className="w-full px-4 py-2 hover:bg-[#37393b] disabled:opacity-50 disabled:cursor-wait cursor-pointer flex items-center gap-3 text-gray-200 transition-colors"
                >
                    {isBuildingTree ? (
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                        <FolderUp className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>{isBuildingTree ? 'Đang xây cây thư mục...' : 'Tải thư mục lên'}</span>
                </button>

                <div className="h-px bg-gray-700/60 my-1"></div>

                <button
                    onClick={() => { onCreateFolder?.(); onClose(); }}
                    className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center gap-3 text-gray-200 transition-colors"
                >
                    <FolderPlus className="w-4 h-4 text-gray-300 shrink-0" />
                    <span>Tạo thư mục mới</span>
                </button>
            </div>
        );
    }

    const isFolder = item.type === 'folder';

    // ── RBAC: Phân quyền cho tab "Được chia sẻ với tôi" ──────────────
    const isSharedWithMeTab = activeTab === 'shared-with-me';
    const sharedRole = item.sharedRole; // 'VIEWER' | 'EDITOR' | undefined
    const isViewerOnly = isSharedWithMeTab && sharedRole === 'VIEWER';
    const isEditorInShared = isSharedWithMeTab && sharedRole === 'EDITOR';

    // Trong shared-with-me:
    // VIEWER: chỉ Preview + Download + Star + Hỏi Gemini + Thông tin
    // EDITOR: thêm Đổi tên. Không có Cắt / Thùng rác
    const canRename = !isSharedWithMeTab || isEditorInShared;
    const canCut = !isSharedWithMeTab;
    const canTrash = !isSharedWithMeTab;
    const canShare = !isSharedWithMeTab; // Chỉ owner mới chia sẻ được

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-64 bg-[#282a2c]/90 backdrop-blur-md text-gray-200 rounded-2xl shadow-2xl py-2 border border-gray-700/80 text-[13px] font-sans select-none animate-fade-in"
            style={{ top: pos.top, left: pos.left }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Header */}
            <div className="px-4 py-1.5 mb-1 border-b border-gray-700/60 text-xs font-semibold text-gray-400 truncate flex items-center gap-2">
                <span className="truncate">{item.name}</span>
                {isSharedWithMeTab && sharedRole && (
                    <span className={`ml-auto shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        sharedRole === 'EDITOR'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-sky-500/20 text-sky-400'
                    }`}>
                        {sharedRole === 'EDITOR' ? 'Chỉnh sửa' : 'Xem'}
                    </span>
                )}
            </div>

            {isTrashTab ? (
                <>
                    {/* Trash view options */}
                    <button
                        onClick={() => { onRestore?.(item); onClose(); }}
                        className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center gap-3 text-gray-200 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Khôi phục</span>
                    </button>

                    <button
                        onClick={() => { onDeletePermanently?.(item); onClose(); }}
                        className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center gap-3 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                        <Trash2 className="w-4 h-4 shrink-0" />
                        <span>Xóa vĩnh viễn</span>
                    </button>
                </>
            ) : (
                <>
                    {/* 0. Xem trước */}
                    {item.type !== 'folder' && (
                        <button
                            onClick={() => { onPreview?.(item); onClose(); }}
                            className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center gap-3 text-gray-200 transition-colors font-medium"
                        >
                            <Eye className="w-4 h-4 text-blue-400 shrink-0" />
                            <span>Xem trước</span>
                        </button>
                    )}

                    {/* 1. Tải xuống */}
                    <button
                        onClick={() => { onDownload?.(item); onClose(); }}
                        className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center gap-3 text-gray-200 transition-colors"
                    >
                        <Download className="w-4 h-4 text-gray-300 shrink-0" />
                        <span>Tải xuống</span>
                    </button>

                    {/* 2. Đổi tên — ẩn nếu VIEWER trong shared-with-me */}
                    {canRename ? (
                        <button
                            onClick={() => { onRename?.(item); onClose(); }}
                            className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center justify-between text-gray-200 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Pencil className="w-4 h-4 text-gray-300 shrink-0" />
                                <span>Đổi tên</span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">Ctrl+Alt+E</span>
                        </button>
                    ) : (
                        // Hiển thị disabled hint khi VIEWER
                        <div className="w-full px-4 py-2 flex items-center justify-between text-gray-600 cursor-not-allowed">
                            <div className="flex items-center gap-3">
                                <ShieldOff className="w-4 h-4 shrink-0" />
                                <span className="line-through text-xs">Đổi tên</span>
                            </div>
                            <span className="text-[10px] text-gray-600">Chỉ xem</span>
                        </div>
                    )}

                    {/* 2.5. Đánh dấu sao */}
                    <button
                        onClick={() => { onToggleStar?.(item); onClose(); }}
                        className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center justify-between text-gray-200 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Star className={`w-4 h-4 ${item.isStarred ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} shrink-0`} />
                            <span>{item.isStarred ? 'Bỏ khỏi mục gắn sao' : 'Thêm vào mục gắn sao'}</span>
                        </div>
                    </button>

                    {/* Separator: Clipboard Actions */}
                    <div className="h-px bg-gray-700/60 my-1"></div>

                    {/* Cắt — ẩn trong shared-with-me */}
                    {canCut && (
                        <button
                            onClick={() => { onCut?.(item); onClose(); }}
                            className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center justify-between text-gray-200 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Scissors className="w-4 h-4 text-gray-300 shrink-0" />
                                <span>Cắt</span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">Ctrl+X</span>
                        </button>
                    )}

                    {/* Sao chép */}
                    <button
                        onClick={() => { onCopy?.(item); onClose(); }}
                        className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center justify-between text-gray-200 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Copy className="w-4 h-4 text-gray-300 shrink-0" />
                            <span>Sao chép</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono">Ctrl+C</span>
                    </button>

                    {/* Dán (Chỉ hiển thị khi có item trong clipboard) */}
                    {canPaste && (
                        <button
                            disabled={isPasting}
                            onClick={() => { 
                                onPaste?.(isFolder ? item.id : undefined); 
                                onClose(); 
                            }}
                            className="w-full px-4 py-2 hover:bg-[#37393b] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-between text-blue-300 hover:text-blue-200 transition-colors font-medium"
                        >
                            <div className="flex items-center gap-3">
                                {isPasting ? (
                                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                                ) : (
                                    <FolderInput className="w-4 h-4 text-blue-400 shrink-0" />
                                )}
                                <span>{isFolder ? 'Dán vào thư mục này' : 'Dán'}</span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">Ctrl+V</span>
                        </button>
                    )}

                    {/* Separator 1 */}
                    <div className="h-px bg-gray-700/60 my-1"></div>

                    {/* 3. Hỏi Gemini */}
                    <button
                        onClick={() => { onGemini?.(item); onClose(); }}
                        className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center gap-3 text-gray-100 font-medium transition-colors"
                    >
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
                        <span>Hỏi Gemini</span>
                    </button>

                    {/* Separator 2 */}
                    <div className="h-px bg-gray-700/60 my-1"></div>

                    {/* 4. Chia sẻ — chỉ hiển thị khi là owner */}
                    {canShare && (
                        <button
                            onClick={() => { onShare?.(item); onClose(); }}
                            className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center justify-between text-gray-200 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <UserPlus className="w-4 h-4 text-gray-300 shrink-0" />
                                <span>Chia sẻ</span>
                            </div>
                        </button>
                    )}

                    {/* 6. Thông tin chi tiết & hoạt động */}
                    <button
                        onClick={() => { onShowInfo?.(item, 'details'); onClose(); }}
                        className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center gap-3 text-gray-200 transition-colors"
                    >
                        <Info className="w-4 h-4 text-gray-300 shrink-0" />
                        <span>Xem chi tiết & hoạt động</span>
                    </button>

                    {/* Separator 3 */}
                    <div className="h-px bg-gray-700/60 my-1"></div>

                    {/* 7. Chuyển vào thùng rác — ẩn trong shared-with-me */}
                    {canTrash ? (
                        <button
                            onClick={() => { onMoveToTrash?.(item); onClose(); }}
                            className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center justify-between text-gray-200 hover:text-rose-300 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 className="w-4 h-4 text-gray-300 shrink-0" />
                                <span>Chuyển vào thùng rác</span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">Delete</span>
                        </button>
                    ) : (
                        // Hiển thị disabled hint khi trong shared-with-me
                        <div className="w-full px-4 py-2 flex items-center justify-between text-gray-600 cursor-not-allowed">
                            <div className="flex items-center gap-3">
                                <ShieldOff className="w-4 h-4 shrink-0" />
                                <span className="line-through text-xs">Chuyển vào thùng rác</span>
                            </div>
                            <span className="text-[10px] text-gray-600">Chỉ xem</span>
                        </div>
                    )}

                    {/* 8. Không phải mục đề xuất hữu ích */}
                    {activeTab === 'home' && (
                        <button
                            onClick={() => { onDismissSuggestion?.(item); onClose(); }}
                            className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center gap-3 text-gray-300 hover:text-gray-100 transition-colors"
                        >
                            <ThumbsDown className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>Không phải mục đề xuất hữu ích</span>
                        </button>
                    )}
                </>
            )}
        </div>
    );
}