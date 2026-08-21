import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    HardDrive, 
    Sparkles, 
    ShieldCheck, 
    ArrowRight, 
    LogIn, 
    Image as ImageIcon, 
    Mail, 
    ChevronDown, 
    CheckCircle2, 
    Building2, 
    Phone, 
    MapPin, 
    Clock, 
    Share2, 
    Eye, 
    Layers, 
    Shield, 
    Award,
    Search,
    Folder,
    FileText,
    FileSpreadsheet,
    Zap,
    Lock,
    Sliders,
    Check,
    Download,
    Cloud,
    Database,
    FileCheck2
} from 'lucide-react';

export default function LandingPage({ onLaunchDrive }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [isAppsOpen, setIsAppsOpen] = useState(false);

    const handleAccess = () => {
        if (isAuthenticated) {
            if (onLaunchDrive) {
                onLaunchDrive();
            } else {
                navigate('/app');
            }
        } else {
            navigate('/login');
        }
    };

    // Ecosystem Apps List (Strictly using neutral, sky, amber, emerald tones)
    const ecosystemApps = [
        {
            id: 'storage',
            name: 'driveR Storage',
            desc: 'Lưu trữ đám mây tốc độ cao & Quản lý dữ liệu tập trung',
            status: 'Đang hoạt động',
            statusBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            icon: <HardDrive className="w-5 h-5 text-sky-600" />,
            iconBg: 'bg-sky-50 border-sky-100',
            active: true,
        },
        {
            id: 'photos',
            name: 'photoS',
            desc: 'Quản lý & Chỉnh sửa Album Ảnh AI thông minh',
            status: 'Sắp ra mắt',
            statusBg: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: <ImageIcon className="w-5 h-5 text-amber-600" />,
            iconBg: 'bg-amber-50 border-amber-100',
            active: false,
        },
        {
            id: 'mail',
            name: 'maiL',
            desc: 'Hộp thư Điện tử Bảo mật & Tự động hoá Gemini',
            status: 'Sắp ra mắt',
            statusBg: 'bg-sky-50 text-sky-700 border-sky-200',
            icon: <Mail className="w-5 h-5 text-sky-600" />,
            iconBg: 'bg-sky-50 border-sky-100',
            active: false,
        },
    ];

    return (
        <div className="relative min-h-screen bg-slate-50/50 text-slate-900 font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white">
            
            {/* Ambient Background Glows & Dot Grid */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                {/* Dot Matrix Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
                
                {/* Ambient Soft Glows */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] sm:w-[960px] h-[480px] bg-gradient-to-tr from-sky-200/40 via-orange-100/35 to-emerald-100/25 blur-3xl rounded-full opacity-80" />
                <div className="absolute top-[38rem] -left-32 w-80 h-80 bg-orange-100/35 blur-3xl rounded-full opacity-60" />
                <div className="absolute top-[48rem] -right-32 w-96 h-96 bg-sky-100/40 blur-3xl rounded-full opacity-70" />
            </div>

            {/* Main Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen justify-between">
                
                {/* TOP NAVIGATION BAR */}
                <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between relative">
                        
                        {/* Brand */}
                        <div 
                            className="flex items-center gap-2 cursor-pointer group select-none" 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-500 flex items-center justify-center shadow-md shadow-sky-500/20 text-white group-hover:scale-105 transition-transform">
                                <HardDrive className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                                drive<span className="text-orange-500 font-black">R</span>
                            </span>
                        </div>

                        {/* Centered Navigation Links */}
                        <nav className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-slate-600 absolute left-1/2 -translate-x-1/2">
                            <a href="#home" className="hover:text-slate-900 transition-colors">Trang chủ</a>
                            <a href="#features" className="hover:text-slate-900 transition-colors">Tính năng</a>
                            <a href="#security" className="hover:text-slate-900 transition-colors">Bảo mật</a>

                            {/* Ecosystem Apps Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsAppsOpen(!isAppsOpen)}
                                    onMouseEnter={() => setIsAppsOpen(true)}
                                    className="flex items-center gap-1.5 py-2 hover:text-slate-900 transition-colors cursor-pointer group text-[14px] font-semibold text-slate-600"
                                >
                                    <span>Hệ sinh thái</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAppsOpen ? 'rotate-180 text-orange-500' : 'text-slate-400'}`} />
                                </button>

                                {/* Dropdown Popover */}
                                {isAppsOpen && (
                                    <div 
                                        onMouseLeave={() => setIsAppsOpen(false)}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-84 p-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-200/80 z-50 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
                                    >
                                        <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hệ sinh thái driveR</span>
                                            <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">3 Dịch vụ</span>
                                        </div>

                                        {ecosystemApps.map((app) => (
                                            <div
                                                key={app.id}
                                                onClick={() => {
                                                    if (app.active) {
                                                        handleAccess();
                                                        setIsAppsOpen(false);
                                                    }
                                                }}
                                                className={`p-2.5 rounded-xl border transition-all flex items-start gap-3 ${
                                                    app.active
                                                        ? 'bg-sky-50/50 border-sky-200 hover:bg-sky-100/50 hover:border-sky-300 cursor-pointer'
                                                        : 'bg-slate-50 border-slate-200/70 opacity-70 cursor-not-allowed'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-lg border mt-0.5 shadow-2xs ${app.iconBg}`}>
                                                    {app.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <h4 className="text-xs font-bold text-slate-900">{app.name}</h4>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${app.statusBg}`}>
                                                            {app.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{app.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </nav>

                        {/* Header Action Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAccess}
                                className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer transition-all duration-200"
                            >
                                {isAuthenticated ? (
                                    <>
                                        <span>Vào Workspace</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-3.5 h-3.5" />
                                        <span>Đăng nhập</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* HERO SECTION */}
                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 w-full space-y-20">
                    
                    {/* Hero Intro */}
                    <div id="home" className="text-center max-w-3xl mx-auto space-y-6 pt-2">
                        
                        {/* Top Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            <span>Ra mắt driveR v2.0 - Tích hợp Trợ lý Gemini AI</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                            Lưu Trữ Đám Mây Hiện Đại & <br />
                            <span className="bg-gradient-to-r from-slate-900 via-sky-700 to-sky-600 bg-clip-text text-transparent">
                                Quản Trị Dữ Liệu Thông Minh
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
                            Không gian làm việc số thế hệ mới: Tìm kiếm ngữ nghĩa bằng Gemini AI, chia sẻ phân quyền linh hoạt và bảo mật mã hóa tiêu chuẩn ngân hàng.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap justify-center items-center gap-3.5 pt-2">
                            <button
                                onClick={handleAccess}
                                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer transition-all duration-200 group"
                            >
                                <HardDrive className="w-4 h-4 text-orange-100" />
                                <span>{isAuthenticated ? 'Truy cập driveR Storage' : 'Bắt đầu sử dụng miễn phí'}</span>
                                <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 transition-transform" />
                            </button>

                            <a
                                href="#features"
                                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 flex items-center gap-2 transition-all duration-200"
                            >
                                <span>Khám phá tính năng</span>
                            </a>
                        </div>
                    </div>

                    {/* HERO VISUAL MOCKUP (App Window Preview with Floating Badges) */}
                    <div className="relative max-w-5xl mx-auto pt-4">
                        
                        {/* Floating Badge 1: Security (Bottom Left) */}
                        <div className="absolute -bottom-6 -left-3 sm:-left-6 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200 shadow-xl shadow-emerald-500/10 animate-float-slow">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="text-left pr-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900">Mã hóa AES-256</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                                <p className="text-[11px] text-slate-500">Bảo mật dữ liệu chuẩn ngân hàng</p>
                            </div>
                        </div>

                        {/* Floating Badge 2: Gemini AI (Top Right) */}
                        <div className="absolute -top-6 -right-3 sm:-right-6 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-sky-200 shadow-xl shadow-sky-500/10 animate-float-delayed">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="text-left pr-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900">Gemini AI Assistant</span>
                                    <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">v2.0</span>
                                </div>
                                <p className="text-[11px] text-slate-500">Tóm tắt & Tìm kiếm ngữ nghĩa</p>
                            </div>
                        </div>

                        {/* Window Frame Container */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-200/80 backdrop-blur-xl overflow-hidden transition-all">
                            
                            {/* Window Header (macOS dots + Search Bar) */}
                            <div className="h-12 border-b border-slate-200/80 bg-slate-50/80 px-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400/30" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400/80 border border-amber-500/30" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400/80 border border-emerald-500/30" />
                                </div>

                                {/* Mock Search Bar */}
                                <div className="flex-1 max-w-md mx-auto flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-400 shadow-2xs">
                                    <div className="flex items-center gap-2">
                                        <Search className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-slate-500">Tìm kiếm tệp, văn bản, Gemini AI...</span>
                                    </div>
                                    <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">⌘K</span>
                                </div>

                                {/* Status Info */}
                                <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>Cloud Đồng bộ</span>
                                </div>
                            </div>

                            {/* Window Body (Simulated Workspace Dashboard) */}
                            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 bg-gradient-to-b from-white to-slate-50/40">
                                
                                {/* Left Mock Sidebar */}
                                <div className="hidden md:block col-span-1 space-y-4 border-r border-slate-100 pr-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 text-sky-700 font-semibold text-xs">
                                            <HardDrive className="w-4 h-4 text-sky-600" />
                                            <span>Tất cả tệp tin</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-xs">
                                            <Folder className="w-4 h-4 text-amber-500" />
                                            <span>Dự án 2026</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-xs">
                                            <Folder className="w-4 h-4 text-amber-500" />
                                            <span>Tài liệu Kế toán</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-xs">
                                            <Folder className="w-4 h-4 text-amber-500" />
                                            <span>Media & Thiết kế</span>
                                        </div>
                                    </div>

                                    {/* Mini Storage Widget */}
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                                        <div className="flex justify-between items-center text-[11px] font-bold">
                                            <span className="text-slate-700">Dung lượng</span>
                                            <span className="text-orange-600">14.8 / 100 GB</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
                                            <div className="h-full bg-sky-500 w-[10%]" />
                                            <div className="h-full bg-orange-400 w-[5%]" />
                                        </div>
                                        <p className="text-[10px] text-slate-400">Gói Doanh Nghiệp Pro</p>
                                    </div>
                                </div>

                                {/* Right Mock File Grid & AI Banner */}
                                <div className="col-span-1 md:col-span-3 space-y-4">
                                    
                                    {/* Gemini AI Smart Assistant Banner */}
                                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-white to-orange-50/40 border border-sky-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900">Gemini AI vừa tóm tắt xong 3 tài liệu mới</h4>
                                                <p className="text-[11px] text-slate-500">Phát hiện 14 điều khoản then chốt trong Hợp đồng Q3-2026</p>
                                            </div>
                                        </div>
                                        <button className="text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-white border border-sky-200 px-3 py-1.5 rounded-lg shadow-2xs">
                                            Xem tóm tắt
                                        </button>
                                    </div>

                                    {/* Mock Files Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        
                                        {/* File 1 */}
                                        <div className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 transition-all space-y-2 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">AES-256</span>
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-900 truncate">Hop-dong-Keangnam-2026.pdf</h5>
                                                <p className="text-[10px] text-slate-400 mt-0.5">3.8 MB • Cập nhật 10p trước</p>
                                            </div>
                                        </div>

                                        {/* File 2 */}
                                        <div className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 transition-all space-y-2 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                                    <FileSpreadsheet className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">Chia sẻ (3)</span>
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-900 truncate">Bao-cao-Tai-chinh-Q3.xlsx</h5>
                                                <p className="text-[10px] text-slate-400 mt-0.5">1.2 MB • Cập nhật 2h trước</p>
                                            </div>
                                        </div>

                                        {/* File 3 */}
                                        <div className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 transition-all space-y-2 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">4K Media</span>
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-900 truncate">Brand-Key-Visual-2026.png</h5>
                                                <p className="text-[10px] text-slate-400 mt-0.5">18.4 MB • Cập nhật hôm qua</p>
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>

                    {/* METRICS / TRUST STRIP */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-slate-200/80">
                        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-center">
                            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">99.99%</span>
                            <span className="text-xs text-slate-500 font-medium">Uptime Cam Kết (SLA)</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-center">
                            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">AES-256</span>
                            <span className="text-xs text-slate-500 font-medium">Mã Hóa Dữ Liệu Đầu-Cuối</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-center">
                            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">&lt; 1.2s</span>
                            <span className="text-xs text-slate-500 font-medium">Tốc Độ Phân Tích Gemini AI</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 text-center">
                            <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">ISO 27001</span>
                            <span className="text-xs text-slate-500 font-medium">Chứng Nhận An Toàn Quốc Tế</span>
                        </div>
                    </div>

                    {/* BENTO-GRID 2.0 FEATURE SECTION (Asymmetric Layout) */}
                    <div id="features" className="space-y-10 pt-6">
                        
                        {/* Section Header */}
                        <div className="text-center max-w-2xl mx-auto space-y-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
                                <Layers className="w-3.5 h-3.5 text-sky-600" />
                                <span>Tính năng đột phá</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Hệ Thống Lưu Trữ Bento UI Đẳng Cấp
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Kiến trúc lưu trữ đám mây hiện đại, tối ưu cho tốc độ và khả năng cộng tác không giới hạn.
                            </p>
                        </div>

                        {/* Bento Grid Container */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            
                            {/* CARD 1: Hero Card Lớn (Span 2 cols, 2 rows) - Gemini AI & File Organization */}
                            <div className="md:col-span-2 lg:col-span-2 md:row-span-2 p-7 rounded-3xl bg-gradient-to-b from-white via-white to-sky-50/40 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform shadow-2xs">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                                            Trợ lý AI Độc quyền
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
                                            Tổ chức Tệp & Trợ lý Gemini AI Native
                                        </h3>
                                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                            Truy vấn thông tin tài liệu bằng ngôn ngữ tự nhiên. Gemini AI tự động phân tích hợp đồng, tóm tắt sách và trích xuất số liệu bảng tính trong vài giây.
                                        </p>
                                    </div>

                                    {/* Mock Semantic Search inside Bento Card */}
                                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                                        <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                            <Search className="w-4 h-4 text-sky-600 shrink-0" />
                                            <span className="font-medium">"Tìm các điều khoản bảo hành trong Hợp đồng Thiết bị 2026"</span>
                                        </div>

                                        <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700 space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-sky-700 font-bold text-[11px]">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>Gemini AI đã tìm thấy tại Mục 5.2 (Trang 18)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-600 leading-snug">
                                                "Thời hạn bảo hành tiêu chuẩn là 36 tháng kể từ ngày nghiệm thu, hỗ trợ kỹ thuật On-site 24/7..."
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                                        Hỗ trợ PDF, Word, Excel, Markdown
                                    </span>
                                    <span className="text-sky-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                        Khám phá AI <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>

                            {/* CARD 2: Card Dài (Span 2 cols) - Bảo Mật Đa Tầng & Mã Hóa AES-256 */}
                            <div id="security" className="md:col-span-2 lg:col-span-2 p-7 rounded-3xl bg-gradient-to-b from-white to-emerald-50/30 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shadow-2xs">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                            Chuẩn Ngân Hàng
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-2">
                                            Bảo mật Đa tầng & Mã hóa AES-256
                                        </h3>
                                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                            Bảo vệ toàn diện dữ liệu At-Rest & In-Transit. Tích hợp xác thực 2 bước (2FA), kiểm soát IP và tuân thủ tuyệt đối Nghị định 13/2023/NĐ-CP.
                                        </p>
                                    </div>

                                    {/* Security Pillars Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center space-y-0.5">
                                            <Lock className="w-4 h-4 text-emerald-600 mx-auto" />
                                            <span className="block text-xs font-bold text-slate-800">Mã hóa 256-bit</span>
                                            <span className="block text-[10px] text-slate-400">Đầu-cuối</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center space-y-0.5">
                                            <Shield className="w-4 h-4 text-emerald-600 mx-auto" />
                                            <span className="block text-xs font-bold text-slate-800">Cấp độ 3 ATTT</span>
                                            <span className="block text-[10px] text-slate-400">TCVN 11930</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center space-y-0.5">
                                            <Award className="w-4 h-4 text-emerald-600 mx-auto" />
                                            <span className="block text-xs font-bold text-slate-800">ISO 27001:2022</span>
                                            <span className="block text-[10px] text-slate-400">Chứng nhận quốc tế</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CARD 3: Card Tiêu chuẩn 1 (Span 1 col) - Chia sẻ & Phân quyền */}
                            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col justify-between group">
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-600 group-hover:scale-105 transition-transform shadow-2xs">
                                        <Share2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">Chia sẻ & Phân quyền</h3>
                                    <p className="text-slate-600 text-xs leading-relaxed">
                                        Tạo liên kết chia sẻ kèm mật khẩu bảo vệ, giới hạn thời gian hết hạn và kiểm soát quyền Xem/Sửa.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                                    <span className="text-orange-600 font-bold">Mật khẩu + Hạn dùng</span>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                            </div>

                            {/* CARD 4: Card Tiêu chuẩn 2 (Span 1 col) - Xem trước Đa phương tiện 4K */}
                            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group">
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform shadow-2xs">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">Xem trước Media 4K</h3>
                                    <p className="text-slate-600 text-xs leading-relaxed">
                                        Stream video 4K trực tiếp, phát âm thanh lossless và xem nhanh hơn 50+ định dạng tài liệu ngay trên web.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                                    <span className="text-sky-600 font-bold">Không cần cài app</span>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                            </div>

                            {/* CARD 5: Card Tiêu chuẩn 3 (Span 1 col) - Quản lý Dung lượng Quota */}
                            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between group">
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform shadow-2xs">
                                        <Sliders className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">Quản lý Dung lượng Quota</h3>
                                    <p className="text-slate-600 text-xs leading-relaxed">
                                        Báo cáo chi tiết biểu đồ lưu trữ theo định dạng tệp, hỗ trợ mở rộng linh hoạt theo nhu cầu mở rộng.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                                    <span className="text-amber-600 font-bold">Mở rộng linh hoạt</span>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                            </div>

                            {/* CARD 6: Card Tiêu chuẩn 4 (Span 1 col) - Lịch sử & Khôi phục 30 Ngày */}
                            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group">
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shadow-2xs">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">Khôi phục 30 Ngày</h3>
                                    <p className="text-slate-600 text-xs leading-relaxed">
                                        Lịch sử phiên bản tệp chi tiết. Thùng rác thông minh lưu giữ dữ liệu an toàn phòng ngừa thao tác nhầm lẫn.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                                    <span className="text-emerald-600 font-bold">Bảo vệ chống xóa nhầm</span>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* FINAL CTA BANNER */}
                    <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-12 text-white overflow-hidden shadow-2xl border border-slate-700/50">
                        {/* Ambient Glow inside Banner */}
                        <div className="absolute top-0 right-0 -z-0 w-96 h-96 bg-orange-500/15 blur-3xl rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -z-0 w-96 h-96 bg-sky-500/15 blur-3xl rounded-full pointer-events-none" />
                        
                        <div className="relative z-10 max-w-2xl space-y-4">
                            <span className="inline-block text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 uppercase tracking-wider">
                                Sẵn sàng nâng cấp không gian lưu trữ?
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                                Bắt đầu lưu trữ dữ liệu an toàn với driveR ngay hôm nay.
                            </h2>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Đăng ký nhanh chóng, nhận ngay 15 GB dung lượng miễn phí trọn đời cùng trải nghiệm Gemini AI mượt mà.
                            </p>
                            <div className="pt-2 flex flex-wrap items-center gap-3.5">
                                <button
                                    onClick={handleAccess}
                                    className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    <span>Tạo tài khoản miễn phí</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-slate-400 font-medium">Không yêu cầu thẻ tín dụng</span>
                            </div>
                        </div>
                    </div>

                </main>

                {/* COMPREHENSIVE VIETNAMESE ENTERPRISE FOOTER (Compact & Refined Typography) */}
                <footer className="w-full border-t border-slate-200/80 bg-white/90 backdrop-blur-md pt-12 pb-8 text-slate-600 text-xs mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
                        
                        {/* 4 Main Footer Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            
                            {/* Column 1: Company Profile */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-500 flex items-center justify-center shadow-sm text-white">
                                        <HardDrive className="w-4 h-4" />
                                    </div>
                                    <span className="text-base font-extrabold tracking-tight text-slate-900">driveR Cloud</span>
                                </div>
                                <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                                    CÔNG TY CỔ PHẦN CÔNG NGHỆ BẢO MẬT & ĐÁM MÂY DRIVER VIỆT NAM
                                </p>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Mã số doanh nghiệp: 0109876543 do Sở Kế hoạch & Đầu tư TP. Hà Nội cấp lần đầu ngày 15/10/2022.
                                </p>
                                <div className="space-y-1.5 text-[11px] text-slate-600 pt-1">
                                    <div className="flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                        <span><strong>Hà Nội:</strong> Tầng 18, Keangnam Landmark 72, Đ. Phạm Hùng, Q. Nam Từ Liêm.</span>
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                                        <span><strong>TP.HCM:</strong> Tầng 12, Bitexco Financial Tower, 2 Hải Triều, Q.1.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Contact Information */}
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Thông tin liên hệ</h4>
                                <ul className="space-y-2 text-[11px] text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Hotline CSKH (24/7): <strong className="text-slate-900">1900 6888</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Tổng đài Doanh nghiệp: <strong className="text-slate-900">024.7300.9999</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-sky-600" />
                                        <span>Email hỗ trợ: <a href="mailto:hotro@driver.vn" className="text-sky-600 hover:underline">hotro@driver.vn</a></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-sky-600" />
                                        <span>Hợp tác B2B: <a href="mailto:b2b@driver.vn" className="text-sky-600 hover:underline">b2b@driver.vn</a></span>
                                    </li>
                                    <li className="text-[10px] text-slate-400 pt-0.5">
                                        * Thời gian làm việc: Thứ 2 - Thứ 7 (08:00 - 18:00)
                                    </li>
                                </ul>
                            </div>

                            {/* Column 3: Certifications & Licenses */}
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Chứng nhận & Giấy phép</h4>
                                <ul className="space-y-2 text-[11px] text-slate-600">
                                    <li className="flex items-start gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                        <span><strong>Bộ Thông tin & Truyền thông:</strong> Giấy phép Dịch vụ Lưu trữ Đám mây Số 188/GP-BTTTT.</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Cục An toàn Thông tin:</strong> Chứng nhận ATTT Cấp độ 3 (TCVN 11930:2017).</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <Award className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                                        <span><strong>Tiêu chuẩn Quốc tế:</strong> ISO/IEC 27001:2022 & ISO/IEC 27017 (Cloud Security).</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>Tuân thủ Luật An ninh mạng & Nghị định 13/2023/NĐ-CP.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 4: Official Ministry Badge & Legal Links */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Xác thực Bộ Công Thương</h4>
                                
                                {/* Official "Đã Thông Báo Bộ Công Thương" Badge */}
                                <div className="inline-flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-sky-200/90 shadow-2xs hover:border-sky-400 transition-all cursor-pointer group">
                                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 group-hover:scale-105 transition-transform">
                                        <Award className="w-4 h-4 text-sky-600" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-[9px] font-extrabold uppercase text-sky-600 tracking-wider">Đã Thông Báo</span>
                                        <span className="block text-[11px] font-bold text-slate-900">BỘ CÔNG THƯƠNG</span>
                                        <span className="block text-[8px] text-slate-400 font-mono">BCT Verified ID: #8921</span>
                                    </div>
                                </div>

                                <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                                    <a href="#security" className="block hover:text-slate-900 transition-colors">• Điều khoản dịch vụ & Sử dụng</a>
                                    <a href="#security" className="block hover:text-slate-900 transition-colors">• Chính sách bảo mật dữ liệu cá nhân</a>
                                    <a href="#security" className="block hover:text-slate-900 transition-colors">• Cam kết chất lượng dịch vụ (SLA 99.99%)</a>
                                </div>
                            </div>

                        </div>

                        {/* Footer Bottom Bar */}
                        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
                            <div className="flex items-center gap-1.5">
                                <HardDrive className="w-3.5 h-3.5 text-orange-500" />
                                <span className="font-bold text-slate-800">driveR Cloud</span>
                                <span>© 2026 Ecosystem Inc. Tất cả quyền được bảo lưu.</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* GitHub */}
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="GitHub"
                                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 hover:text-black hover:border-slate-400 hover:scale-105 transition-all"
                                >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                    </svg>
                                </a>

                                {/* Facebook */}
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Facebook"
                                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-sky-600 hover:border-sky-400 hover:scale-105 transition-all"
                                >
                                    <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>

                                {/* LinkedIn */}
                                <a
                                    href="https://linkedin.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="LinkedIn"
                                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-sky-700 hover:border-sky-400 hover:scale-105 transition-all"
                                >
                                    <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                    </div>
                </footer>

            </div>
        </div>
    );
}
