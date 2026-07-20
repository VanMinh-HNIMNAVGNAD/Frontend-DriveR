import { createContext, useState, useContext } from 'react';

const FileContext = createContext();

// Mock data mô phỏng DB trả về
const mockData = [
    { id: 'f1', name: 'Tài liệu học tập', type: 'folder', parentId: null, updatedAt: '2026-07-16' },
    { id: 'f2', name: 'Dự án Công ty', type: 'folder', parentId: null, updatedAt: '2026-07-15' },
    { id: 'file1', name: 'Báo cáo Q3.pdf', type: 'file', mimeType: 'application/pdf', size: 1024000, parentId: null, updatedAt: '2026-07-16' },
    { id: 'f3', name: 'Toán cao cấp', type: 'folder', parentId: 'f1', updatedAt: '2026-07-10' }, // Nằm trong thư mục f1
];

export function FileProvider({ children }) {
    const [items, setItems] = useState(mockData);
    const [currentFolderId, setCurrentFolderId] = useState(null); // null = đang ở thư mục gốc

    // Lọc ra các file/folder đang nằm trong thư mục hiện tại
    const currentItems = items.filter(item => item.parentId === currentFolderId);

    const folders = currentItems.filter(item => item.type === 'folder');
    const files = currentItems.filter(item => item.type === 'file');

    return (
        <FileContext.Provider value={{
            items,
            currentFolderId,
            setCurrentFolderId,
            folders,
            files
        }}>
            {children}
        </FileContext.Provider>
    );
}

// Custom hook để dùng cho nhanh
export const useFiles = () => useContext(FileContext);