import Sidebar from './SideBar.jsx';

export default function MainLayout({ children }) {
    return (
        <div className="flex h-screen w-full bg-white text-gray-900 font-sans overflow-hidden">
            <Sidebar />

            {/* Vùng nội dung chính */}
            <main className="flex-1 flex flex-col bg-white rounded-tl-2xl overflow-hidden shadow-[rgba(0,0,0,0.1)_0px_0px_10px_0px]">
                {/* Header tạm thời */}
                <header className="h-16 border-b border-gray-100 flex items-center px-6 bg-white">
                    <input
                        type="text"
                        placeholder="Tìm kiếm trong Drive"
                        className="w-full max-w-2xl bg-gray-100 border-none rounded-full px-6 py-2 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                </header>

                {/* Vùng render trang con */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}