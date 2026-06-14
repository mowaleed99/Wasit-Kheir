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
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
        <div className="min-h-screen bg-background pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                
                {/* Header Section */}
                <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('admin.dashboard.title', 'Admin Dashboard')}</h1>
                        <p className="text-blue-100 max-w-lg">{t('admin.dashboard.subtitle', 'Manage reports, monitor platform activity, and oversee community guidelines.')}</p>
                    </div>
                </div>

                {/* Dashboard Metrics */}
                {!dashboardLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {/* Metric 1 */}
                        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-between hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('admin.dashboard.totalReports', 'Total Reports')}</p>
                                <p className="text-4xl font-bold text-foreground">{dashboardData.totalReportsCount ?? 0}</p>
                            </div>
                        </div>

                        {/* Metric 2 */}
                        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-between hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Layers className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('admin.dashboard.platformCategories', 'Categories')}</p>
                                <p className="text-4xl font-bold text-foreground">{dashboardData.categoriesCount ?? 0}</p>
                            </div>
                        </div>

                         {/* Metric 3 (Mocked for visual balance) */}
                         <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-between hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900 transition-all group lg:col-span-2 bg-gradient-to-br from-card to-emerald-50/50 dark:to-emerald-900/10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">System Status</p>
                                <p className="text-4xl font-bold text-foreground flex items-center gap-3">
                                    Operational
                                    <span className="flex h-4 w-4 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                    
                    {/* Modern Segmented Tabs */}
                    <div className="p-6 border-b border-border bg-muted/20">
                        <div className="inline-flex bg-muted/50 p-1.5 rounded-2xl border border-border backdrop-blur-sm overflow-x-auto max-w-full scrollbar-hide">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? "bg-background text-foreground shadow-sm scale-100"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80 scale-95"
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-0">
                        {reportsLoading ? (
                            <div className="py-24 text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground font-medium">{t('admin.reports.loading', 'Loading reports...')}</p>
                            </div>
                        ) : reportsError ? (
                            <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1">Error Loading Data</h3>
                                <p className="text-muted-foreground">{t('admin.reports.error', 'Failed to fetch reports. Please try again later.')}</p>
                            </div>
                        ) : reportsList.length === 0 ? (
                            <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                                <div className="w-20 h-20 bg-muted/50 text-muted-foreground rounded-full flex items-center justify-center mb-4 ring-8 ring-muted/20">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {t('admin.reports.noReports', { status: t(`admin.reports.tabs.${activeTab}`).toLowerCase() })}
                                </h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">{t('admin.reports.noReportsDesc', 'There are currently no reports matching this status in the database.')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {reportsList.map((report: any) => (
                                    <Link
                                        key={report.id}
                                        to={`/report/${report.id}`}
                                        className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-6 hover:bg-muted/30 transition-colors group relative"
                                    >
                                        {/* Image */}
                                        <div className="w-full sm:w-32 h-40 sm:h-24 rounded-2xl bg-muted overflow-hidden flex-shrink-0 shadow-sm border border-border group-hover:shadow-md transition-shadow">
                                            {report.images?.[0]?.imageUrl ? (
                                                <img
                                                    src={resolveImageUrl(report.images[0].imageUrl)}
                                                    alt={report.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                                                    <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                                    <span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Core Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                                    report.type.includes('Lost') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                }`}>
                                                    {t(`reportTypes.${report.type}`, { defaultValue: report.type })}
                                                </span>
                                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {report.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground truncate">{report.locationName}</p>
                                        </div>

                                        {/* Creator Info */}
                                        <div className="hidden md:flex items-center gap-3 bg-background border border-border px-4 py-2 rounded-xl">
                                            <img
                                                src={
                                                    report.createdByProfilePictureUrl
                                                        ? resolveImageUrl(report.createdByProfilePictureUrl)
                                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(report.createdByName || "User")}&background=random&color=fff`
                                                }
                                                alt={report.createdByName}
                                                className="w-8 h-8 rounded-full ring-2 ring-background shadow-sm"
                                            />
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reporter</p>
                                                <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">
                                                    {report.createdByName || t('reportDetails.unknownUser')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="hidden sm:flex text-muted-foreground/50 group-hover:text-blue-600 transition-colors group-hover:translate-x-1">
                                            <ChevronRight className="w-6 h-6 rtl:-scale-x-100" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
