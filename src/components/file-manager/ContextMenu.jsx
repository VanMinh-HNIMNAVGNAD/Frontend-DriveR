import { useState, useEffect, useRef } from 'react';
import { 
    Download, 
    Pencil, 
    Sparkles, 
    UserPlus, 
    FolderPlus, 
    Info, 
    Trash2, 
    ThumbsDown, 
    ChevronRight, 
    Copy, 
    Star, 
    FolderInput, 
    Activity, 
    FileText, 
    RotateCcw,
    ShieldAlert,
    Eye,
    Scissors,
    Loader2
} from 'lucide-react';

export default function ContextMenu({ 
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
    onGemini, 
    onDownload, 
    onMoveToTrash, 
    onRestore,
    onDeletePermanently,
    onToggleStar, 
    onShowInfo, 
    onDismissSuggestion 
}) {
    const [activeSubmenu, setActiveSubmenu] = useState(null); // 'share' | 'organize' | 'info' | null
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

    if (!item) return null;

    const isFolder = item.type === 'folder';

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-64 bg-[#282a2c]/90 backdrop-blur-md text-gray-200 rounded-2xl shadow-2xl py-2 border border-gray-700/80 text-[13px] font-sans select-none animate-fade-in"
            style={{ top: pos.top, left: pos.left }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Context menu title header if present */}
            <div className="px-4 py-1.5 mb-1 border-b border-gray-700/60 text-xs font-semibold text-gray-400 truncate flex items-center gap-2">
                <span className="truncate">{item.name}</span>
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

                    {/* 2. Đổi tên */}
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

                    {/* Cắt */}
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

                    {/* 4. Chia sẻ (With Submenu) */}
                    <div 
                        className="relative"
                        onMouseEnter={() => setActiveSubmenu('share')}
                        onMouseLeave={() => setActiveSubmenu(null)}
                    >
                        <button
                            onClick={() => { onShare?.(item); onClose(); }}
                            className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center justify-between text-gray-200 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <UserPlus className="w-4 h-4 text-gray-300 shrink-0" />
                                <span>Chia sẻ</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Share Submenu */}
                        {activeSubmenu === 'share' && (
                            <div className="absolute left-full top-0 ml-1 w-48 bg-[#282a2c]/90 backdrop-blur-md text-gray-200 rounded-xl shadow-xl py-1.5 border border-gray-700/80 z-50 text-[13px]">
                                <button
                                    onClick={() => { onShare?.(item); onClose(); }}
                                    className="w-full px-4 py-2 hover:bg-[#37393b] flex items-center gap-2 text-left"
                                >
                                    <UserPlus className="w-4 h-4 text-blue-400" />
                                    <span>Chia sẻ...</span>
                                </button>
                                <button
                                    onClick={() => { 
                                        navigator.clipboard.writeText(`${window.location.origin}/s/${item.id}`);
                                        alert('Đã sao chép đường liên kết!');
                                        onClose(); 
                                    }}
                                    className="w-full px-4 py-2 hover:bg-[#37393b] flex items-center gap-2 text-left"
                                >
                                    <Copy className="w-4 h-4 text-gray-300" />
                                    <span>Sao chép đường liên kết</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 6. Thông tin về thư mục / tệp (With Submenu) */}
                    <div 
                        className="relative"
                        onMouseEnter={() => setActiveSubmenu('info')}
                        onMouseLeave={() => setActiveSubmenu(null)}
                    >
                        <button
                            onClick={() => { onShowInfo?.(item, 'details'); onClose(); }}
                            className="w-full px-4 py-2 hover:bg-[#37393b] cursor-pointer flex items-center justify-between text-gray-200 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Info className="w-4 h-4 text-gray-300 shrink-0" />
                                <span>{isFolder ? 'Thông tin về thư mục' : 'Thông tin về tệp'}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Info Submenu */}
                        {activeSubmenu === 'info' && (
                            <div className="absolute left-full top-0 ml-1 w-48 bg-[#282a2c]/90 backdrop-blur-md text-gray-200 rounded-xl shadow-xl py-1.5 border border-gray-700/80 z-50 text-[13px]">
                                <button
                                    onClick={() => { onShowInfo?.(item, 'details'); onClose(); }}
                                    className="w-full px-4 py-2 hover:bg-[#37393b] flex items-center gap-2 text-left"
                                >
                                    <FileText className="w-4 h-4 text-gray-300" />
                                    <span>Chi tiết</span>
                                </button>
                                <button
                                    onClick={() => { onShowInfo?.(item, 'activity'); onClose(); }}
                                    className="w-full px-4 py-2 hover:bg-[#37393b] flex items-center gap-2 text-left"
                                >
                                    <Activity className="w-4 h-4 text-gray-300" />
                                    <span>Hoạt động</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Separator 3 */}
                    <div className="h-px bg-gray-700/60 my-1"></div>

                    {/* 7. Chuyển vào thùng rác */}
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