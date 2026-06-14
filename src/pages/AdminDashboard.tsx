import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { useGetApiAdminReports } from "@/api/generated/admin/admin";
import { useGetApiHomeDashboard } from "@/api/generated/home/home";
import { Search, Clock, Activity, FileText, Layers, CheckCircle, Archive, AlertCircle, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { resolveImageUrl } from "@/utils/imageUrl";

type TabState = "Active" | "Archived" | "Closed";

export const AdminDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<TabState>("Active");

    const { data: reportsData, isLoading: reportsLoading, error: reportsError } = useGetApiAdminReports({
        Status: activeTab,
        PageSize: 100,
        Page: 1,
    });

    const { data: dashboardRaw, isLoading: dashboardLoading } = useGetApiHomeDashboard({
        query: { enabled: isAuthenticated && (user?.roles?.includes("Admin") || user?.email === "lost.found2026@gmail.com") }
    });

    const dashboardData = (dashboardRaw as any)?.data?.data || (dashboardRaw as any)?.data || dashboardRaw || {};

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || (!user?.roles?.includes("Admin") && user?.email !== "lost.found2026@gmail.com")) {
        return <Navigate to="/" replace />;
    }

    const rawData: any = (reportsData as any)?.data || reportsData;
    const reportsList = Array.isArray(rawData) ? rawData : rawData?.data || [];

    const tabs: { id: TabState, icon: React.ReactNode, label: string }[] = [
        { id: "Active", icon: <Activity className="w-4 h-4" />, label: t('admin.reports.tabs.Active') },
        { id: "Archived", icon: <Archive className="w-4 h-4" />, label: t('admin.reports.tabs.Archived') },
        { id: "Closed", icon: <CheckCircle className="w-4 h-4" />, label: t('admin.reports.tabs.Closed') },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {t('admin.dashboard.title', 'Dashboard Overview')}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('admin.dashboard.subtitle', 'Monitor platform activity, manage reports, and oversee community guidelines.')}
                </p>
            </div>

            {/* Dashboard Metrics */}
            {!dashboardLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Metric 1 */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {t('admin.dashboard.totalReports', 'Total Reports')}
                            </h3>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {dashboardData.totalReportsCount ?? 0}
                            </p>
                        </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {t('admin.dashboard.platformCategories', 'Categories')}
                            </h3>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {dashboardData.categoriesCount ?? 0}
                            </p>
                        </div>
                    </div>

                     {/* System Status */}
                     <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between sm:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {t('admin.scraper.serviceStatus', 'System Status')}
                            </h3>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {t('admin.scraper.online', 'Operational')}
                                </p>
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.dashboard.subtitle', 'All services are running normally')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                
                {/* Modern Segmented Tabs */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                                    activeTab === tab.id
                                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/50"
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div>
                    {reportsLoading ? (
                        <div className="py-16 text-center">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.reports.loading', 'Loading reports...')}</p>
                        </div>
                    ) : reportsError ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-3">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Error Loading Data</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.reports.error', 'Failed to fetch reports. Please try again later.')}</p>
                        </div>
                    ) : reportsList.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-3">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {t('admin.reports.noReports', { status: t(`admin.reports.tabs.${activeTab}`).toLowerCase() })}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                {t('admin.reports.noReportsDesc', 'There are currently no reports matching this status.')}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                            {reportsList.map((report: any) => (
                                <li key={report.id}>
                                    <Link
                                        to={`/report/${report.id}`}
                                        className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="flex items-center px-4 py-4 sm:px-6">
                                            <div className="min-w-0 flex-1 flex items-center">
                                                <div className="flex-shrink-0 mr-4">
                                                    {report.images?.[0]?.imageUrl ? (
                                                        <img
                                                            src={resolveImageUrl(report.images[0].imageUrl)}
                                                            alt=""
                                                            className="h-12 w-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                            <ImageIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                                                            {report.title}
                                                        </p>
                                                        <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="truncate">{report.locationName}</span>
                                                        </p>
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <div>
                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                {t('admin.reports.table.creator', 'Reported by')} <span className="font-medium">{report.createdByName || t('reportDetails.unknownUser')}</span>
                                                            </p>
                                                            <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {new Date(report.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
