import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { 
    HardDrive, 
    Sparkles, 
    ShieldCheck, 
    Zap, 
    ChevronLeft, 
    ChevronRight, 
    ArrowRight, 
    LogIn, 
    Image as ImageIcon,
    Mail,
    ChevronDown,
    LayoutGrid,
    CheckCircle2,
    Building2,
    Phone,
    MapPin,
    Clock,
    Share2,
    Eye,
    Layers,
    Cpu,
    Shield,
    Radio,
    Award
} from 'lucide-react';

export default function LandingPage({ onLaunchDrive }) {
    const navigate = useNavigate();
    const [albumIndex, setAlbumIndex] = useState(0);
    const [isAppsOpen, setIsAppsOpen] = useState(false);
    const [newsViewMode, setNewsViewMode] = useState('album'); // 'album' | 'grid'

    // Ecosystem Apps List (Only driveR Storage, photoS, maiL)
    const ecosystemApps = [
        {
            id: 'storage',
            name: 'driveR Storage',
            desc: 'Lưu trữ đám mây tốc độ cao & Quản lý dữ liệu tập trung',
            status: 'Đang hoạt động',
            statusBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            icon: <HardDrive className="w-5 h-5 text-blue-400" />,
            active: true,
        },
        {
            id: 'photos',
            name: 'photoS',
            desc: 'Quản lý & Chỉnh sửa Album Ảnh AI thông minh',
            status: 'Coming Soon',
            statusBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            icon: <ImageIcon className="w-5 h-5 text-purple-400" />,
            active: false,
        },
        {
            id: 'mail',
            name: 'maiL',
            desc: 'Hộp thư Điện tử Bảo mật & Tự động hoá Gemini',
            status: 'Coming Soon',
            statusBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            icon: <Mail className="w-5 h-5 text-rose-400" />,
            active: false,
        },
    ];

    // Expanded News & Updates Cards List (6 Cards)
    const newsCards = [
        {
            id: 1,
            tag: 'New AI Feature',
            date: '05/08/2026',
            readTime: '3 phút đọc',
            title: 'Hệ thống AI Gemini 2.0 Native',
            desc: 'Tích hợp mô hình AI đọc hiểu tài liệu PDF, tự động tóm tắt báo cáo và trích xuất thông tin thông minh.',
            icon: <Sparkles className="w-5 h-5 text-purple-400" />,
            border: 'border-purple-500/30 hover:border-purple-500/60',
            badgeBg: 'bg-purple-500/20 text-purple-300',
            imageBg: 'bg-gradient-to-br from-purple-900/50 via-slate-900/90 to-purple-950/80',
        },
        {
            id: 2,
            tag: 'Security Standard',
            date: '02/08/2026',
            readTime: '4 phút đọc',
            title: 'Mã hóa AES-256 Chuẩn Ngân Hàng',
            desc: 'Dữ liệu được mã hóa đa tầng End-to-End Encryption, đảm bảo an toàn tuyệt đối trước mọi nguy cơ.',
            icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
            border: 'border-emerald-500/30 hover:border-emerald-500/60',
            badgeBg: 'bg-emerald-500/20 text-emerald-300',
            imageBg: 'bg-gradient-to-br from-emerald-900/50 via-slate-900/90 to-emerald-950/80',
        },
        {
            id: 3,
            tag: 'Infrastructure',
            date: '28/07/2026',
            readTime: '2 phút đọc',
            title: 'Tốc độ Siêu Tốc 10 Gbps CDN',
            desc: 'Hệ thống hạ tầng đa luồng giúp tải lên & tải xuống tài liệu lớn tức thì không giới hạn băng thông.',
            icon: <Zap className="w-5 h-5 text-amber-400" />,
            border: 'border-amber-500/30 hover:border-amber-500/60',
            badgeBg: 'bg-amber-500/20 text-amber-300',
            imageBg: 'bg-gradient-to-br from-amber-900/50 via-slate-900/90 to-amber-950/80',
        },
        {
            id: 4,
            tag: 'Ecosystem Update',
            date: '20/07/2026',
            readTime: '5 phút đọc',
            title: 'Thử nghiệm photoS & maiL Apps',
            desc: 'Công bố lộ trình ra mắt 2 ứng dụng mới trong hệ sinh thái: photoS (quản lý ảnh AI) và maiL (hộp thư bảo mật).',
            icon: <ImageIcon className="w-5 h-5 text-rose-400" />,
            border: 'border-rose-500/30 hover:border-rose-500/60',
            badgeBg: 'bg-rose-500/20 text-rose-300',
            imageBg: 'bg-gradient-to-br from-rose-900/50 via-slate-900/90 to-rose-950/80',
        },
        {
            id: 5,
            tag: 'Collaboration',
            date: '15/07/2026',
            readTime: '3 phút đọc',
            title: 'Shared Drives & Phân Quyền Nhóm',
            desc: 'Quản lý bộ nhớ chung cho doanh nghiệp, phân quyền chi tiết Xem/Sửa và theo dõi lịch sử thao tác Audit Logs.',
            icon: <Share2 className="w-5 h-5 text-sky-400" />,
            border: 'border-sky-500/30 hover:border-sky-500/60',
            badgeBg: 'bg-sky-500/20 text-sky-300',
            imageBg: 'bg-gradient-to-br from-sky-900/50 via-slate-900/90 to-sky-950/80',
        },
        {
            id: 6,
            tag: 'Data Integrity',
            date: '10/07/2026',
            readTime: '4 phút đọc',
            title: 'Khôi phục Phiên bản & Smart Trash',
            desc: 'Lưu vết tự động phiên bản tệp, khôi phục dữ liệu đã xóa trong vòng 30 ngày an toàn.',
            icon: <Layers className="w-5 h-5 text-indigo-400" />,
            border: 'border-indigo-500/30 hover:border-indigo-500/60',
            badgeBg: 'bg-indigo-500/20 text-indigo-300',
            imageBg: 'bg-gradient-to-br from-indigo-900/50 via-slate-900/90 to-indigo-950/80',
        },
    ];

    const nextAlbum = () => {
        setAlbumIndex((prev) => (prev + 1) % newsCards.length);
    };

    const prevAlbum = () => {
        setAlbumIndex((prev) => (prev - 1 + newsCards.length) % newsCards.length);
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white">
            {/* Dynamic Continuous Sunset Animated Background */}
            <AnimatedBackground mode="sunset" />

            {/* Main Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen justify-between">
                
                {/* TOP NAVIGATION BAR */}
                <header className="w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50 transition-all shadow-xl shadow-black/40">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        
                        {/* Logo & Brand */}
                        <div 
                            className="flex items-center gap-3.5 cursor-pointer group" 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
                                <HardDrive className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-extrabold tracking-tight gradient-text-sunset">
                                    driveR
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                                    Cloud Ecosystem
                                </span>
                            </div>
                        </div>

                        {/* Navigation Links with Menu Apps */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                            <a href="#home" className="hover:text-orange-400 transition-colors">Trang chủ</a>
                            <a href="#news" className="hover:text-orange-400 transition-colors">Tin tức</a>
                            <a href="#features" className="hover:text-orange-400 transition-colors">Tính năng</a>

                            {/* DROPDOWN MENU ỨNG DỤNG (APPS DROPDOWN) */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsAppsOpen(!isAppsOpen)}
                                    onMouseEnter={() => setIsAppsOpen(true)}
                                    className="flex items-center gap-1.5 py-2 hover:text-orange-400 transition-colors cursor-pointer group"
                                >
                                    <span>Ứng dụng</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAppsOpen ? 'rotate-180 text-orange-400' : ''}`} />
                                </button>

                                {/* Dropdown Popover Card */}
                                {isAppsOpen && (
                                    <div 
                                        onMouseLeave={() => setIsAppsOpen(false)}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-3 rounded-2xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black/80 z-50 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200"
                                    >
                                        <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hệ sinh thái driveR</span>
                                            <span className="text-[10px] text-orange-400 font-mono">3 Apps</span>
                                        </div>

                                        {ecosystemApps.map((app) => (
                                            <div
                                                key={app.id}
                                                onClick={() => {
                                                    if (app.active) {
                                                        onLaunchDrive();
                                                        setIsAppsOpen(false);
                                                    }
                                                }}
                                                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                                                    app.active
                                                        ? 'bg-blue-600/10 border-blue-500/30 hover:bg-blue-600/20 cursor-pointer'
                                                        : 'bg-white/5 border-white/10 opacity-80 cursor-not-allowed hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="p-2 rounded-lg bg-slate-950 border border-white/10 mt-0.5">
                                                    {app.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <h4 className="text-sm font-bold text-white group-hover:text-orange-300">{app.name}</h4>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${app.statusBg}`}>
                                                            {app.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1 leading-snug">{app.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </nav>

                        {/* Auth Buttons & Direct Launch */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:border-orange-400/50"
                            >
                                <LogIn className="w-3.5 h-3.5 text-orange-400" />
                                <span>Đăng nhập</span>
                            </button>

                            <button
                                onClick={() => navigate('/register')}
                                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer hidden sm:block hover:border-rose-400/50"
                            >
                                Đăng ký
                            </button>

                            <button
                                onClick={onLaunchDrive}
                                className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 hover:from-orange-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-orange-500/25 hover-gradient-btn flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>Vào Workspace</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* HERO SECTION */}
                <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-16 w-full space-y-24">
                    
                    {/* Hero Header Intro */}
                    <div id="home" className="text-center max-w-3xl mx-auto space-y-6 pt-4">
                        
                        {/* Enterprise Badge Pill */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 via-rose-500/20 to-purple-500/20 border border-orange-400/40 text-orange-300 text-xs font-semibold backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                            <span>Lưu trữ Cloud Tốc độ cao & Trợ lý Gemini AI Native</span>
                        </div>

                        {/* Title with Gradient Shimmer Hover */}
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                            Giải pháp Lưu trữ Cloud & <br />
                            <span className="hover-shimmer-text inline-block py-1">
                                Hệ Sinh Thái Dữ Liệu Số
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
                            Quản lý toàn bộ tệp tin, tài liệu và dữ liệu với giao diện hiện đại, tìm kiếm thông minh bằng Gemini AI và hạ tầng bảo mật mã hóa tiêu chuẩn Việt Nam.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
                            <button
                                onClick={onLaunchDrive}
                                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 hover-gradient-btn text-white font-bold text-sm shadow-xl shadow-orange-500/30 flex items-center gap-3 cursor-pointer group"
                            >
                                <HardDrive className="w-5 h-5 text-orange-200" />
                                <span>Truy cập driveR Storage</span>
                                <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* NEWS & UPDATES SECTION (TIN TỨC & CẬP NHẬT) */}
                    <div id="news" className="max-w-5xl mx-auto pt-6 text-center space-y-6">
                        
                        {/* Section Header & View Toggle */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 text-left">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-400/30 text-orange-300 text-xs font-semibold">
                                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                                    <span>Tin tức & Cập nhật driveR</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Tin tức Mới nhất & Hệ sinh thái</h2>
                                <p className="text-slate-400 text-xs sm:text-sm">Cập nhật những tính năng, chuẩn bảo mật và ứng dụng mới ra mắt</p>
                            </div>

                            {/* View Mode Toggle Switcher */}
                            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10">
                                <button
                                    onClick={() => setNewsViewMode('album')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        newsViewMode === 'album'
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>Xem Album</span>
                                </button>
                                <button
                                    onClick={() => setNewsViewMode('grid')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        newsViewMode === 'grid'
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span>Xem Lưới</span>
                                </button>
                            </div>
                        </div>

                        {/* VIEW MODE 1: COVERFLOW ALBUM DECK SLIDER */}
                        {newsViewMode === 'album' && (
                            <div className="relative flex items-center justify-center min-h-[380px] py-4 overflow-hidden">
                                
                                {/* Floating Navigation Arrows */}
                                <button
                                    onClick={prevAlbum}
                                    className="absolute left-2 md:left-4 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95 transition-all cursor-pointer hover:border-orange-400/50"
                                    title="Tin trước"
                                >
                                    <ChevronLeft className="w-6 h-6 text-orange-400" />
                                </button>

                                <button
                                    onClick={nextAlbum}
                                    className="absolute right-2 md:right-4 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95 transition-all cursor-pointer hover:border-orange-400/50"
                                    title="Tin tiếp theo"
                                >
                                    <ChevronRight className="w-6 h-6 text-orange-400" />
                                </button>

                                {/* 3D Cards Stack */}
                                <div className="relative w-full max-w-md h-88 flex items-center justify-center">
                                    {newsCards.map((card, idx) => {
                                        const total = newsCards.length;
                                        let offset = (idx - albumIndex + total) % total;
                                        if (offset > total / 2) offset -= total;

                                        const isCenter = offset === 0;
                                        const isLeft = offset === -1;
                                        const isRight = offset === 1;

                                        if (Math.abs(offset) > 2) return null;

                                        let transformStyle = '';
                                        let zIndexStyle = 10;
                                        let opacityStyle = 'opacity-0 scale-75';

                                        if (isCenter) {
                                            transformStyle = 'translate-x-0 scale-100 rotate-0';
                                            zIndexStyle = 30;
                                            opacityStyle = 'opacity-100 shadow-2xl shadow-orange-500/20';
                                        } else if (isLeft) {
                                            transformStyle = '-translate-x-24 sm:-translate-x-32 scale-90 -rotate-6';
                                            zIndexStyle = 20;
                                            opacityStyle = 'opacity-60 backdrop-blur-md';
                                        } else if (isRight) {
                                            transformStyle = 'translate-x-24 sm:translate-x-32 scale-90 rotate-6';
                                            zIndexStyle = 20;
                                            opacityStyle = 'opacity-60 backdrop-blur-md';
                                        }

                                        return (
                                            <div
                                                key={card.id}
                                                onClick={() => setAlbumIndex(idx)}
                                                style={{ zIndex: zIndexStyle }}
                                                className={`absolute inset-0 p-6 rounded-3xl border ${card.border} ${card.imageBg} backdrop-blur-2xl text-left flex flex-col justify-between transition-all duration-500 ease-out cursor-pointer transform hover-sunset-card ${transformStyle} ${opacityStyle}`}
                                            >
                                                {/* Card Header Tag & Icon */}
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 ${card.badgeBg}`}>
                                                        {card.tag}
                                                    </span>
                                                    <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                                                        {card.icon}
                                                    </div>
                                                </div>

                                                {/* Card Content */}
                                                <div className="space-y-2.5 my-auto">
                                                    <h3 className="text-xl font-extrabold gradient-text-sunset">{card.title}</h3>
                                                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3">{card.desc}</p>
                                                </div>

                                                {/* Card Footer Info */}
                                                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-white/10">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-orange-400" />
                                                        {card.date}
                                                    </span>
                                                    <span className="text-orange-300 font-semibold">{card.readTime}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* VIEW MODE 2: BENTO GRID NEWS VIEW */}
                        {newsViewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-4">
                                {newsCards.map((card) => (
                                    <div
                                        key={card.id}
                                        className={`p-6 rounded-3xl border ${card.border} ${card.imageBg} backdrop-blur-2xl flex flex-col justify-between space-y-4 hover-sunset-card transition-all`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 ${card.badgeBg}`}>
                                                {card.tag}
                                            </span>
                                            <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                                                {card.icon}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold gradient-text-sunset">{card.title}</h3>
                                            <p className="text-slate-300 text-xs leading-relaxed">{card.desc}</p>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-white/10">
                                            <span>{card.date}</span>
                                            <span className="text-orange-300">{card.readTime}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Slider Dot Indicators */}
                        {newsViewMode === 'album' && (
                            <div className="flex justify-center items-center gap-2 pt-2">
                                {newsCards.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setAlbumIndex(idx)}
                                        className={`h-2 rounded-full transition-all cursor-pointer ${
                                            albumIndex === idx ? 'w-8 bg-orange-500' : 'w-2 bg-white/20 hover:bg-white/40'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BENTO-GRID FEATURE SECTION (GIỚI THIỆU THÊM NHIỀU TÍNH NĂNG) */}
                    <div id="features" className="space-y-12 pt-8 border-t border-white/10">
                        <div className="text-center max-w-2xl mx-auto space-y-3">
                            <h2 className="text-3xl font-extrabold hover-shimmer-text inline-block py-1">Tính năng Vượt trội của driveR Storage</h2>
                            <p className="text-slate-400 text-sm">
                                Hạ tầng lưu trữ đám mây SaaS thế hệ mới tích hợp Gemini AI và mã hóa dữ liệu an toàn.
                            </p>
                        </div>

                        {/* 8 Bento Feature Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                            
                            {/* Feature 1 */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover-sunset-card backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                                    <HardDrive className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Tổ chức Tệp Thông minh</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Sắp xếp thư mục phân cấp, hỗ trợ chế độ xem Lưới & Danh sách với bộ lọc định dạng siêu tốc.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover-sunset-card backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Trợ lý AI Gemini Native</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Tóm tắt nội dung file PDF, phân tích dữ liệu văn bản và tìm kiếm tài liệu bằng ngôn ngữ tự nhiên.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover-sunset-card backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Mã hóa Đa tầng AES-256</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Bảo mật dữ liệu tuyệt đối theo tiêu chuẩn ngân hàng, tích hợp xác thực 2 bước (2FA) & Anti-Spam.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover-sunset-card backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Share2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Chia sẻ & Phân quyền</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Tạo liên kết chia sẻ kèm mật khẩu, đặt thời hạn hết hạn và kiểm soát quyền Xem hoặc Chỉnh sửa.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover-sunset-card backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Eye className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Xem trước Đa phương tiện 4K</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Phát video 4K trực tiếp, trình phát nhạc audio và xem tài liệu Office/PDF không cần cài thêm app.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover-sunset-card backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Quản lý Dung lượng Quota</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Báo cáo chi tiết lưu trữ theo từng định dạng (Ảnh, Video, Tài liệu), nâng cấp dung lượng linh hoạt.
                                </p>
                            </div>

                            {/* Feature 7 */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover-sunset-card backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Lịch sử & Khôi phục 30 Ngày</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Tự động khôi phục các phiên bản tệp cũ, thùng rác thông minh lưu giữ dữ liệu an toàn phòng lỡ xóa.
                                </p>
                            </div>

                            {/* Feature 8 */}
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover-sunset-card backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Tích hợp API & SDK Doanh nghiệp</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Dễ dàng kết nối với hệ thống doanh nghiệp qua RESTful API, webhook và mã xác thực bảo mật OAuth2.
                                </p>
                            </div>

                        </div>
                    </div>

                </main>

                {/* COMPREHENSIVE VIETNAMESE ENTERPRISE FOOTER WITH CERTIFICATIONS & CONTACT INFO */}
                <footer className="w-full border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl pt-14 pb-8 text-slate-300 text-sm mt-16 shadow-2xl">
                    <div className="max-w-7xl mx-auto px-6 space-y-10">
                        
                        {/* 4 Main Footer Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            
                            {/* Column 1: Company Profile */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                        <HardDrive className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-lg font-extrabold tracking-tight gradient-text-sunset">driveR Cloud</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ BẢO MẬT & ĐÁM MÂY DRIVER VIỆT NAM</strong>
                                </p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Mã số doanh nghiệp: 0109876543 do Sở Kế hoạch & Đầu tư TP. Hà Nội cấp lần đầu ngày 15/10/2022.
                                </p>
                                <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                        <span><strong>Hà Nội:</strong> Tầng 18, Keangnam Landmark 72, Đ. Phạm Hùng, Q. Nam Từ Liêm.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Building2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                        <span><strong>TP.HCM:</strong> Tầng 12, Bitexco Financial Tower, 2 Hải Triều, Q.1.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Contact Information */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider text-orange-400">Thông tin liên hệ</h4>
                                <ul className="space-y-2.5 text-xs text-slate-400">
                                    <li className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-emerald-400" />
                                        <span>Hotline CSKH (24/7): <strong className="text-white">1900 6888</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-emerald-400" />
                                        <span>Tổng đài Doanh nghiệp: <strong className="text-white">024.7300.9999</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-sky-400" />
                                        <span>Email hỗ trợ: <a href="mailto:hotro@driver.vn" className="text-sky-300 hover:underline">hotro@driver.vn</a></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-sky-400" />
                                        <span>Hợp tác B2B: <a href="mailto:b2b@driver.vn" className="text-sky-300 hover:underline">b2b@driver.vn</a></span>
                                    </li>
                                    <li className="text-[11px] text-slate-500 pt-1">
                                        * Thời gian làm việc: Thứ 2 - Thứ 7 (08:00 - 18:00)
                                    </li>
                                </ul>
                            </div>

                            {/* Column 3: Certifications & Licenses (Nhà nước Việt Nam) */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider text-rose-400">Chứng nhận & Giấy phép</h4>
                                <ul className="space-y-2 text-xs text-slate-400">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                        <span><strong>Bộ Thông tin & Truyền thông:</strong> Giấy phép Dịch vụ Lưu trữ Đám mây Số 188/GP-BTTTT.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <span><strong>Cục An toàn Thông tin:</strong> Chứng nhận An toàn Thông tin Cấp độ 3 (TCVN 11930:2017).</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Award className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                        <span><strong>Tiêu chuẩn Quốc tế:</strong> ISO/IEC 27001:2022 & ISO/IEC 27017 (Cloud Security).</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                                        <span>Tuân thủ Luật An ninh mạng 2018 & NĐ 53/2022/NĐ-CP & NĐ 13/2023/NĐ-CP.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 4: Official Ministry Badge & Legal Links */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">Xác thực Bộ Công Thương</h4>
                                
                                {/* Official "Đã Thông Báo Bộ Công Thương" Badge Component */}
                                <div className="inline-flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-400 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                                        <Award className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-[10px] font-extrabold uppercase text-blue-400 tracking-wider">Đã Thông Báo</span>
                                        <span className="block text-xs font-bold text-white">BỘ CÔNG THƯƠNG</span>
                                        <span className="block text-[9px] text-slate-400 font-mono">BCT Registration Verified</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-400">
                                    <a href="#privacy" className="block hover:text-white transition-colors">• Điều khoản dịch vụ & Sử dụng</a>
                                    <a href="#privacy" className="block hover:text-white transition-colors">• Chính sách bảo mật dữ liệu cá nhân</a>
                                    <a href="#privacy" className="block hover:text-white transition-colors">• Cam kết chất lượng dịch vụ (SLA 99.99%)</a>
                                </div>
                            </div>

                        </div>

                        {/* Footer Bottom Bar */}
                        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold text-white">driveR Cloud System</span>
                                <span>© 2026 Ecosystem Inc. Tất cả quyền được bảo lưu.</span>
                            </div>

                            <div className="flex items-center gap-4 text-slate-400">
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-orange-400 transition-colors">GitHub</a>
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-orange-400 transition-colors">Facebook</a>
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-orange-400 transition-colors">LinkedIn</a>
                            </div>
                        </div>

                    </div>
                </footer>

            </div>
        </div>
    );
}
