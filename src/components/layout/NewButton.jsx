export default function NewButton() {
    return (
        <div className="relative inline-block">
            <button
                className="flex items-center gap-3 bg-white border-none rounded-2xl pl-4 pr-6 py-[14px] shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:bg-[#f5f6f8] hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] transition-all min-w-[100px] text-gray-700 cursor-pointer"
            >
                {/* Icon dấu + (Material Icon chuẩn) */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z"></path>
                </svg>
                <span className="text-[14px] font-medium tracking-wide">Mới</span>
            </button>

            {/* Chỗ này sau sẽ chứa Dropdown */}
        </div>
    );
}