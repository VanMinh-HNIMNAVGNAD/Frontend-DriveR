import { useEffect } from 'react';
import FileListView from '../components/file-manager/FileListView';
import FileGridView from '../components/file-manager/FileGridView';
import FileFilterBar from '../components/common/FileFilterBar';
import { useFiles } from '../context/FileContext';
import { Trash2, Info, List, LayoutGrid } from 'lucide-react';

export default function TrashPage() {
    const { 
        viewMode,
        setViewMode,
        items, 
        emptyTrash,
        setActiveTab,
        filterType, 
        setFilterType, 
        filterDate, 
        setFilterDate, 
        filterOwner, 
        setFilterOwner, 
        uniqueOwners, 
        resetFilters
    } = useFiles();
    


    const trashItems = items.filter(i => i.isTrash);

    const handleEmptyTrash = () => {
        if (confirm('Bạn có chắc chắn muốn dọn sạch thùng rác? Tất cả các tệp sẽ bị xóa vĩnh viễn.')) {
            emptyTrash();
        }
    };

    return (
        <div className="flex flex-col h-full" onContextMenu={(e) => e.preventDefault()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Trash2 className="w-6 h-6 text-gray-700" />
                    <h1 className="text-xl font-bold text-gray-800">Thùng rác</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                        <button
                            onClick={() => setViewMode('list')}
                            title="Xem dạng danh sách"
                            className={`p-1.5 rounded-full transition-colors ${
                                viewMode === 'list' ? 'bg-white shadow-xs text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            title="Xem dạng lưới"
                            className={`p-1.5 rounded-full transition-colors ${
                                viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    {trashItems.length > 0 && (
                        <button
                            onClick={handleEmptyTrash}
                            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                            <Trash2 className="w-4 h-4" />
                            Dọn sạch thùng rác
                        </button>
                    )}
                </div>
            </div>

            {/* Banner Thông báo */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 mb-2 flex items-start gap-3 text-blue-900 text-sm shadow-2xs">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold mb-0.5">Trạng thái lưu trữ Thùng rác:</p>
                    <p className="text-xs text-blue-800">
                        Các tệp trong thùng rác sẽ tự động bị xóa vĩnh viễn sau 30 ngày.
                    </p>
                </div>
            </div>

            {/* Quick Filter Bar */}
            <FileFilterBar
                filterType={filterType}
                setFilterType={setFilterType}
                filterDate={filterDate}
                setFilterDate={setFilterDate}
                filterOwner={filterOwner}
                setFilterOwner={setFilterOwner}
                uniqueOwners={uniqueOwners}
                onReset={resetFilters}
            />

            {/* List or Grid View */}
            <div className="flex-1 overflow-y-auto mt-2">
                {viewMode === 'grid' ? <FileGridView /> : <FileListView />}
            </div>
        </div>
    );
}
