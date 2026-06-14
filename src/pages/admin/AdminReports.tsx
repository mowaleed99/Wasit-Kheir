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
        <div className="w-full pb-12">
            
            {/* Header Section */}
            <div className="mb-8 bg-gradient-to-r from-stone-900 via-stone-800 to-neutral-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">{t('admin.reports.title')}</h1>
                    <p className="text-stone-300 max-w-lg">{t('admin.reports.subtitle')}</p>
                </div>
            </div>

            {/* Dashboard Metrics */}
            {!dashboardLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {/* Metric 1 */}
                    <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-between hover:shadow-md hover:border-amber-200 dark:hover:border-amber-900/50 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('admin.dashboard.totalReports', 'Total Reports')}</p>
                            <p className="text-4xl font-bold text-foreground tracking-tight">{dashboardData.totalReportsCount ?? 0}</p>
                        </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-between hover:shadow-md hover:border-rose-200 dark:hover:border-rose-900/50 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <Layers className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('admin.dashboard.platformCategories', 'Categories')}</p>
                            <p className="text-4xl font-bold text-foreground tracking-tight">{dashboardData.categoriesCount ?? 0}</p>
                        </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-between hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900 transition-all group bg-gradient-to-br from-card to-emerald-50/50 dark:to-emerald-900/10">
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
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm scale-100"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80 scale-95"
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content List */}
                <div className="p-0">
                    {reportsLoading ? (
                        <div className="py-24 text-center">
                            <div className="w-12 h-12 border-4 border-stone-800 dark:border-stone-200 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
                                <div key={report.id} className="flex flex-col lg:flex-row items-start lg:items-center p-6 gap-6 hover:bg-muted/30 transition-colors group relative">
                                    {/* Image */}
                                    <div className="w-full lg:w-32 h-48 lg:h-24 rounded-2xl bg-muted overflow-hidden flex-shrink-0 shadow-sm border border-border group-hover:shadow-md transition-shadow relative">
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
                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
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
                                        <Link to={`/report/${report.id}`} className="inline-block">
                                            <h3 className="text-lg font-bold text-foreground mb-1 truncate hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                                {report.title}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-muted-foreground truncate">{report.locationName}</p>
                                    </div>

                                    {/* Creator Info */}
                                    <div className="flex items-center gap-3 bg-background border border-border px-4 py-2 rounded-xl shrink-0">
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

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center mt-4 lg:mt-0 w-full lg:w-auto justify-end border-t lg:border-none pt-4 lg:pt-0">
                                        <Link to={`/report/${report.id}`} className="px-4 py-2 text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-colors">
                                            View Details
                                        </Link>
                                        
                                        {/* Archive button only for active */}
                                        {activeTab === "Active" && (
                                            <button
                                                onClick={() => setConfirmDialog({ action: "archive", reportId: report.id })}
                                                disabled={isAnyActionPending}
                                                className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 rounded-xl transition-colors disabled:opacity-50"
                                                title={t('admin.reports.table.archive')}
                                            >
                                                <Archive className="w-5 h-5" />
                                            </button>
                                        )}

                                        {/* Delete universally available */}
                                        <button
                                            onClick={() => setConfirmDialog({ action: "delete", reportId: report.id })}
                                            disabled={isAnyActionPending}
                                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors disabled:opacity-50"
                                            title={t('admin.reports.table.delete')}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-3xl p-8 shadow-xl border border-border animate-in fade-in zoom-in duration-200">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${
                            confirmDialog.action === "delete" ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                        }`}>
                            {confirmDialog.action === "delete" ? <Trash2 className="w-6 h-6" /> : <Archive className="w-6 h-6" />}
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            {confirmDialog.action === "delete" 
                                ? t('admin.reports.table.confirmDeleteTitle', { defaultValue: 'Confirm Deletion' })
                                : t('admin.reports.table.confirmArchiveTitle', { defaultValue: 'Confirm Archive' })}
                        </h3>
                        <p className="text-muted-foreground mb-8">
                            {confirmDialog.action === "delete"
                                ? t('admin.reports.table.confirmDelete', { defaultValue: 'Are you sure you want to permanently delete this report? This action cannot be undone.' })
                                : t('admin.reports.table.confirmArchive', { defaultValue: 'Are you sure you want to archive this report? It will be moved from the active list.' })}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                disabled={isAnyActionPending}
                                className="px-6 py-3 font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors"
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
                                className={`px-6 py-3 font-semibold text-white rounded-xl transition-colors flex items-center justify-center min-w-[7rem] ${
                                    confirmDialog.action === "delete" 
                                        ? "bg-red-600 hover:bg-red-700" 
                                        : "bg-orange-600 hover:bg-orange-700"
                                }`}
                            >
                                {isAnyActionPending ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
