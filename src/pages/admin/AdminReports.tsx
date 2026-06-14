import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    useGetApiAdminReports,
    usePutApiAdminReportsIdArchive,
    useDeleteApiAdminReportsId,
} from "@/api/generated/admin/admin";
import { queryClient } from "@/api";
import { Search, Clock, Activity, FileText, Layers, CheckCircle, Archive, AlertCircle, Image as ImageIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGetApiHomeDashboard } from "@/api/generated/home/home";
import { useTranslation } from "react-i18next";
import { resolveImageUrl } from "@/utils/imageUrl";

type TabState = "Active" | "Archived" | "Closed";

export const AdminReports: React.FC = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<TabState>("Active");
    const [confirmDialog, setConfirmDialog] = useState<{ action: "delete" | "archive", reportId: number } | null>(null);

    // Fetch reports using the Admin endpoint
    const {
        data: reportsData,
        isLoading: reportsLoading,
        error: reportsError,
    } = useGetApiAdminReports({
        Status: activeTab,
        PageSize: 100,
        Page: 1,
    });

    const { mutate: archiveReport, isPending: isArchiving } = usePutApiAdminReportsIdArchive();
    const { mutate: deleteReport, isPending: isDeleting } = useDeleteApiAdminReportsId();

    // Fetch Dashboard Stats
    const { data: dashboardRaw, isLoading: dashboardLoading } = useGetApiHomeDashboard({
        query: {
            enabled: isAuthenticated && (user?.roles?.includes("Admin") || user?.email === "lost.found2026@gmail.com")
        }
    });
    const dashboardData = (dashboardRaw as any)?.data?.data || (dashboardRaw as any)?.data || dashboardRaw || {};

    // Extract the list of reports
    const rawData: any = (reportsData as any)?.data || reportsData;
    const reportsList = Array.isArray(rawData) ? rawData : rawData?.data || [];

    const invalidateReports = () => {
        queryClient.invalidateQueries({ queryKey: ["/api/Admin/reports"] });
        queryClient.invalidateQueries({ queryKey: ["/api/Home/dashboard"] });
    };

    const handleAction = (actionMutate: any, id: number) => {
        actionMutate({ id }, { onSuccess: invalidateReports });
    };

    const isAnyActionPending = isArchiving || isDeleting;

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
                    {t('admin.reports.title')}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('admin.reports.subtitle')}
                </p>
            </div>

            {/* Dashboard Metrics */}
            {!dashboardLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                    {/* Metric 3 */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
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
                            </div>
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

                {/* Content List */}
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
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('admin.reports.errorTitle', 'Error Loading Data')}</h3>
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
                                <li key={report.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 gap-4 sm:gap-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    {/* Image */}
                                    <div className="flex-shrink-0">
                                        {report.images?.[0]?.imageUrl ? (
                                            <img
                                                src={resolveImageUrl(report.images[0].imageUrl)}
                                                alt=""
                                                className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Core Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                report.type.includes('Lost') ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                                                'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                            }`}>
                                                {t(`reportTypes.${report.type}`, { defaultValue: report.type })}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Link to={`/report/${report.id}`} className="block">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                {report.title}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{report.locationName}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                                        <Link to={`/report/${report.id}`} className="flex-1 sm:flex-none text-center px-3 py-2 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-lg transition-colors">
                                            {t('admin.reports.table.view', 'View')}
                                        </Link>
                                        
                                        {/* Archive button only for active */}
                                        {activeTab === "Active" && (
                                            <button
                                                onClick={() => setConfirmDialog({ action: "archive", reportId: report.id })}
                                                disabled={isAnyActionPending}
                                                className="p-2 text-orange-600 dark:text-orange-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                                                title={t('admin.reports.table.archive')}
                                            >
                                                <Archive className="w-5 h-5" />
                                            </button>
                                        )}

                                        {/* Delete universally available */}
                                        <button
                                            onClick={() => setConfirmDialog({ action: "delete", reportId: report.id })}
                                            disabled={isAnyActionPending}
                                            className="p-2 text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                                            title={t('admin.reports.table.delete')}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                            confirmDialog.action === "delete" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                        }`}>
                            {confirmDialog.action === "delete" ? <Trash2 className="w-6 h-6" /> : <Archive className="w-6 h-6" />}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {confirmDialog.action === "delete" 
                                ? t('admin.reports.table.confirmDeleteTitle', { defaultValue: 'Confirm Deletion' })
                                : t('admin.reports.table.confirmArchiveTitle', { defaultValue: 'Confirm Archive' })}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            {confirmDialog.action === "delete"
                                ? t('admin.reports.table.confirmDelete', { defaultValue: 'Are you sure you want to permanently delete this report? This action cannot be undone.' })
                                : t('admin.reports.table.confirmArchive', { defaultValue: 'Are you sure you want to archive this report? It will be moved from the active list.' })}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                disabled={isAnyActionPending}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                {t('common.cancel', { defaultValue: 'Cancel' })}
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmDialog.action === "delete") {
                                        handleAction(deleteReport, confirmDialog.reportId);
                                    } else {
                                        handleAction(archiveReport, confirmDialog.reportId);
                                    }
                                    setConfirmDialog(null);
                                }}
                                disabled={isAnyActionPending}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center min-w-[5rem] ${
                                    confirmDialog.action === "delete" 
                                        ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900" 
                                        : "bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                }`}
                            >
                                {isAnyActionPending ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : confirmDialog.action === "delete" 
                                    ? t('admin.reports.table.delete', { defaultValue: 'Delete' })
                                    : t('admin.reports.table.archive', { defaultValue: 'Archive' })}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
