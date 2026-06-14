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
        <div className="min-h-screen bg-background flex flex-col">

            {/* ── TOP NAVIGATION BAR (never moves) ── */}
            <header className="h-16 w-full bg-stone-950 dark:bg-stone-900 border-b border-stone-800 flex items-center px-4 md:px-6 gap-4 shrink-0 z-50">

                {/* Brand */}
                <Link to="/" className="flex items-center gap-2.5 group mr-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-stone-950 text-sm shadow-md group-hover:bg-amber-400 transition-colors">
                        W
                    </div>
                    <div className="hidden sm:flex flex-col leading-none">
                        <span className="text-white font-bold text-sm tracking-tight">Wasit Admin</span>
                        <span className="text-stone-500 text-[10px] uppercase tracking-widest font-semibold">Control Center</span>
                    </div>
                </Link>

                {/* Separator */}
                <div className="hidden md:block h-6 w-px bg-stone-700 mr-2" />

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-1">
                    {links.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    isActive
                                        ? "bg-stone-800 text-amber-400"
                                        : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                                }`}
                            >
                                <span className={isActive ? "text-amber-400" : "text-stone-500"}>
                                    {link.icon}
                                </span>
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Current Page Breadcrumb (desktop) */}
                <div className="hidden md:flex items-center gap-2 text-sm text-stone-500 font-medium">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-stone-300">{currentTitle}</span>
                </div>

                {/* Back to App (desktop) */}
                <Link
                    to="/"
                    className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to App</span>
                </Link>

                {/* Mobile: Page title + hamburger */}
                <span className="md:hidden text-white font-bold text-base">{currentTitle}</span>
                <button
                    className="md:hidden p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* ── BODY: content area (scrollable) ── */}
            <div className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
                <Outlet />
            </div>

            {/* ── MOBILE SIDEBAR DRAWER ── */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 w-72 bg-stone-950 border-r border-stone-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Drawer header */}
                <div className="h-16 px-5 flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-stone-950 text-sm">W</div>
                        <span className="text-white font-bold text-sm">Wasit Admin</span>
                    </div>
                    <button
                        className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Drawer nav */}
                <nav className="flex-1 p-4 space-y-1">
                    <p className="px-3 text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-3 mt-2">
                        Navigation
                    </p>
                    {links.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    isActive
                                        ? "bg-stone-800 text-amber-400"
                                        : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                                }`}
                            >
                                <span className={isActive ? "text-amber-400" : "text-stone-500"}>
                                    {link.icon}
                                </span>
                                {link.name}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Drawer footer */}
                <div className="p-4 border-t border-stone-800">
                    <Link
                        to="/"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to App
                    </Link>
                </div>
            </aside>
        </div>
    );
};
