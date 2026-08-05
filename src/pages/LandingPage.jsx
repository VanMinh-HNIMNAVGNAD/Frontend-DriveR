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
    FileCode,
    Lock,
    Users,
    History,
    Globe,
    LogIn,
    Image as ImageIcon
} from 'lucide-react';

export default function LandingPage({ onLaunchDrive }) {
    const navigate = useNavigate();
    const [albumIndex, setAlbumIndex] = useState(0);

    const albumNewsCards = [
        {
            id: 1,
            tag: 'New Feature',
            title: 'Hệ thống AI Gemini',
            desc: 'Đọc hiểu tài liệu, tóm tắt và phân tích bằng AI cực mạnh.',
            icon: <Sparkles className="w-5 h-5 text-purple-400" />,
            border: 'border-purple-500/30',
            badgeBg: 'bg-purple-500/20 text-purple-300',
            imageBg: 'bg-gradient-to-br from-purple-900/40 to-slate-900/80',
        },
        {
            id: 2,
            tag: 'Security Update',
            title: 'Mã hóa AES-256',
            desc: 'Dữ liệu của bạn được bảo mật tuyệt đối với tiêu chuẩn ngân hàng.',
            icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
            border: 'border-emerald-500/30',
            badgeBg: 'bg-emerald-500/20 text-emerald-300',
            imageBg: 'bg-gradient-to-br from-emerald-900/40 to-slate-900/80',
        },
        {
            id: 3,
            tag: 'Performance',
            title: 'Tốc độ siêu tốc',
            desc: 'Tải lên và tải xuống với tốc độ tối đa không giới hạn băng thông.',
            icon: <Zap className="w-5 h-5 text-amber-400" />,
            border: 'border-amber-500/30',
            badgeBg: 'bg-amber-500/20 text-amber-300',
            imageBg: 'bg-gradient-to-br from-amber-900/40 to-slate-900/80',
        },
    ];

    const nextAlbum = () => {
        setAlbumIndex((prev) => (prev + 1) % albumNewsCards.length);
    };

    const prevAlbum = () => {
        setAlbumIndex((prev) => (prev - 1 + albumNewsCards.length) % albumNewsCards.length);
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white">
            {/* Dynamic Continuous Animated Background */}
            <AnimatedBackground mode="tech" />

            {/* Main Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen justify-between">
                
                {/* TOP NAVIGATION BAR */}
                <header className="w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 transition-all">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        
                        {/* Logo & Brand */}
                        <div 
                            className="flex items-center gap-3.5 cursor-pointer group" 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                                <HardDrive className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                                    driveR
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                                    Cloud System
                                </span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                            <a href="#home" className="hover:text-white transition-colors">Trang chủ</a>
                            <a href="#album" className="hover:text-white transition-colors">Bản tin Album</a>
                            <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
                        </nav>

                        {/* Auth Buttons & Direct Launch */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Đăng nhập</span>
                            </button>

                            <button
                                onClick={() => navigate('/register')}
                                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer hidden sm:block"
                            >
                                Đăng ký
                            </button>

                            <button
                                onClick={onLaunchDrive}
                                className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>Vào Workspace</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* HERO SECTION */}
                <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-16 w-full space-y-24">
                    
                    {/* Hero Header Intro (Concise & Punchy) */}
                    <div id="home" className="text-center max-w-3xl mx-auto space-y-6 pt-4">
                        
                        {/* Enterprise Badge Pill */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                            <span>Lưu trữ Cloud Tốc độ cao & Trợ lý Gemini AI Native</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                            Giải pháp Lưu trữ Cloud & <br />
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                                Hệ sinh thái Dữ liệu Số
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
                            Quản lý toàn bộ tệp tin, tài liệu và dữ liệu của bạn với giao diện hiện đại, khả năng tìm kiếm AI Gemini vượt trội và bảo mật tối đa.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
                            <button
                                onClick={onLaunchDrive}
                                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-600/35 hover:scale-105 transition-all flex items-center gap-3 cursor-pointer group"
                            >
                                <HardDrive className="w-5 h-5 text-blue-200" />
                                <span>Truy cập driveR Storage</span>
                                <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* MOBILE-STYLE PHOTO ALBUM DECK CAROUSEL (Card tin tức lướt mượt như Album Điện thoại) */}
                    <div id="album" className="max-w-5xl mx-auto pt-6 text-center space-y-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-semibold">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Bản tin & Tính năng dạng Album</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Lướt xem Bản tin & Cập nhật Mới</h2>
                            <p className="text-slate-400 text-xs sm:text-sm">Chuyển qua lại giữa các thẻ thông tin mượt mà như duyệt Album ảnh trên smartphone</p>
                        </div>

                        {/* 3D Coverflow Album Deck */}
                        <div className="relative flex items-center justify-center min-h-[360px] py-4 overflow-hidden">
                            
                            {/* Previous / Next Floating Arrows */}
                            <button
                                onClick={prevAlbum}
                                className="absolute left-2 md:left-8 z-40 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/20 text-white shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                title="Thẻ trước"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            <button
                                onClick={nextAlbum}
                                className="absolute right-2 md:right-8 z-40 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/20 text-white shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                title="Thẻ tiếp theo"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Album Stack Cards */}
                            <div className="relative w-full max-w-md h-80 flex items-center justify-center">
                                {albumNewsCards.map((card, idx) => {
                                    // Calculate relative offset from active card
                                    const total = albumNewsCards.length;
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
                                        opacityStyle = 'opacity-100 shadow-2xl shadow-blue-500/20';
                                    } else if (isLeft) {
                                        transformStyle = '-translate-x-24 sm:-translate-x-32 scale-90 -rotate-6';
                                        zIndexStyle = 20;
                                        opacityStyle = 'opacity-70 backdrop-blur-md';
                                    } else if (isRight) {
                                        transformStyle = 'translate-x-24 sm:translate-x-32 scale-90 rotate-6';
                                        zIndexStyle = 20;
                                        opacityStyle = 'opacity-70 backdrop-blur-md';
                                    }

                                    return (
                                        <div
                                            key={card.id}
                                            onClick={() => setAlbumIndex(idx)}
                                            style={{ zIndex: zIndexStyle }}
                                            className={`absolute inset-0 p-6 rounded-3xl border ${card.border} ${card.imageBg} backdrop-blur-2xl text-left flex flex-col justify-between transition-all duration-500 ease-out cursor-pointer transform ${transformStyle} ${opacityStyle}`}
                                        >
                                            {/* Card Top Tag & Icon */}
                                            <div className="flex items-center justify-between">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 ${card.badgeBg}`}>
                                                    {card.tag}
                                                </span>
                                                <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                                                    {card.icon}
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="space-y-2 my-auto">
                                                <h3 className="text-xl font-extrabold text-white">{card.title}</h3>
                                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{card.desc}</p>
                                            </div>

                                            {/* Card Bottom Indicator */}
                                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-white/10">
                                                <span>driveR Album #{card.id}</span>
                                                <span className="text-blue-300 font-semibold">Chạm để chọn</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>

                        {/* Dot Indicators */}
                        <div className="flex justify-center items-center gap-2 pt-2">
                            {albumNewsCards.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setAlbumIndex(idx)}
                                    className={`h-2 rounded-full transition-all cursor-pointer ${
                                        albumIndex === idx ? 'w-8 bg-blue-500' : 'w-2 bg-white/20 hover:bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* BENTO-GRID FEATURE SECTION (Giới thiệu ngắn gọn) */}
                    <div id="features" className="space-y-12 pt-8 border-t border-white/10">
                        <div className="text-center max-w-2xl mx-auto space-y-3">
                            <h2 className="text-3xl font-extrabold text-white">Tính năng Vượt trội</h2>
                            <p className="text-slate-400 text-sm">
                                Thiết kế tối ưu hóa trải nghiệm người dùng với các tiêu chuẩn SaaS cao cấp nhất.
                            </p>
                        </div>

                        {/* Feature Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                            
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                                    <HardDrive className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Tổ chức Tệp Thông minh</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Sắp xếp thư mục phân cấp, hỗ trợ chế độ xem Danh sách & Lưới với các tông màu thẻ nhận diện trực quan.
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Hỗ trợ Gemini AI</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Đọc hiểu tài liệu PDF, tóm tắt báo cáo tự động và đề xuất từ khóa tìm kiếm chính xác tuyệt đối.
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 backdrop-blur-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Bảo mật Mã hóa AES-256</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Mã hóa dữ liệu đa tầng, cài đặt mật khẩu bảo vệ tệp và kiểm soát rủi ro độc hại Anti-Spam.
                                </p>
                            </div>
                        </div>
                    </div>

                </main>

                {/* FOOTER */}
                <footer className="w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-2xl py-10 mt-12 text-slate-400 text-sm">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
                        <div className="flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold text-white">driveR Cloud</span>
                            <span>© 2026 Ecosystem Inc.</span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
                            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">X (Twitter)</a>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
}
