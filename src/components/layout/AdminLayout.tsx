import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FileText, Users, FolderTree, ArrowLeft, Menu, X } from "lucide-react";

export const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const links = [
        { name: "Reports", path: "/admin/reports", icon: <FileText className="w-5 h-5" /> },
        { name: "Users", path: "/admin/users", icon: <Users className="w-5 h-5" /> },
        { name: "Categories", path: "/admin/categories", icon: <FolderTree className="w-5 h-5" /> },
    ];

    const currentTitle = links.find((l) => location.pathname.startsWith(l.path))?.name || "Admin Dashboard";

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col shadow-xl md:shadow-sm z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsSidebarOpen(false)}>
                        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:bg-blue-700 transition-colors">
                            WK
                        </div>
                        <span className="font-bold text-gray-900 tracking-tight">Wasit Admin</span>
                    </Link>
                    <button
                        className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
                        Management
                    </p>
                    {links.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${isActive
                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <div className={`${isActive ? "text-blue-600" : "text-gray-400"}`}>
                                    {link.icon}
                                </div>
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">{currentTitle}</h1>
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm z-10 hidden md:block">
                    <h1 className="text-xl font-bold text-gray-800">{currentTitle}</h1>
                </header>

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
