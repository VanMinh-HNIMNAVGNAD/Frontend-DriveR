import { useFiles } from '../context/FileContext';
import FileListView from '../components/file-manager/FileListView';
import FileGridView from '../components/file-manager/FileGridView';
import { FolderGit2, List, LayoutGrid } from 'lucide-react';

export default function SharedDrivesPage() {
    const { viewMode, setViewMode } = useFiles();

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <FolderGit2 className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-xl font-bold text-gray-800">Driver đã chia sẻ (Bộ nhớ dùng chung)</h1>
                </div>

                {/* View Switcher */}
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

