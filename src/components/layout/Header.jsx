import { useState, useRef, useEffect } from 'react';
import { useFiles } from '../../context/FileContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SearchFilterModal from './SearchFilterModal';
import SettingsModal from './SettingsModal';
import AccountModal from './AccountModal';
import { 
    Menu, 
    Search, 
    SlidersHorizontal, 
    Settings, 
    Grid, 
    HardDrive, 
    Mail, 
    Image as ImageIcon, 
    Sparkles, 
    Globe,
    ExternalLink,
    Sun,
    Moon
} from 'lucide-react';

export default function Header({ toggleRightSidebar }) {
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { 
        searchQuery, 
        setSearchQuery, 
        toggleSidebar, 
        filterType,
        isSidebarCollapsed,
        setActiveTab,
        setCurrentFolderId
    } = useFiles();

    const navigate = useNavigate();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);

    const appsMenuRef = useRef(null);

    // Close apps dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (appsMenuRef.current && !appsMenuRef.current.contains(e.target)) {
                setIsAppsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoClick = () => {
        navigate('/app/home');
    };

    return (
        <header className="h-16 flex items-center justify-between px-3 md:px-5 bg-white border-b border-gray-100 shrink-0 gap-3">
            {/* LOGO & Web Title "driveR" */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Nút Toggle Sidebar */}
                <button
                    onClick={toggleSidebar}
                    title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none cursor-pointer"
                >
                    <Menu className="w-5 h-5 text-gray-700" />
                </button>

                {/* Logo page + tên web "driveR" (Clicking resets to My Drive) */}
                <div 
                    onClick={handleLogoClick}
                    className="flex items-center gap-2 cursor-pointer select-none pr-2 group"
                    title="Về trang Driver riêng của tôi"
                >
                    {/* Multi-colored Drive Logo SVG */}
                    <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 87.3 78" className="w-8 h-8 drop-shadow-xs">
                            <path d="M6.6 66.85l25.3-43.8 13.9 24.1-12.7 22-26.5-2.3z" fill="#0066DA" />
                            <path d="M45.8 47.15l13.9-24.1 21 36.4H33.1l12.7-12.3z" fill="#00AC47" />
                            <path d="M31.9 23.05L45.8 0l34.9 60.5H53.4L31.9 23.05z" fill="#EA4335" />
                            <path d="M0 60.5l13.9-24.1L48.8 97H21L0 60.5z" fill="#FFBA00" />
                        </svg>
                    </div>

                    <span className="text-xl font-bold tracking-tight text-gray-800 font-sans">
                        drive<span className="text-blue-600 font-extrabold text-2xl">R</span>
                    </span>
                </div>
            </div>

            {/* VÙNG TÌM KIẾM TO + BỘ LỌC TÌM KIẾM */}
            <div className="flex-1 max-w-2xl relative mx-2">
                <div className="flex items-center bg-[#f0f4f9] hover:bg-[#e9eef6] focus-within:bg-white focus-within:shadow-md focus-within:ring-1 focus-within:ring-blue-500 rounded-full px-4 py-2 transition-all duration-200">
                    <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm tệp, thư mục, driver trong driveR..."
                        className="w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-500"
                    />
                    
                    {/* Nút Bộ lọc tìm kiếm */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        title="Bộ lọc tìm kiếm nâng cao"
                        className={`p-1.5 rounded-full hover:bg-gray-200/80 transition-colors ml-2 shrink-0 cursor-pointer ${
                            isFilterOpen || filterType !== 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                        }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                </div>

                {/* Popover Bộ Lọc Tìm Kiếm */}
                <SearchFilterModal
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                />
            </div>

            {/* CÀI ĐẶT + ỨNG DỤNG HỆ SINH THÁI + THÔNG TIN TÀI KHOẢN */}
            <div className="flex items-center gap-1.5 shrink-0 relative">
                
                {/* Google Apps Switcher Waffle Menu (9 Dots Icon) */}
                <div className="relative" ref={appsMenuRef}>
                    <button
                        onClick={() => setIsAppsMenuOpen(!isAppsMenuOpen)}
                        title="Các ứng dụng driveR & Landing Page"
                        className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                            isAppsMenuOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <Grid className="w-5 h-5" />
                    </button>

                    {/* Apps & Ecosystem Dropdown */}
                    {isAppsMenuOpen && (
                        <div className="absolute right-0 top-12 z-50 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 text-xs font-sans animate-in fade-in zoom-in-95">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                Hệ sinh thái driveR Apps
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {/* Option 1: Landing Page */}
                                <button
                                    onClick={() => {
                                        setIsAppsMenuOpen(false);
                                        navigate('/');
                                    }}
                                    className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col items-center justify-center text-center gap-1.5 hover:scale-[1.03] transition-all cursor-pointer shadow-md group"
                                >
                                    <Globe className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                                    <span className="font-bold text-[11px]">Trang giới thiệu (Landing Page)</span>
                                </button>

                                {/* Option 2: driveR Storage */}
                                <button
                                    onClick={() => {
                                        setIsAppsMenuOpen(false);
                                        navigate('/app');
                                    }}
                                    className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex flex-col items-center justify-center text-center gap-1.5 font-bold text-[11px] cursor-pointer"
                                >
                                    <HardDrive className="w-5 h-5 text-blue-600" />
                                    <span>driveR Storage (Đang mở)</span>
                                </button>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-gray-100 text-gray-500">
                                <div className="p-2 rounded-xl bg-gray-50 flex items-center justify-between opacity-70">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>driveR Mail</span>
                                    </div>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-bold uppercase">Soon</span>
                                </div>
                                <div className="p-2 rounded-xl bg-gray-50 flex items-center justify-between opacity-70">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-gray-400" />
                                        <span>driveR Photos</span>
                                    </div>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-bold uppercase">Soon</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Nút Cài Đặt */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    title="Cài đặt driveR"
                    className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                    <Settings className="w-5 h-5" />
                </button>

                {/* Nút Thông tin tài khoản — 3 trạng thái: loading / chưa login / đã login */}
                <div className="relative">
                    {isAuthLoading ? (
                        /* Skeleton khi đang kiểm tra auth */
                        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse ml-1" />
                    ) : !isAuthenticated ? (
                        /* Chưa đăng nhập → hiện nút Đăng nhập */
                        <button
                            onClick={() => navigate('/login')}
                            className="ml-1 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                        >
                            Đăng nhập
                        </button>
                    ) : (
                        /* Đã đăng nhập → hiện avatar */
                        <>
                            <button
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                title="Thông tin tài khoản"
                                className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center hover:opacity-90 shadow-xs transition-opacity ml-1 cursor-pointer overflow-hidden border border-gray-200"
                            >
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    (user?.fullName || user?.email || 'U').charAt(0).toUpperCase()
                                )}
                            </button>

                            {/* Popover Thông Tin Tài Khoản */}
                            <AccountModal
                                isOpen={isAccountOpen}
                                onClose={() => setIsAccountOpen(false)}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Modal Cài Đặt */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </header>
    );
}