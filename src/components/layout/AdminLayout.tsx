import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { FileText, Users, FolderTree, ArrowLeft, Menu, X, Database, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

export const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const { toggleLanguage } = useSettings();
    const { logout } = useAuth();

    const links = [
        { name: t('admin.sidebar.reports', 'Reports'), path: "/admin/reports", icon: <FileText className="w-5 h-5" /> },
        { name: t('admin.sidebar.users', 'Users'), path: "/admin/users", icon: <Users className="w-5 h-5" /> },
        { name: t('admin.sidebar.categories', 'Categories'), path: "/admin/categories", icon: <FolderTree className="w-5 h-5" /> },
        { name: t('admin.sidebar.scraper', 'Scraper'), path: "/admin/scraper", icon: <Database className="w-5 h-5" /> },
    ];

    const currentTitle = links.find((l) => location.pathname.startsWith(l.path))?.name || t('admin.dashboard.title', 'Dashboard');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex font-sans transition-colors duration-200">

            {/* ── DESKTOP VERTICAL SIDEBAR ── */}
            <aside className="hidden md:flex w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col z-10 h-screen sticky top-0">
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <Link to="/admin" className="flex items-center gap-3">
                        <img
                            src="/logo2.png"
                            alt="Waseet Kheir Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-gray-900 dark:text-white font-bold text-lg">{t('admin.sidebar.title', 'Admin')}</span>
                    </Link>
                </div>

                {/* Desktop Nav Links */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 mt-2">
                        {t('admin.sidebar.menu', 'Menu')}
                    </p>
                    {links.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                            >
                                <span className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}>
                                    {link.icon}
                                </span>
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2 shrink-0">
                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all"
                    >
                        {i18n.language === "ar" ? "English" : "العربية"}
                    </button>
                    <Link
                        to="/"
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                        {t('admin.sidebar.backToApp', 'Back to App')}
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        {t('auth.logout', 'Log out')}
                    </button>
                </div>
            </aside>

            {/* ── RIGHT COLUMN: Content area ── */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                
                {/* Mobile Top Bar */}
                <header className="md:hidden h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo2.png"
                            alt="Waseet Kheir Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-gray-900 dark:text-white font-semibold text-base">{currentTitle}</span>
                    </div>
                    <button
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* ── MOBILE SIDEBAR DRAWER ── */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm z-50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Drawer header */}
                <div className="h-16 px-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo2.png"
                            alt="Waseet Kheir Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-gray-900 dark:text-white font-bold">{t('admin.sidebar.title', 'Admin')}</span>
                    </div>
                    <button
                        className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Drawer nav */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 mt-2">
                        {t('admin.sidebar.menu', 'Menu')}
                    </p>
                    {links.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                            >
                                <span className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}>
                                    {link.icon}
                                </span>
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Drawer footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all"
                    >
                        {i18n.language === "ar" ? "English" : "العربية"}
                    </button>
                    <Link
                        to="/"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                        {t('admin.sidebar.backToApp', 'Back to App')}
                    </Link>
                    <button
                        onClick={() => { setIsSidebarOpen(false); logout(); }}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all w-full"
                    >
                        <LogOut className="w-4 h-4" />
                        {t('auth.logout', 'Log out')}
                    </button>
                </div>
            </aside>
        </div>
    );
};
