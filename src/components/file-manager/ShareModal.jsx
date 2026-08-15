import { useState, useEffect, useCallback } from 'react';
import { UserPlus, X, Copy, Check, Lock, Shield, Eye, Edit3, Loader2, AlertCircle } from 'lucide-react';
import { sharingApi } from '../../services/api';

const ROLE_CONFIG = {
    VIEWER: {
        label: 'Người xem',
        icon: Eye,
        color: 'text-sky-400',
        bg: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
    },
    EDITOR: {
        label: 'Người chỉnh sửa',
        icon: Edit3,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    },
};

function Avatar({ name, avatarUrl, size = 9 }) {
    const initials = name?.charAt(0)?.toUpperCase() || '?';
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className={`w-${size} h-${size} rounded-full object-cover ring-1 ring-white/10`}
            />
        );
    }
    return (
        <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-1 ring-white/10`}>
            {initials}
        </div>
    );
}

export default function ShareModal({ isOpen, item, onClose }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('VIEWER');
    const [copied, setCopied] = useState(false);
    const [sharePassword, setSharePassword] = useState('');
    const [expireDate, setExpireDate] = useState('');
    const [allowDownload, setAllowDownload] = useState(true);
    const [previewOnly, setPreviewOnly] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const loadMembers = useCallback(async () => {
        if (!item?.id) return;
        try {
            setIsLoadingMembers(true);
            const data = await sharingApi.getShareAccess(item.id);
            setMembers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load members', err);
        } finally {
            setIsLoadingMembers(false);
        }
    }, [item?.id]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose?.();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            loadMembers();
            setEmail('');
            setErrorMsg('');
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, loadMembers, onClose]);

    if (!isOpen || !item) return null;

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setErrorMsg('');
        try {
            setIsSubmitting(true);
            await sharingApi.addShareAccess(item.id, { email: email.trim(), role });
            setEmail('');
            await loadMembers();
        } catch (err) {
            setErrorMsg(err.message || 'Không tìm thấy người dùng với email này');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            setRemovingId(userId);
            await sharingApi.removeShareAccess(item.id, userId);
            await loadMembers();
        } catch (err) {
            setErrorMsg('Lỗi xóa người dùng: ' + (err.message || err));
        } finally {
            setRemovingId(null);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            // Re-use addShareAccess to upsert
            const member = members.find(m => m.id === userId);
            if (!member) return;
            await sharingApi.addShareAccess(item.id, { email: member.email, role: newRole });
            await loadMembers();
        } catch (err) {
            setErrorMsg('Lỗi cập nhật quyền: ' + (err.message || err));
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
            setErrorMsg('Lỗi tạo liên kết chia sẻ: ' + (err.message || err));
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in cursor-pointer"
            onClick={onClose}
        >
            <div
                className="bg-[#1c1e20] text-gray-100 rounded-2xl shadow-2xl w-full max-w-lg border border-white/10 overflow-hidden cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5 font-bold text-base text-white">
                        <div className="p-1.5 rounded-lg bg-blue-500/20">
                            <UserPlus className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="truncate max-w-[320px]">Chia sẻ "{item.name}"</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 space-y-5 text-sm">
                    {/* Error message */}
                    {errorMsg && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                            <button onClick={() => setErrorMsg('')} className="ml-auto text-red-400 hover:text-red-200">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Add people form */}
                    <form onSubmit={handleAddMember} className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Thêm người có quyền truy cập</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                                placeholder="Email người dùng..."
                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition"
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-medium outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                            >
                                <option value="VIEWER">Người xem</option>
                                <option value="EDITOR">Người chỉnh sửa</option>
                            </select>
                            <button
                                type="submit"
                                disabled={!email.trim() || isSubmitting}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Gửi</span>}
                            </button>
                        </div>
                    </form>

                    {/* People with access */}
                    <div>
                        <h4 className="font-semibold text-gray-400 uppercase tracking-wider mb-3 text-[11px]">
                            Người có quyền truy cập ({members.length})
                        </h4>
                        <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                            {isLoadingMembers ? (
                                <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-xs">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Đang tải danh sách...</span>
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 text-xs">
                                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p>Chưa chia sẻ với ai</p>
                                </div>
                            ) : members.map((member) => {
                                const roleInfo = ROLE_CONFIG[member.role] || ROLE_CONFIG.VIEWER;
                                const RoleIcon = roleInfo.icon;
                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar name={member.name} avatarUrl={member.avatarUrl} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-100 truncate">{member.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            {/* Role Selector */}
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleChangeRole(member.id, e.target.value)}
                                                className={`text-xs px-2 py-1 rounded-lg border cursor-pointer outline-none bg-transparent ${roleInfo.bg} hover:opacity-80 transition`}
                                                title="Thay đổi quyền"
                                            >
                                                <option value="VIEWER" className="bg-[#1c1e20] text-gray-100">Người xem</option>
                                                <option value="EDITOR" className="bg-[#1c1e20] text-gray-100">Người chỉnh sửa</option>
                                            </select>
                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                disabled={removingId === member.id}
                                                className="p-1 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                                title="Thu hồi quyền truy cập"
                                            >
                                                {removingId === member.id
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : <X className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Advanced Share Link Options */}
                    <div className="pt-4 border-t border-white/10 space-y-3">
                        <h4 className="font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
                            Tùy chọn Bảo mật Liên kết Công khai
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                                <input
                                    type="password"
                                    value={sharePassword}
                                    onChange={(e) => setSharePassword(e.target.value)}
                                    placeholder="Mật khẩu (tùy chọn)..."
                                    className="w-full bg-transparent text-gray-100 placeholder-gray-600 outline-none text-xs"
                                />
                            </div>

                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-gray-400 text-xs font-bold shrink-0">⏳</span>
                                <input
                                    type="date"
                                    value={expireDate}
                                    onChange={(e) => setExpireDate(e.target.value)}
                                    className="w-full bg-transparent text-gray-100 outline-none text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-300 text-xs">
                                <input
                                    type="checkbox"
                                    checked={allowDownload}
                                    onChange={(e) => setAllowDownload(e.target.checked)}
                                    className="rounded text-blue-500 focus:ring-blue-500 cursor-pointer accent-blue-500"
                                />
                                <span>Cho phép tải tệp về máy</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-gray-300 text-xs">
                                <input
                                    type="checkbox"
                                    checked={previewOnly}
                                    onChange={(e) => setPreviewOnly(e.target.checked)}
                                    className="rounded text-blue-500 focus:ring-blue-500 cursor-pointer accent-blue-500"
                                />
                                <span>Chỉ cho phép xem trước</span>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-colors font-medium text-sm cursor-pointer"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? 'Đã sao chép!' : 'Sao chép đường liên kết'}</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                            Xong
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
