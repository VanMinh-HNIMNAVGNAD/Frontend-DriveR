import { useState, useRef, useCallback } from 'react';
import { useFiles } from '../context/FileContext';
import { useUpload } from '../context/UploadContext';
import FileListView from '../components/file-manager/FileListView';
import FileGridView from '../components/file-manager/FileGridView';
import FileFilterBar from '../components/common/FileFilterBar';
import UploadProgress from '../components/file-manager/UploadProgress';
import Breadcrumb from '../components/file-manager/Breadcrumb';
import { List, LayoutGrid, ChevronRight, UploadCloud, FolderInput, Loader2 } from 'lucide-react';

export default function MyDrivePage() {
  const {
    viewMode,
    setViewMode,
    currentFolderId,
    setCurrentFolderId,
    items,
    filterType,
    setFilterType,
    filterDate,
    setFilterDate,
    filterOwner,
    setFilterOwner,
    resetFilters,
    uploadFile,
    uploadQueue,
    retryUploadJob,
    breadcrumb,
    openFolder,
    clipboard,
    isPasting,
    pasteItems,
  } = useFiles();

  // Subscribe trực tiếp vào UploadContext để lấy removeJob (stable callback, không tạo inline)
  const { removeJob } = useUpload();

  // Stable callbacks — không phá memo của UploadProgress/FileJobRow
  const handleDismissError = useCallback((id) => removeJob(id), [removeJob]);
  const handleRetry = useCallback((id) => retryUploadJob(id), [retryUploadJob]);



  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const currentFolder = items.find((i) => i.id === currentFolderId);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach((file) => {
        uploadFile(file);
      });
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      selectedFiles.forEach((file) => {
        uploadFile(file);
      });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-full relative"
    >
      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />

      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-600/10 border-4 border-dashed border-blue-500 rounded-3xl z-40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center pointer-events-none animate-pulse">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-blue-600">Thả tệp vào đây để tải lên ngay!</h3>
          <p className="text-xs text-blue-500 mt-1">Tệp sẽ được tải lên Cloud storage an toàn</p>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <Breadcrumb path={breadcrumb} onNavigate={(id) => openFolder({ id })} />
        </div>

        {/* Action Buttons & View Switcher */}
        <div className="flex items-center gap-2">
          {clipboard?.items?.length > 0 && (
            <button
              disabled={isPasting}
              onClick={() => pasteItems()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title={`Dán ${clipboard.items.length} mục vào thư mục này (Ctrl+V)`}
            >
              {isPasting ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <FolderInput className="w-4 h-4 text-blue-600" />
              )}
              <span>Dán ({clipboard.items.length})</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Tải tệp lên</span>
          </button>

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
      </div>

      {/* Quick Filters Bar */}
      <FileFilterBar
        filterType={filterType}
        setFilterType={setFilterType}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        filterOwner={filterOwner}
        setFilterOwner={setFilterOwner}
        onReset={resetFilters}
      />

      {/* View Container (List or Grid) */}
      <div className="flex-1 overflow-y-auto mt-2">
        {viewMode === 'grid' ? <FileGridView /> : <FileListView />}
      </div>

      {/* Upload Progress — floating bottom-right, multi-file */}
      <UploadProgress
        queue={uploadQueue}
        onDismissError={handleDismissError}
        onRetry={handleRetry}
      />
    </div>
  );
}