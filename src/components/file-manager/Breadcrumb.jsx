import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ path = [], onNavigate }) {
    return (
        <nav className="flex items-center gap-1.5 text-sm text-gray-600 font-medium overflow-x-auto py-1">
            <button
                onClick={() => onNavigate && onNavigate(null)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors shrink-0"
            >
                <Home className="w-4 h-4 text-gray-500" />
                <span>Driver riêng của tôi</span>
            </button>

            {path.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-1 shrink-0">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <button
                        onClick={() => onNavigate && onNavigate(item.id)}
                        className={`hover:text-blue-600 transition-colors ${
                            index === path.length - 1 ? 'font-bold text-gray-900' : 'text-gray-600'
                        }`}
                    >
                        {item.name}
                    </button>
                </div>
            ))}
        </nav>
    );
}
