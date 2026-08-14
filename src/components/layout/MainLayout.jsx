import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useFiles } from '../../context/FileContext';
import Sidebar from './SideBar';
import RightSidebar from './RightSideBar';
import Header from './Header';
import FileInfoDrawer from '../file-manager/FileInfoDrawer';
import ShareModal from '../file-manager/ShareModal';
import RenameModal from '../file-manager/RenameModal';
import FilePreviewModal from '../file-manager/FilePreviewModal';

// Pages are now rendered via react-router-dom <Outlet />


export default function MainLayout() {
    const { 
        isInfoDrawerOpen, 
        infoDrawerItem, 
        infoDrawerTab, 
        closeInfoDrawer,
        renameItem,
        previewItem,
        closePreview
    } = useFiles();
    
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [shareTargetItem, setShareTargetItem] = useState(null);
    const [renameTargetItem, setRenameTargetItem] = useState(null);

    return (
        <div className="flex h-screen w-full bg-white text-gray-900 font-sans overflow-hidden relative">
            {/* Sidebar bên trái */}
            <Sidebar />

            {/* Khu vực nội dung chính */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden min-w-0 border-l border-gray-200">
                {/* Header Navbar */}
                <Header 
                    toggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
                />

                {/* Body Content */}
                <main className="flex-1 overflow-hidden px-3 sm:px-5 py-3 relative z-0">
                    <Outlet />
                </main>
            </div>

            {/* Sidebar thông tin bên phải */}
            {isRightSidebarOpen && (
                <RightSidebar isOpen={isRightSidebarOpen} />
            )}

            {/* Google Drive Info Drawer Panel */}
            <FileInfoDrawer
                isOpen={isInfoDrawerOpen}
                item={infoDrawerItem}
                activeTab={infoDrawerTab}
                onClose={closeInfoDrawer}
                onOpenShare={(item) => setShareTargetItem(item)}
                onOpenRename={(item) => setRenameTargetItem(item)}
            />

            {/* Shared Modals if opened from Info Drawer */}
            <ShareModal
                isOpen={!!shareTargetItem}
                item={shareTargetItem}
                onClose={() => setShareTargetItem(null)}
            />

            <RenameModal
                isOpen={!!renameTargetItem}
                item={renameTargetItem}
                onClose={() => setRenameTargetItem(null)}
                onRename={(id, newName) => renameItem(id, newName)}
            />

            {/* File Preview Modal */}
            {previewItem && (
                <FilePreviewModal
                    item={previewItem}
                    onClose={closePreview}
                />
            )}
        </div>
    );
}