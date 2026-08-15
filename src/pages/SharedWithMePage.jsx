import { useEffect } from 'react';
import FileListView from '../components/file-manager/FileListView';
import FileGridView from '../components/file-manager/FileGridView';
import FileFilterBar from '../components/common/FileFilterBar';
import { useFiles } from '../context/FileContext';
import { Users, List, LayoutGrid, Share2 } from 'lucide-react';

export default function SharedWithMePage() {
    const {
        viewMode,
        setViewMode,
        activeTab,
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

    // Trang này luôn active tab 'shared-with-me' — context tự detect từ route
    // Không cần gọi setActiveTab vì context derive từ location.pathname

    return (
        <div className="flex flex-col h-full">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                            Được chia sẻ với tôi
                        </h1>
                        {!isLoading && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {items.length > 0
                                    ? `${items.length} mục được chia sẻ`
                                    : 'Chưa có mục nào được chia sẻ'}
                            </p>
                        )}
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 gap-0.5">
                    <button
                        onClick={() => setViewMode('list')}
                        title="Xem dạng danh sách"
                        aria-label="List view"
                        className={`p-1.5 rounded-full transition-all ${
                            viewMode === 'list'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        title="Xem dạng lưới"
                        aria-label="Grid view"
                        className={`p-1.5 rounded-full transition-all ${
                            viewMode === 'grid'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
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
                <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Empty state when not loading and no items */}
            {!isLoading && !error && items.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
                    <div className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-800">
                        <Share2 className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                            Chưa có mục nào được chia sẻ với bạn
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Khi ai đó chia sẻ tệp hoặc thư mục với bạn, chúng sẽ xuất hiện ở đây.
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
