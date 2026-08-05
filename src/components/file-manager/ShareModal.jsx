import { useState, useEffect } from 'react';
import { UserPlus, X, Copy, Check, Lock, Globe } from 'lucide-react';
import { sharingApi } from '../../services/api';

export default function ShareModal({ isOpen, item, onClose }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('editor');
    const [copied, setCopied] = useState(false);
    const [sharePassword, setSharePassword] = useState('');
    const [expireDate, setExpireDate] = useState('');
    const [allowDownload, setAllowDownload] = useState(true);
    const [previewOnly, setPreviewOnly] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose && onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            if (item?.id) {
                loadMembers();
            }
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, item]);

    const loadMembers = async () => {
        try {
            setIsLoadingMembers(true);
            const data = await sharingApi.getShareAccess(item.id);
            setMembers(data);
        } catch (err) {
            console.error('Failed to load members', err);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    if (!isOpen || !item) return null;

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        try {
            await sharingApi.addShareAccess(item.id, { email: email.trim(), role });
            setEmail('');
            loadMembers();
        } catch (err) {
            alert('Lỗi thêm người dùng: ' + (err.message || err));
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await sharingApi.removeShareAccess(item.id, userId);
            loadMembers();
        } catch (err) {
            alert('Lỗi xóa người dùng: ' + (err.message || err));
        }
    };

    const handleCopyLink = async () => {
        try {
            const res = await sharingApi.createShareLink(item.id, {
                password: sharePassword || undefined,
                expiresInDays: expireDate ? 7 : undefined,
                isDownloadAllowed: allowDownload,
                isPreviewOnly: previewOnly,
            });
            const fullShareUrl = `${window.location.origin}/share/${res.shareToken}`;
            await navigator.clipboard.writeText(fullShareUrl);
            setGeneratedUrl(fullShareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            alert('Lỗi tạo liên kết chia sẻ: ' + (err.message || err));
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in cursor-pointer"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-[#282a2c] dark:text-gray-100 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2.5 font-bold text-lg text-gray-900 dark:text-gray-100">
                        <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Chia sẻ "{item.name}"</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 text-xs text-left">
                    {/* Add people form */}
                    <form onSubmit={handleAddMember} className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Thêm người hoặc nhóm (ví dụ: email@gmail.com)..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 font-medium outline-none"
                        >
                            <option value="editor">Người chỉnh sửa</option>
                            <option value="viewer">Người xem</option>
                        </select>
                        <button
                            type="submit"
                            disabled={!email.trim()}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                        >
                            Gửi
                        </button>
                    </form>

                    {/* People with access */}
                    <div>
                        <h4 className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-[11px]">
                            Người có quyền truy cập
                        </h4>
                        <div className="flex-1 space-y-1 overflow-y-auto max-h-[300px]">
                            {isLoadingMembers ? (
                                <div className="text-center text-sm text-slate-500 py-4">Đang tải danh sách...</div>
                            ) : members.length === 0 ? (
                                <div className="text-center text-sm text-slate-500 py-4">Chưa chia sẻ với ai.</div>
                            ) : members.map((member, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {member.avatarUrl ? <img src={member.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover"/> : member.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{member.name}</p>
                                            <p className="text-xs text-slate-500">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                            {member.role === 'editor' ? 'Người chỉnh sửa' : 'Người xem'}
                                        </span>
                                        <button 
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                                            title="Xóa quyền truy cập"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Share Link Options */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                        <h4 className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px]">
                            Tùy chọn Bảo mật Liên kết Chia sẻ
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700">
                                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                                <input
                                    type="password"
                                    value={sharePassword}
                                    onChange={(e) => setSharePassword(e.target.value)}
                                    placeholder="Đặt Mật khẩu (tùy chọn)..."
                                    className="w-full bg-transparent text-gray-900 dark:text-gray-100 outline-none text-xs"
                                />
                            </div>

                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700">
                                <span className="text-gray-400 font-bold">⏳</span>
                                <input
                                    type="date"
                                    value={expireDate}
                                    onChange={(e) => setExpireDate(e.target.value)}
                                    className="w-full bg-transparent text-gray-900 dark:text-gray-100 outline-none text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={allowDownload}
                                    onChange={(e) => setAllowDownload(e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span>Cho phép tải tệp về máy</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={previewOnly}
                                    onChange={(e) => setPreviewOnly(e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span>Chỉ cho phép xem trước</span>
                            </label>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors font-medium cursor-pointer"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? 'Đã sao chép!' : 'Sao chép đường liên kết'}</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                            Xong
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
