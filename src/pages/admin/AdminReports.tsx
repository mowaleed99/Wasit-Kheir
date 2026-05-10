import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    useGetApiAdminReports,
    usePutApiAdminReportsIdArchive,
    useDeleteApiAdminReportsId,
} from "@/api/generated/admin/admin";
import { queryClient } from "@/api";
import { Search, Clock, Archive, Trash2, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGetApiHomeDashboard } from "@/api/generated/home/home";
import { useTranslation } from "react-i18next";
import { resolveImageUrl } from "@/utils/imageUrl";

export const AdminReports: React.FC = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<"Active" | "Archived" | "Closed">("Active");

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
    };

    const handleAction = (actionMutate: any, id: number) => {
        actionMutate({ id }, { onSuccess: invalidateReports });
    };

    const isAnyActionPending = isArchiving || isDeleting;

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">{t('admin.reports.title')}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">{t('admin.reports.subtitle')}</p>
                </div>
            </div>

            {/* Dashboard Stats */}
            {!dashboardLoading && (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-5">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('admin.dashboard.totalReports')}</p>
                            <p className="text-3xl font-bold text-foreground mt-1">{dashboardData.totalReportsCount ?? 0}</p>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-5">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('admin.dashboard.platformCategories')}</p>
                            <p className="text-3xl font-bold text-foreground mt-1">{dashboardData.categoriesCount ?? 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border overflow-x-auto pb-1">
                {(["Active", "Archived", "Closed"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                            ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                            }`}
                    >
                        {t(`admin.reports.tabs.${tab}`)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {reportsLoading ? (
                    <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">{t('admin.reports.loading')}</p>
                    </div>
                ) : reportsError ? (
                    <div className="text-center py-12 bg-red-50 dark:bg-red-900/20">
                        <p className="text-red-600 dark:text-red-400">{t('admin.reports.error')}</p>
                    </div>
                ) : reportsList.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">
                            {t('admin.reports.noReports', { status: t(`admin.reports.tabs.${activeTab}`).toLowerCase() })}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">{t('admin.reports.noReportsDesc')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left rtl:text-right border-collapse">
                            <thead>
                                <tr className="bg-muted border-b border-border text-xs uppercase text-muted-foreground">
                                    <th className="px-6 py-4 font-semibold">{t('admin.reports.table.details')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('admin.reports.table.creator')}</th>
                                    <th className="px-6 py-4 font-semibold">{t('admin.reports.table.date')}</th>
                                    <th className="px-6 py-4 font-semibold text-right rtl:text-left">{t('admin.reports.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {reportsList.map((report: any) => (
                                    <tr key={report.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {/* Thumbnail */}
                                                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border">
                                                    {report.images?.[0]?.imageUrl ? (
                                                        <img
                                                            src={resolveImageUrl(report.images[0].imageUrl)}
                                                            alt={report.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                            {t('admin.reports.table.noImage')}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div>
                                                    <Link
                                                        to={`/report/${report.id}`}
                                                        className="text-sm font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                                                    >
                                                        {report.title}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded border border-border bg-card font-medium">
                                                            {t(`reportTypes.${report.type}`, { defaultValue: report.type })}
                                                        </span>
                                                        <span>{report.locationName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={
                                                        report.createdByProfilePictureUrl
                                                            ? resolveImageUrl(report.createdByProfilePictureUrl)
                                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                report.createdByName || "User"
                                                            )}&background=random&color=fff`
                                                    }
                                                    alt={report.createdByName}
                                                    className="w-8 h-8 rounded-full border border-border"
                                                />
                                                <span className="text-sm text-foreground font-medium">
                                                    {report.createdByName || t('reportDetails.unknownUser')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4 rtl:ml-1 rtl:mr-0" />
                                                {new Date(report.createdAt).toLocaleDateString(t('settings.currentLanguage') === t('settings.arabic') ? 'ar-EG' : 'en-US')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right rtl:text-left">
                                            <div className="flex items-center justify-end rtl:justify-start gap-1">
                                                {/* Active actions */}
                                                {activeTab === "Active" && (
                                                    <button
                                                        onClick={() => handleAction(archiveReport, report.id)}
                                                        disabled={isAnyActionPending}
                                                        className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors disabled:opacity-50"
                                                        title={t('admin.reports.table.archive')}
                                                    >
                                                        <Archive className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {/* Extra universal actions */}
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(t('admin.reports.table.confirmDelete'))) {
                                                            handleAction(deleteReport, report.id);
                                                        }
                                                    }}
                                                    disabled={isAnyActionPending}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                                                    title={t('admin.reports.table.delete')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
