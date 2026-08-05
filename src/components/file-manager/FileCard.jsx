import { useState, useEffect } from 'react';
import { storageApi } from '../../services/api';
import { 
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
    Eye 
} from 'lucide-react';

const fileTypeStyles = {
    pdf: {
        bg: 'bg-rose-50 hover:bg-rose-100 border-rose-200',
        badgeBg: 'bg-rose-100 text-rose-700',
        icon: <FileText className="w-5 h-5 text-rose-500 shrink-0" />,
        previewBg: 'bg-rose-500/10 text-rose-600',
        label: 'PDF Document'
    },
    sheet: {
        bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-700',
        icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />,
        previewBg: 'bg-emerald-500/10 text-emerald-700',
        label: 'Spreadsheet'
    },
    image: {
        bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
        badgeBg: 'bg-purple-100 text-purple-700',
        icon: <ImageIcon className="w-5 h-5 text-purple-600 shrink-0" />,
        previewBg: 'bg-purple-500/10 text-purple-700',
        label: 'Image'
    },
    video: {
        bg: 'bg-violet-50 hover:bg-violet-100 border-violet-200',
        badgeBg: 'bg-violet-100 text-violet-700',
        icon: <Video className="w-5 h-5 text-violet-600 shrink-0" />,
        previewBg: 'bg-violet-500/10 text-violet-700',
        label: 'Video Clip'
    },
    audio: {
        bg: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
        badgeBg: 'bg-pink-100 text-pink-700',
        icon: <Music className="w-5 h-5 text-pink-600 shrink-0" />,
        previewBg: 'bg-pink-500/10 text-pink-700',
        label: 'Audio File'
    },
    database: {
        bg: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200',
        badgeBg: 'bg-cyan-100 text-cyan-700',
        icon: <Database className="w-5 h-5 text-cyan-600 shrink-0" />,
        previewBg: 'bg-cyan-500/10 text-cyan-700',
        label: 'Database SQL'
    },
    figma: {
        bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
        badgeBg: 'bg-purple-100 text-purple-700',
        icon: <Layers className="w-5 h-5 text-purple-600 shrink-0" />,
        previewBg: 'bg-purple-500/10 text-purple-700',
        label: 'Figma Design'
    },
    doc: {
        bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
        badgeBg: 'bg-blue-100 text-blue-700',
        icon: <FileText className="w-5 h-5 text-blue-600 shrink-0" />,
        previewBg: 'bg-blue-500/10 text-blue-700',
        label: 'Document'
    },
    archive: {
        bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
        badgeBg: 'bg-amber-100 text-amber-700',
        icon: <FileArchive className="w-5 h-5 text-amber-600 shrink-0" />,
        previewBg: 'bg-amber-500/10 text-amber-700',
        label: 'Archive'
    },
    code: {
        bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
        badgeBg: 'bg-amber-100 text-amber-700',
        icon: <FileCode className="w-5 h-5 text-amber-600 shrink-0" />,
        previewBg: 'bg-amber-500/10 text-amber-700',
        label: 'Source Code'
    },
    default: {
        bg: 'bg-slate-50 hover:bg-slate-100 border-slate-200',
        badgeBg: 'bg-slate-100 text-slate-700',
        icon: <File className="w-5 h-5 text-slate-500 shrink-0" />,
        previewBg: 'bg-slate-500/10 text-slate-700',
        label: 'File'
    }
};

