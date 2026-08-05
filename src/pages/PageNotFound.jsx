import { Home, ArrowLeft } from 'lucide-react';

export default function PageNotFound({ onGoHome }) {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/30 rounded-3xl flex items-center justify-center mb-6 text-blue-400">
                <span className="text-3xl font-extrabold">404</span>
            </div>
            <h1 className="text-3xl font-extrabold mb-2">Trang không tồn tại</h1>
            <p className="text-slate-400 text-sm max-w-md mb-8">
                Đường dẫn bạn yêu cầu không khả dụng hoặc đã được di chuyển sang một vị trí mới.
            </p>
            <button
                onClick={onGoHome}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
            </button>
        </div>
    );
}
