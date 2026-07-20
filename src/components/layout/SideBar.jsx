import NewButton from './NewButton';

export default function Sidebar() {
    return (
        <aside className="w-[256px] h-screen bg-[#f8fafd] flex flex-col pt-3">
            {/* Vùng chứa nút + Mới, căn trái bằng pl-4 */}
            <div className="mb-4 pl-4 flex justify-start">
                <NewButton />
            </div>

            {/* Menu điều hướng */}
            <nav className="flex-1 px-4 space-y-1">
                {/* Active item (Đang chọn) */}
                <a href="#" className="flex items-center px-4 py-[10px] text-[14px] font-medium text-[#0b57d0] bg-[#c2e7ff] rounded-full">
                    Drive của tôi
                </a>

                {/* Inactive items (Chưa chọn) */}
                <a href="#" className="flex items-center px-4 py-[10px] text-[14px] font-medium text-gray-700 hover:bg-gray-200 rounded-full transition-colors mt-1">
                    Được chia sẻ với tôi
                </a>
                <a href="#" className="flex items-center px-4 py-[10px] text-[14px] font-medium text-gray-700 hover:bg-gray-200 rounded-full transition-colors mt-1">
                    Gần đây
                </a>
                <a href="#" className="flex items-center px-4 py-[10px] text-[14px] font-medium text-gray-700 hover:bg-gray-200 rounded-full transition-colors mt-1">
                    Thùng rác
                </a>
            </nav>
        </aside>
    );
}