function getFileTypeCategory(name = '') {
    const n = name.toLowerCase();
    if (n.endsWith('.pdf')) return 'pdf';
    if (n.endsWith('.xlsx') || n.endsWith('.csv')) return 'sheet';
    if (n.endsWith('.png') || n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.svg') || n.endsWith('.webp') || n.endsWith('.gif')) return 'image';
    if (n.endsWith('.mp4') || n.endsWith('.mkv') || n.endsWith('.mov')) return 'video';
    if (n.endsWith('.mp3') || n.endsWith('.wav') || n.endsWith('.flac')) return 'audio';
    if (n.endsWith('.sql') || n.endsWith('.db') || n.endsWith('.sqlite')) return 'database';
    if (n.endsWith('.fig')) return 'figma';
    if (n.endsWith('.docx') || n.endsWith('.doc') || n.endsWith('.txt') || n.endsWith('.pptx') || n.endsWith('.md')) return 'doc';
    if (n.endsWith('.zip') || n.endsWith('.rar') || n.endsWith('.7z')) return 'archive';
    if (n.endsWith('.exe') || n.endsWith('.js') || n.endsWith('.jsx') || n.endsWith('.ts') || n.endsWith('.py')) return 'code';
    return 'default';
}

function formatBytes(bytes) {
    if (!bytes) return '--';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function FileCard({ file, onDoubleClick, onContextMenu, onStarToggle, onOpenInfo }) {
    const cat = getFileTypeCategory(file?.name);
    const style = fileTypeStyles[cat] || fileTypeStyles.default;
    const [thumbUrl, setThumbUrl] = useState(null);
    const isSelected = false; // TODO: Implement selection logic (B18)

    useEffect(() => {
        if (cat === 'image' && file?.id) {
            let isMounted = true;
            storageApi.getPreviewUrl(file.id)
                .then(res => {
                    if (isMounted && res?.previewUrl) setThumbUrl(res.previewUrl);
                })
                .catch(() => {});
            return () => { isMounted = false; };
        }
    }, [cat, file?.id]);

    return (
        <div
            onDoubleClick={() => onDoubleClick && onDoubleClick(file)}
            onContextMenu={(e) => onContextMenu && onContextMenu(e, file)}
            className={`group relative flex flex-col justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md hover:-translate-y-0.5 h-52 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : style.bg}`}
        >
            {/* Header: Title & Actions */}
            <div className="flex items-start justify-between gap-2 z-10">
                <div className="flex items-center gap-2 min-w-0">
                    {style.icon}
                    <span className="text-sm font-semibold text-gray-900 truncate" title={file.name}>
                        {file.name}
                    </span>
                </div>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onStarToggle && onStarToggle(file.id);
                        }}
                        className="p-1 text-gray-400 hover:text-amber-500 rounded-full hover:bg-white/60 transition-colors"
                        title={file.isStarred ? 'Bỏ đánh dấu sao' : 'Đánh dấu sao'}
                    >
                        <Star className={`w-4 h-4 ${file.isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                    <button
                        onClick={(e) => onContextMenu && onContextMenu(e, file)}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-white/60 transition-colors"
                        title="Tùy chọn tệp"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Thumbnail Preview Mock */}
            <div className="flex-1 my-2.5 rounded-xl bg-white/90 border border-gray-100/80 flex flex-col items-center justify-center p-3 text-center overflow-hidden relative group-hover:border-blue-200 transition-colors">
                {cat === 'image' ? (
                    <div className="w-full h-full flex items-center justify-center bg-purple-50/50 rounded-lg overflow-hidden relative">
                        {thumbUrl ? (
                            <img
                                src={thumbUrl}
                                alt={file.name}
                                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-purple-600">
                                <ImageIcon className="w-8 h-8 mb-1 opacity-80 animate-pulse" />
                                <span className="text-[11px] font-medium opacity-75">Đang tải ảnh...</span>
                            </div>
                        )}
                    </div>
                ) : cat === 'video' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-violet-50/60 rounded-lg text-violet-600">
                        <Video className="w-8 h-8 mb-1 opacity-80" />
                        <span className="text-[11px] font-medium opacity-75">Video Player</span>
                    </div>
                ) : (
                    <div className={`w-full h-full rounded-lg flex flex-col justify-between p-2.5 ${style.previewBg}`}>
                        <div className="flex justify-between items-center text-[11px] font-mono opacity-70">
                            <span>FILE PREVIEW</span>
                            <Eye className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-1 my-auto">
                            <div className="h-1.5 bg-current opacity-20 rounded w-full"></div>
                            <div className="h-1.5 bg-current opacity-20 rounded w-4/5"></div>
                            <div className="h-1.5 bg-current opacity-20 rounded w-2/3"></div>
                        </div>
                        <div className="text-[10px] font-semibold text-right opacity-80">
                            {style.label}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer: Metadata & Size */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-200/50">
                <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${style.badgeBg}`}>
                    {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                </span>
                <span className="font-mono text-[11px] text-gray-600 font-medium">
                    {formatBytes(file.size)}
                </span>
            </div>
        </div>
    );
}