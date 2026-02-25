import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Search, Home, Bell, Settings, MessageCircle, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { toggleLanguage } = useSettings();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo & Search Bar */}
        <div className="flex items-center space-x-6 flex-1 max-w-2xl">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
              <img
                src="/logo.jpg"
                alt="Lost & Found"
                className="relative h-10 w-10 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          </Link>

          {/* Search Bar */}
          <Link to="/search" className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <div
              className="w-full pl-10 pr-4 py-2 bg-gray-100/50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm text-gray-400 cursor-pointer hover:bg-gray-100"
            >
              {t("search")}
            </div>
          </Link>
        </div>

        {/* Center: Icon Navigation */}
        <div className="flex items-center space-x-1 md:space-x-2 mx-4">
          {(user?.roles?.includes("Admin") || user?.email === "lost.found2026@gmail.com") && (
            <Link
              to="/admin"
              className={`p-2.5 rounded-xl transition-all duration-200 group relative ${isActive("/admin")
                ? "text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                }`}
              title="Admin Dashboard"
            >
              <ShieldCheck className={`w-6 h-6 ${isActive("/admin") ? "fill-current" : ""}`} />
              {isActive("/admin") && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full mb-1"></span>
              )}
            </Link>
          )}

          <Link
            to="/"
            className={`p-2.5 rounded-xl transition-all duration-200 group relative ${isActive("/")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              }`}
            title="Home"
          >
            <Home className={`w-6 h-6 ${isActive("/") ? "fill-current" : ""}`} />
            {isActive("/") && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full mb-1"></span>
            )}
          </Link>

          <Link
            to="/chat"
            className={`p-2.5 rounded-xl transition-all duration-200 group relative ${isActive("/chat")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              }`}
            title="Chat"
          >
            <MessageCircle className={`w-6 h-6 ${isActive("/chat") ? "fill-current" : ""}`} />
            {/* Unread Badge Placeholder */}
            {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span> */}
          </Link>

          <Link
            to="/notifications"
            className={`p-2.5 rounded-xl transition-all duration-200 group relative ${isActive("/notifications")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              }`}
            title="Notifications"
          >
            <Bell className={`w-6 h-6 ${isActive("/notifications") ? "fill-current" : ""}`} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </Link>

          <Link
            to="/settings"
            className={`p-2.5 rounded-xl transition-all duration-200 group relative ${isActive("/settings")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              }`}
            title="Settings"
          >
            <Settings className={`w-6 h-6 ${isActive("/settings") ? "fill-current" : ""}`} />
          </Link>
        </div>

        {/* Right: User Profile & Language Toggle */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={toggleLanguage}
            variant="ghost"
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors hidden sm:block"
          >
            EN/AR
          </Button>

          <Link to="/profile" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <img
                src={user?.avatar || user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=3b82f6&color=fff`}
                alt={user?.fullName || 'User'}
                className="relative w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-blue-100 transition-all"
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};
