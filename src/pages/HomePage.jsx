import { useFiles } from '../context/FileContext';
import FileSkeleton from '../components/common/FileSkeleton';
import { getFileIcon } from '../utils/getFileIcon';
import {
    HardDrive,
    Clock,
    Users,
    ArrowRight,
    MoreVertical,
    List,
    LayoutGrid,
    Home,
    File
} from 'lucide-react';

// Compact Section Table Component (List Mode)
const SectionTable = ({ itemList, emptyMessage = "Không có mục nào", onItemClick }) => {
    if (itemList.length === 0) {
        return <p className="text-xs text-gray-400 py-3 italic">{emptyMessage}</p>;
    }

    return (
        <div className="w-full divide-y divide-gray-100 text-sm">
            {itemList.map((item) => (
                <div
                    key={item.id}
                    onClick={() => onItemClick && onItemClick(item)}
                    className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-50/80 transition-colors cursor-pointer rounded-md"
                >
                    {/* Name & Icon */}
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                        {(() => {
                            try {
                                return getFileIcon(item);
                            } catch (e) {
                                return <File className="w-4 h-4 text-gray-400 shrink-0" />;
                            }
                        })()}
                        <span className="font-medium text-gray-800 truncate hover:text-blue-600">
                            {item.name}
                        </span>
                    </div>

                    {/* Owner */}
                    <div className="text-xs text-gray-500 w-32 hidden sm:block truncate">
                        {item.owner || 'Tôi'}
                    </div>

                    {/* Updated Date */}
                    <div className="text-xs text-gray-500 w-36 hidden md:block text-right pr-4">
                        {item.updatedAt}
                    </div>

                    {/* Action */}
                    <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200/50"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

// Compact Section Grid Component (Grid Mode)
const SectionGrid = ({ itemList, emptyMessage = "Không có mục nào", onItemClick }) => {
    if (itemList.length === 0) {
        return <p className="text-xs text-gray-400 py-3 italic">{emptyMessage}</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 py-2">
            {itemList.map((item) => (
                <div
                    key={item.id}
                    onClick={() => onItemClick && onItemClick(item)}
                    className="bg-white border border-gray-200/80 rounded-xl p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group h-32"
                >
                    <div className="flex items-center justify-between">
                        {(() => {
                            try {
                                return getFileIcon(item);
                            } catch (e) {
                                return <File className="w-4 h-4 text-gray-400 shrink-0" />;
                            }
                        })()}
                        <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-blue-600">
                            {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                            {item.owner || 'Tôi'} • {item.updatedAt ? item.updatedAt.split(',')[0] : ''}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function HomePage() {
    const { items, setActiveTab, isLoading, viewMode, setViewMode, openPreview, openFolder } = useFiles();

    const handleItemClick = (item) => {
        if (item.type === 'folder') {
            setActiveTab('my-drive');
            openFolder(item);
        } else {
            openPreview(item);
        }
    };

    // 1. Mục của tôi (My Drive) - Top 5-6
    const myDriveItems = items
        .filter(item => !item.isTrash && !item.isSpam && !item.isSharedDrive && !item.isSharedWithMe)
        .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
        .slice(0, 6);

    // 2. Đã mở gần đây (Recent) - Top 5-6
    const recentItems = items
        .filter(item => !item.isTrash && !item.isSpam)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 6);

    // 3. Được chia sẻ với tôi (Shared with me) - Top 5-6
    const sharedItems = items
        .filter(item => !item.isTrash && !item.isSpam && item.isSharedWithMe)
        .slice(0, 6);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-6 bg-gray-200 rounded w-48 mb-3 animate-pulse" />
                    <FileSkeleton type="home-section" />
                </div>
                <div>
                    <div className="h-6 bg-gray-200 rounded w-48 mb-3 animate-pulse" />
                    <FileSkeleton type="home-section" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-7 overflow-y-auto pr-1">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Home className="w-6 h-6 text-blue-600" />
                    <h1 className="text-xl font-bold text-gray-800">Trang chủ</h1>
                </div>

                <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                    <button
                        onClick={() => setViewMode('list')}
                        title="Xem dạng danh sách"
                        className={`p-1.5 rounded-full transition-colors ${viewMode === 'list'
                                ? 'bg-white shadow-xs text-blue-600 font-medium'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        title="Xem dạng lưới"
                        className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid'
                                ? 'bg-white shadow-xs text-blue-600 font-medium'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* SECTION 1: MY DRIVE */}
            <section className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-blue-600" />
                        <h2 className="text-base font-semibold text-gray-900">Driver riêng của tôi</h2>
                        <span className="text-xs text-gray-400 font-normal">({myDriveItems.length} mục hay mở nhất)</span>
                    </div>
                    <button
                        onClick={() => setActiveTab('my-drive')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-all"
                    >
                        Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
                {viewMode === 'grid' ? (
                    <SectionGrid itemList={myDriveItems} emptyMessage="Chưa có tệp nào trong Driver riêng của tôi." onItemClick={handleItemClick} />
                ) : (
                    <SectionTable itemList={myDriveItems} emptyMessage="Chưa có tệp nào trong Driver riêng của tôi." onItemClick={handleItemClick} />
                )}
            </section>

            {/* SECTION 2: RECENT */}
            <section className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <h2 className="text-base font-semibold text-gray-900">Đã mở gần đây</h2>
                        <span className="text-xs text-gray-400 font-normal">(Chỉnh sửa gần đây)</span>
                    </div>
                    <button
                        onClick={() => setActiveTab('recent')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-all"
                    >
                        Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
                {viewMode === 'grid' ? (
                    <SectionGrid itemList={recentItems} emptyMessage="Chưa có tệp nào mở gần đây." onItemClick={handleItemClick} />
                ) : (
                    <SectionTable itemList={recentItems} emptyMessage="Chưa có tệp nào mở gần đây." onItemClick={handleItemClick} />
                )}
            </section>

            {/* SECTION 3: SHARED WITH ME */}
            <section className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-base font-semibold text-gray-900">Được chia sẻ với tôi</h2>
                        <span className="text-xs text-gray-400 font-normal">({sharedItems.length} mục)</span>
                    </div>
                    <button
                        onClick={() => setActiveTab('shared-with-me')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-all"
                    >
                        Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
                {viewMode === 'grid' ? (
                    <SectionGrid itemList={sharedItems} emptyMessage="Chưa có tệp nào được chia sẻ với bạn." onItemClick={handleItemClick} />
                ) : (
                    <SectionTable itemList={sharedItems} emptyMessage="Chưa có tệp nào được chia sẻ với bạn." onItemClick={handleItemClick} />
                )}
            </section>
        </div>
    );
}
