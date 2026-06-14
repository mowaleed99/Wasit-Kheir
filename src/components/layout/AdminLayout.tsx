import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FileText, Users, FolderTree, ArrowLeft, Menu, X, Database, LayoutDashboard } from "lucide-react";

export const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const links = [
        { name: "Reports", path: "/admin/reports", icon: <FileText className="w-5 h-5" /> },
        { name: "Users", path: "/admin/users", icon: <Users className="w-5 h-5" /> },
        { name: "Categories", path: "/admin/categories", icon: <FolderTree className="w-5 h-5" /> },
        { name: "Scraper", path: "/admin/scraper", icon: <Database className="w-5 h-5" /> },
    ];

    const currentTitle = links.find((l) => location.pathname.startsWith(l.path))?.name || "Dashboard";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200">

            {/* ── MINIMAL TOP NAVIGATION BAR ── */}
            <header className="h-16 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 md:px-8 gap-6 shrink-0 z-50 transition-colors duration-200 sticky top-0">
                
                {/* Brand */}
                <Link to="/admin" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                        W
                    </div>
                    <div className="hidden sm:flex flex-col leading-tight">
                        <span className="text-gray-900 dark:text-white font-bold text-sm">Admin</span>
                    </div>
                </Link>

                {/* Separator */}
                <div className="hidden md:block h-6 w-px bg-gray-200 dark:bg-gray-700" />

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-2">
                    {links.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
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

                {/* Spacer */}
                <div className="flex-1" />

                {/* Back to App (desktop) */}
                <Link
                    to="/"
                    className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to App</span>
                </Link>

                {/* Mobile: Page title + hamburger */}
                <span className="md:hidden text-gray-900 dark:text-white font-semibold text-base">{currentTitle}</span>
                <button
                    className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* ── BODY: content area ── */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <Outlet />
                </div>
            </main>

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
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">W</div>
                        <span className="text-gray-900 dark:text-white font-bold">Admin</span>
                    </div>
                    <button
                        className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Drawer nav */}
                <nav className="flex-1 p-4 space-y-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 mt-2">
                        Menu
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
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <Link
                        to="/"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to App
                    </Link>
                </div>
            </aside>
        </div>
    );
};
