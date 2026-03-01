import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const BottomNav = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) return null;

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 px-4 py-2 pb-safe" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
            <div className="flex justify-between items-center max-w-md mx-auto">
                <Link to="/" className={`flex flex-col items-center p-2 transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                    <Home className={`w-6 h-6 ${isActive('/') ? 'fill-current' : ''}`} />
                    <span className="text-[10px] mt-1 font-medium">Home</span>
                </Link>
                <Link to="/search" className={`flex flex-col items-center p-2 transition-colors ${isActive('/search') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                    <Search className={`w-6 h-6 ${isActive('/search') ? 'text-blue-600' : ''}`} />
                    <span className="text-[10px] mt-1 font-medium">Search</span>
                </Link>
                <Link to="/create-report" className="flex flex-col items-center px-2 relative -top-5">
                    <div className="bg-blue-600 text-white rounded-full p-4 shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 transition-all font-bold">
                        <Plus className="w-7 h-7" />
                    </div>
                </Link>
                <Link to="/chat" className={`flex flex-col items-center p-2 transition-colors ${isActive('/chat') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                    <MessageCircle className={`w-6 h-6 ${isActive('/chat') ? 'fill-current' : ''}`} />
                    <span className="text-[10px] mt-1 font-medium">Chat</span>
                </Link>
                <Link to="/profile" className={`flex flex-col items-center p-2 transition-colors ${isActive('/profile') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                    <User className={`w-6 h-6 ${isActive('/profile') ? 'fill-current' : ''}`} />
                    <span className="text-[10px] mt-1 font-medium">Profile</span>
                </Link>
            </div>
        </nav>
    );
};
