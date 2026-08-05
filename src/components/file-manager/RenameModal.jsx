import { useState, useEffect } from 'react';
import { Pencil, X } from 'lucide-react';

export default function RenameModal({ isOpen, item, onClose, onRename }) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (item) {
            setName(item.name || '');
        }
    }, [item]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose && onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !item) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && name !== item.name) {
            onRename(item.id, name.trim());
        }
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in cursor-pointer"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-[#282a2c] dark:text-gray-100 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2.5 font-semibold text-lg text-gray-800 dark:text-gray-100">
                        <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Đổi tên {item.type === 'folder' ? 'thư mục' : 'tệp'}</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Tên mới
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                            placeholder="Nhập tên mới..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || name === item.name}
                            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                            Đồng ý
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
