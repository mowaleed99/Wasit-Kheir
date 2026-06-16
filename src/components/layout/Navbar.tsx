import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Search, Home, Bell, Settings, MessageCircle, ShieldCheck, MapPin, LogOut, User } from "lucide-react";
import { useGetApiNotificationsUnread } from "@/api/generated/notifications/notifications";
import { Link, useLocation } from "react-router-dom";
import { resolveImageUrl } from "@/utils/imageUrl";

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toggleLanguage } = useSettings();
  const { user } = useAuth();
  const location = useLocation();

  const { data: unreadData } = useGetApiNotificationsUnread({
    query: {
      enabled: !!user?.id,
      refetchInterval: 60000,
    },
  });

  const unreadCount =
    (unreadData as any)?.data?.count ??
    (unreadData as any)?.count ??
    unreadData ??
    0;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo & Search Bar */}
        <div className="flex items-center space-x-6 flex-1 max-w-2xl">
          <Link to="/" className="flex-shrink-0 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
              <img
                src="/logo2.png"
                alt="Waseet Kheir"
                className="relative h-10 w-10 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-200 bg-white"
              />
            </div>
          </Link>

          <Link to="/search" className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <div className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-full text-sm text-muted-foreground cursor-pointer hover:bg-muted transition-all">
              {t("search")}
            </div>
          </Link>
        </div>

        {/* Center: Icon Navigation */}
        <div className="hidden md:flex items-center space-x-1 md:space-x-2 mx-4">
          {(user?.roles?.includes("Admin") || user?.email === "lost.found2026@gmail.com") && (
            <Link
              to="/admin"
              className={`p-2.5 rounded-xl transition-all duration-200 relative ${
                isActive("/admin")
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10"
                  : "text-muted-foreground hover:text-blue-600 hover:bg-muted"
              }`}
              title={t("admin.dashboard.title")}
            >
              <ShieldCheck className={`w-6 h-6 ${isActive("/admin") ? "fill-current" : ""}`} />
              {isActive("/admin") && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full mb-1" />
              )}
            </Link>
          )}

          <Link
            to="/"
            className={`p-2.5 rounded-xl transition-all duration-200 relative ${
              isActive("/")
                ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10"
                : "text-muted-foreground hover:text-blue-600 hover:bg-muted"
            }`}
            title="Home"
          >
            <Home className={`w-6 h-6 ${isActive("/") ? "fill-current" : ""}`} />
            {isActive("/") && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full mb-1" />
            )}
          </Link>

          <Link
            to="/nearby"
            className={`p-2.5 rounded-xl transition-all duration-200 relative ${
              isActive("/nearby")
                ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10"
                : "text-muted-foreground hover:text-blue-600 hover:bg-muted"
            }`}
            title="Nearby"
          >
            <MapPin className={`w-6 h-6 ${isActive("/nearby") ? "fill-current" : ""}`} />
            {isActive("/nearby") && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full mb-1" />
            )}
          </Link>

          <Link
            to="/chat"
            className={`p-2.5 rounded-xl transition-all duration-200 relative ${
              isActive("/chat")
                ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10"
                : "text-muted-foreground hover:text-blue-600 hover:bg-muted"
            }`}
            title="Messages"
          >
            <MessageCircle className={`w-6 h-6 ${isActive("/chat") ? "fill-current" : ""}`} />
          </Link>

          <Link
            to="/notifications"
            className={`p-2.5 rounded-xl transition-all duration-200 relative ${
              isActive("/notifications")
                ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10"
                : "text-muted-foreground hover:text-blue-600 hover:bg-muted"
            }`}
            title="Notifications"
          >
            <Bell className={`w-6 h-6 ${isActive("/notifications") ? "fill-current" : ""}`} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/settings"
            className={`p-2.5 rounded-xl transition-all duration-200 relative ${
              isActive("/settings")
                ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10"
                : "text-muted-foreground hover:text-blue-600 hover:bg-muted"
            }`}
            title="Settings"
          >
            <Settings className={`w-6 h-6 ${isActive("/settings") ? "fill-current" : ""}`} />
          </Link>
        </div>

        {/* Right: Language toggle + avatar dropdown */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Button
            onClick={toggleLanguage}
            variant="ghost"
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors hidden sm:block"
          >
            {i18n.language === "ar" ? "EN" : "AR"}
          </Button>

          {/* Mobile search */}
          <Link
            to="/search"
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-blue-600 hover:bg-muted transition-all"
            title={t("search")}
          >
            <Search className="w-5 h-5" />
          </Link>

          <UserMenu user={user} />
        </div>
      </div>
    </nav>
  );
};

/* ── Avatar dropdown (fixed position — never causes overflow) ── */
const UserMenu: React.FC<{ user: any }> = ({ user }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const getMenuStyle = (): React.CSSProperties => {
    if (!btnRef.current) return { position: "fixed", top: 64, right: 16 };
    const rect = btnRef.current.getBoundingClientRect();
    const isRTL = document.documentElement.dir === "rtl" || document.documentElement.lang === "ar";
    if (isRTL) {
      return {
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
      };
    }
    return {
      position: "fixed",
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    };
  };

  return (
    <>
      <button
        ref={btnRef}
        id="user-avatar-btn"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center group focus:outline-none"
        aria-label="User menu"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity" />
          <img
            src={
              user?.profilePictureUrl
                ? resolveImageUrl(user.profilePictureUrl)
                : user?.avatar
                ? user.avatar
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=3b82f6&color=fff`
            }
            alt={user?.fullName || "User"}
            className="relative w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-blue-100 transition-all"
          />
        </div>
      </button>

      {open && (
        <div
          ref={menuRef}
          style={getMenuStyle()}
          className="w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-[9999]"
        >
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || ""}
            </p>
          </div>

          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <User className="w-4 h-4 text-gray-400" />
            {t("profile.title", "Profile")}
          </Link>

          <button
            id="logout-btn"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("auth.logout", "Log out")}
          </button>
        </div>
      )}
    </>
  );
};
