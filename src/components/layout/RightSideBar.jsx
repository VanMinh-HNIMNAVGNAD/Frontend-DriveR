import { useState, useEffect } from 'react';

export default function RightSideBar({ isOpen }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    return (
        <aside className={`transition-all duration-300 ease-in-out flex flex-col items-center bg-[#f8fafd] dark:bg-[#1e1e1e]
        ${isOpen ? 'w-12 lg:w-16 opacity-100 mr-0 lg:mr-2' : 'w-0 opacity-0 overflow-hidden'}`}>
            <div className="flex flex-col items-center w-12 lg:w-16 pt-3 gap-5">
                {/* ... Nút Tài khoản và Cài đặt giữ nguyên ... */}

                {/* Nút Toggle Dark Mode */}
                <button
                    onClick={() => {
                        const next = !isDarkMode;
                        setIsDarkMode(next);
                        // Ghi lại lựa chọn rõ ràng sáng/tối để SettingsModal đọc lên
                        // đúng trạng thái (modal dùng khoá driveR_settings_theme)
                        localStorage.setItem('driveR_settings_theme', next ? 'dark' : 'light');
                    }}
                    title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
                    className="w-10 h-10 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                    {isDarkMode ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>
            </div>
        </aside>
    );
}