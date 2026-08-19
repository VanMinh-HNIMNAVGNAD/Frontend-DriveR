import { useState, useEffect } from 'react';
import { useFiles } from '../context/FileContext';
import FileListView from '../components/file-manager/FileListView';
import FileGridView from '../components/file-manager/FileGridView';
import { FolderGit2, List, LayoutGrid, Plus, Users, ArrowLeft, X } from 'lucide-react';
import { sharedDrivesApi } from '../services/api';

export default function SharedDrivesPage() {
    const { 
        viewMode, 
        setViewMode, 
        currentFolderId, 
        setCurrentFolderId,
        currentSharedDriveId,
        setCurrentSharedDriveId,
    } = useFiles();
    
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state for creating new drive
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newDriveName, setNewDriveName] = useState('');
    const [newDriveDesc, setNewDriveDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!currentSharedDriveId && !currentFolderId) {
            loadDrives();
        }
    }, [currentSharedDriveId, currentFolderId]);

    const loadDrives = async () => {
        try {
            setLoading(true);
            const res = await sharedDrivesApi.getAll();
            setDrives(res || []);
        } catch (err) {
            setError(err.message || 'Lỗi khi tải danh sách bộ nhớ dùng chung');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDrive = async (e) => {
        e.preventDefault();
        if (!newDriveName.trim()) return;
        try {
            setIsCreating(true);
            await sharedDrivesApi.create({ name: newDriveName, description: newDriveDesc });
            setIsCreateModalOpen(false);
            setNewDriveName('');
            setNewDriveDesc('');
            loadDrives();
        } catch (err) {
            alert('Lỗi tạo bộ nhớ chung: ' + err.message);
        } finally {
            setIsCreating(false);
        }
    };

    // If we are inside a specific Shared Drive or folder, show the files view
    if (currentSharedDriveId || currentFolderId) {
        const currentDrive = drives.find((d) => d.id === currentSharedDriveId);
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                setCurrentFolderId(null);
                                setCurrentSharedDriveId(null);
                            }}
                            title="Quay lại danh sách"
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <FolderGit2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-800">
                                    {currentDrive?.name || 'Nội dung bộ nhớ dùng chung'}
                                </h1>
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                                    Không gian nhóm
                                </span>
                            </div>
                            {currentDrive?.description ? (
                                <p className="text-xs text-gray-500 mt-0.5">{currentDrive.description}</p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-0.5">Tài liệu lưu trữ thuộc quyền sở hữu chung của các thành viên</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                        <button
                            onClick={() => setViewMode('list')}
                            title="Xem dạng danh sách"
                            className={`p-1.5 rounded-full transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-white shadow-xs text-blue-600 font-medium'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            title="Xem dạng lưới"
                            className={`p-1.5 rounded-full transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-white shadow-xs text-blue-600 font-medium'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {viewMode === 'grid' ? <FileGridView /> : <FileListView />}
                </div>
            </div>
        );
    }

    // Default view: list of shared drives
    return (
        <div className="flex flex-col h-full overflow-y-auto pr-2 pb-12" onContextMenu={(e) => e.preventDefault()}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <FolderGit2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Bộ nhớ dùng chung</h1>
                            <span className="px-2 py-0.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100/80">
                                Không gian nhóm
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                            Không gian lưu trữ tập thể cho đội ngũ &amp; dự án — Tệp thuộc về cả nhóm thay vì một cá nhân riêng lẻ.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Tạo mới
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center justify-center">{error}</div>
            ) : drives.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 mt-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 text-indigo-600">
                        <FolderGit2 className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1.5">Chưa có bộ nhớ dùng chung nào</h3>
                    <p className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
                        Bộ nhớ dùng chung giúp phòng ban hoặc nhóm dự án của bạn lưu trữ và quản lý tài liệu tại một nơi tập trung. Tài liệu thuộc sở hữu của cả nhóm và không bị mất khi có thành viên rời đi.
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Tạo Bộ nhớ nhóm đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {drives.map(drive => (
                        <div 
                            key={drive.id}
                            onClick={() => {
                                setCurrentSharedDriveId(drive.id);
                                setCurrentFolderId(null);
                            }}
                            className="p-5 border border-gray-200 rounded-3xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <FolderGit2 className="w-6 h-6" />
                                </div>
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                                    {drive.userRole}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-[15px] mb-1.5 truncate group-hover:text-indigo-700 transition-colors">{drive.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-4 leading-relaxed">
                                {drive.description || 'Không có mô tả'}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600/80 mt-auto pt-3 border-t border-gray-50">
                                <Users className="w-3.5 h-3.5" />
                                <span className="uppercase tracking-wider">Không gian nhóm / Dự án</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-[15px] font-black text-slate-800 tracking-tight">Tạo Bộ nhớ dùng chung</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Tất cả thành viên sẽ cùng sở hữu và quản lý tài liệu của nhóm</p>
                            </div>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-colors ml-2"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateDrive} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                        Tên bộ nhớ nhóm <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newDriveName}
                                        onChange={e => setNewDriveName(e.target.value)}
                                        placeholder="Ví dụ: Phòng Marketing, Dự án Alpha..."
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:font-normal"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                                        Mô tả (Không bắt buộc)
                                    </label>
                                    <textarea
                                        value={newDriveDesc}
                                        onChange={e => setNewDriveDesc(e.target.value)}
                                        placeholder="Mô tả mục đích sử dụng hoặc phòng ban quản lý bộ nhớ này..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-medium placeholder:font-normal"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-8 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newDriveName.trim() || isCreating}
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm flex items-center gap-2"
                                >
                                    {isCreating && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Tạo mới
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
