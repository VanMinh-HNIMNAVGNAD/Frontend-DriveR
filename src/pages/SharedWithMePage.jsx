import FileListView from '../components/file-manager/FileListView';
import FileGridView from '../components/file-manager/FileGridView';
import FileFilterBar from '../components/common/FileFilterBar';
import { useFiles } from '../context/FileContext';
import { Users, List, LayoutGrid, Share2, ChevronRight } from 'lucide-react';

export default function SharedWithMePage() {
    const {
        viewMode,
        setViewMode,
        currentFolderId,
        breadcrumb,
        openFolder,
        filterType,
        setFilterType,
        filterDate,
        setFilterDate,
        filterOwner,
        setFilterOwner,
        uniqueOwners,
        resetFilters,
        items,
        isLoading,
        error,
    } = useFiles();

    return (
        <div className="flex flex-col h-full" onContextMenu={(e) => e.preventDefault()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Users className="w-6 h-6 text-blue-600 shrink-0" />
                    {currentFolderId ? (
                        <nav className="flex items-center gap-1.5 text-sm text-gray-600 font-medium overflow-x-auto py-1">
                            <button
                                onClick={() => openFolder({ id: null })}
                                className="hover:text-blue-600 transition-colors shrink-0 text-xl font-bold text-gray-800 cursor-pointer"
                            >
                                Được chia sẻ với tôi
                            </button>
                            {breadcrumb
                                .filter((b) => b.id !== null)
                                .map((item, index, arr) => (
                                    <div key={item.id || index} className="flex items-center gap-1 shrink-0">
                                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                        <button
                                            onClick={() => openFolder({ id: item.id })}
                                            className={`hover:text-blue-600 transition-colors cursor-pointer text-xl ${
                                                index === arr.length - 1
                                                    ? 'font-bold text-gray-900'
                                                    : 'text-gray-600 font-semibold'
                                            }`}
                                        >
                                            {item.name}
                                        </button>
                                    </div>
                                ))}
                        </nav>
                    ) : (
                        <h1 className="text-xl font-bold text-gray-800">Được chia sẻ với tôi</h1>
                    )}
                </div>

                {/* View Switcher */}
                <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 shrink-0">
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

            {/* Error state */}
            {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Empty state when not loading and no items */}
            {!isLoading && !error && items.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
                    <div className="p-5 rounded-2xl bg-gray-100">
                        <Share2 className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-base font-semibold text-gray-700">
                            {currentFolderId ? 'Thư mục này trống' : 'Chưa có mục nào được chia sẻ với bạn'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {currentFolderId
                                ? 'Không có tệp hoặc thư mục nào bên trong thư mục này.'
                                : 'Khi ai đó chia sẻ tệp hoặc thư mục với bạn, chúng sẽ xuất hiện ở đây.'}
                        </p>
                    </div>
                </div>
            )}

            {/* View Container */}
            {(isLoading || items.length > 0) && (
                <div className="flex-1 overflow-y-auto mt-2">
                    {viewMode === 'grid' ? <FileGridView /> : <FileListView />}
                </div>
            )}
        </div>
    );
}
