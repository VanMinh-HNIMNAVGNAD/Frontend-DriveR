import { useState } from 'react';
import {
    UploadCloud,
    CheckCircle2,
    XCircle,
    X,
    ChevronUp,
    ChevronDown,
    Loader2,
    Clock,
    RefreshCw,
} from 'lucide-react';

/**
 * UploadProgress — Hiện progress nhiều file upload song song.
 * Props:
 *   queue: Array<{ id, fileName, percent, status, error? }>
 *         status: 'pending' | 'uploading' | 'confirming' | 'done' | 'error'
 *   onDismissError: (id) => void  — xóa 1 job lỗi khỏi queue
 *   onRetry: (id) => void         — thử lại job lỗi
 */
export default function UploadProgress({ queue = [], onDismissError, onRetry }) {
    const [isMinimized, setIsMinimized] = useState(false);

    if (queue.length === 0) return null;

    // Tính tổng tiến trình
    const totalPercent = Math.round(
        queue.reduce((sum, job) => sum + (job.percent || 0), 0) / queue.length,
    );

    const activeCount = queue.filter((j) => j.status === 'uploading' || j.status === 'confirming').length;
    const doneCount = queue.filter((j) => j.status === 'done').length;
    const errorCount = queue.filter((j) => j.status === 'error').length;
    const pendingCount = queue.filter((j) => j.status === 'pending').length;
    const allDone = queue.length > 0 && queue.every((j) => j.status === 'done' || j.status === 'error');

    const headerLabel = allDone
        ? `Hoàn tất ${doneCount}/${queue.length} tệp${errorCount > 0 ? ` · ${errorCount} lỗi` : ''}`
        : `Đang tải lên ${activeCount > 0 ? `${activeCount} tệp` : ''}${pendingCount > 0 ? ` · ${pendingCount} chờ` : ''}`;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-88 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-200"
            style={{ width: '360px' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold">
                    <UploadCloud className={`w-4 h-4 text-blue-400 ${activeCount > 0 ? 'animate-bounce' : ''}`} />
                    <span>{headerLabel}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title={isMinimized ? 'Mở rộng' : 'Thu gọn'}
                    >
                        {isMinimized
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Thanh tổng tiến trình — luôn hiện ngay cả khi minimize */}
            <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400 font-medium">Tổng tiến trình</span>
                    <span className="text-[11px] font-mono font-bold text-blue-400">{totalPercent}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${totalPercent}%`,
                            background: allDone && errorCount === 0
                                ? 'linear-gradient(90deg, #10b981, #059669)'
                                : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                        }}
                    />
                </div>
            </div>

            {/* Danh sách từng file */}
            {!isMinimized && (
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                    {queue.map((job) => (
                        <FileJobRow
                            key={job.id}
                            job={job}
                            onDismiss={() => onDismissError?.(job.id)}
                            onRetry={() => onRetry?.(job.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/** Một dòng hiển thị trạng thái 1 file */
function FileJobRow({ job, onDismiss, onRetry }) {
    const { fileName, percent, status, error } = job;

    const statusIcon = () => {
        switch (status) {
            case 'done':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
            case 'error':
                return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
            case 'confirming':
                return <Loader2 className="w-4 h-4 text-indigo-400 shrink-0 animate-spin" />;
            case 'uploading':
                return <Loader2 className="w-4 h-4 text-blue-400 shrink-0 animate-spin" />;
            case 'pending':
            default:
                return <Clock className="w-4 h-4 text-gray-400 shrink-0" />;
        }
    };

    const barColor = status === 'error'
        ? 'bg-rose-500'
        : status === 'done'
            ? 'bg-emerald-500'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500';

    return (
        <div className="px-4 py-3">
            <div className="flex items-center gap-2.5">
                {statusIcon()}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                            className="text-xs font-medium text-gray-800 truncate"
                            title={fileName}
                        >
                            {fileName}
                        </span>
                        <span className="text-[11px] font-mono text-gray-500 shrink-0">
                            {status === 'done'
                                ? '✓'
                                : status === 'error'
                                    ? '✗'
                                    : status === 'confirming'
                                        ? 'Đang lưu...'
                                        : status === 'pending'
                                            ? 'Chờ...'
                                            : `${percent}%`}
                        </span>
                    </div>

                    {/* Progress bar — ẩn khi pending */}
                    {status !== 'pending' && (
                        <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                style={{ width: `${status === 'done' ? 100 : percent}%` }}
                            />
                        </div>
                    )}

                    {/* Thông báo đổi tên do trùng */}
                    {status === 'done' && job.renamedFrom && (
                        <p className="text-[10px] text-amber-600 mt-1 truncate" title={`Tên gốc: ${job.renamedFrom}`}>
                            ↪ Đã đổi tên từ "{job.renamedFrom}"
                        </p>
                    )}

                    {/* Hiện lỗi nếu có */}
                    {status === 'error' && error && (
                        <p className="text-[10px] text-rose-500 mt-1 truncate" title={error}>
                            {error}
                        </p>
                    )}
                </div>

                {/* Nút retry + dismiss khi lỗi */}
                {status === 'error' && (
                    <div className="flex items-center gap-0.5 shrink-0">
                        <button
                            onClick={onRetry}
                            className="p-0.5 hover:bg-blue-50 rounded transition-colors"
                            title="Thử lại"
                        >
                            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                        <button
                            onClick={onDismiss}
                            className="p-0.5 hover:bg-rose-50 rounded transition-colors"
                            title="Xóa thông báo lỗi"
                        >
                            <X className="w-3.5 h-3.5 text-rose-400" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
