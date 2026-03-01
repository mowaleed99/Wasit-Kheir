import { Link, useLocation } from "react-router-dom";
import { Home, Plus, MessageCircle, User, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const BottomNav = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) return null;

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    const navItem = (to: string, icon: React.ReactNode, label: string) => (
        <Link
            to={to}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${isActive(to) ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground'
                }`}
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-50"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
            <div className="flex justify-around items-center max-w-md mx-auto px-2 pt-2 pb-1">
                {navItem('/', <Home className={`w-6 h-6 ${isActive('/') ? 'fill-current' : ''}`} />, 'Home')}
                {navItem('/nearby', <MapPin className={`w-6 h-6 ${isActive('/nearby') ? 'fill-current' : ''}`} />, 'Nearby')}

                {/* Floating Create Button */}
                <Link to="/create-report" className="flex flex-col items-center relative -top-4">
                    <div className="bg-blue-600 text-white rounded-full p-4 shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
                        <Plus className="w-6 h-6" />
                    </div>
                </Link>

                {navItem('/chat', <MessageCircle className={`w-6 h-6 ${isActive('/chat') ? 'fill-current' : ''}`} />, 'Chat')}
                {navItem('/profile', <User className={`w-6 h-6 ${isActive('/profile') ? 'fill-current' : ''}`} />, 'Profile')}
            </div>
        </nav>
    );
};
