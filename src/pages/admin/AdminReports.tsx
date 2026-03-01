import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    useGetApiAdminReports,
    usePutApiAdminReportsIdApprove,
    usePutApiAdminReportsIdReject,
    usePutApiAdminReportsIdFlag,
    usePutApiAdminReportsIdArchive,
    useDeleteApiAdminReportsId,
} from "@/api/generated/admin/admin";
import { queryClient } from "@/api";
import { CheckCircle, XCircle, Search, Clock, Flag, Archive, Trash2, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGetApiHomeDashboard } from "@/api/generated/home/home";

export const AdminReports: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected" | "Flagged" | "Archived">("Pending");

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

    const { mutate: approveReport, isPending: isApproving } = usePutApiAdminReportsIdApprove();
    const { mutate: rejectReport, isPending: isRejecting } = usePutApiAdminReportsIdReject();
    const { mutate: flagReport, isPending: isFlagging } = usePutApiAdminReportsIdFlag();
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

    const isAnyActionPending = isApproving || isRejecting || isFlagging || isArchiving || isDeleting;

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Manage Reports</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Review, approve, flag, or delete user-submitted reports.</p>
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
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Reports</p>
                            <p className="text-3xl font-bold text-foreground mt-1">{dashboardData.totalReportsCount ?? 0}</p>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center gap-5">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Platform Categories</p>
                            <p className="text-3xl font-bold text-foreground mt-1">{dashboardData.categoriesCount ?? 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border overflow-x-auto pb-1">
                {(["Pending", "Approved", "Rejected", "Flagged", "Archived"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                            ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {reportsLoading ? (
                    <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading reports...</p>
                    </div>
                ) : reportsError ? (
                    <div className="text-center py-12 bg-red-50 dark:bg-red-900/20">
                        <p className="text-red-600 dark:text-red-400">Failed to load reports.</p>
                    </div>
                ) : reportsList.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No {activeTab.toLowerCase()} reports</h3>
                        <p className="text-muted-foreground mt-1 text-sm">There are currently no reports in this category.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted border-b border-border text-xs uppercase text-muted-foreground">
                                    <th className="px-6 py-4 font-semibold">Report Details</th>
                                    <th className="px-6 py-4 font-semibold">Creator</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
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
                                                            src={`https://wasitkheir.runasp.net${report.images[0].imageUrl}`}
                                                            alt={report.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                            No Image
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
                                                            {report.type}
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
                                                            ? `https://wasitkheir.runasp.net${report.createdByProfilePictureUrl}`
                                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                report.createdByName || "User"
                                                            )}&background=random&color=fff`
                                                    }
                                                    alt={report.createdByName}
                                                    className="w-8 h-8 rounded-full border border-border"
                                                />
                                                <span className="text-sm text-foreground font-medium">
                                                    {report.createdByName || "Unknown User"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Pending actions */}
                                                {activeTab === "Pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(approveReport, report.id)}
                                                            disabled={isAnyActionPending}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(rejectReport, report.id)}
                                                            disabled={isAnyActionPending}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}

                                                {/* Approved actions */}
                                                {activeTab === "Approved" && (
                                                    <button
                                                        onClick={() => handleAction(archiveReport, report.id)}
                                                        disabled={isAnyActionPending}
                                                        className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors disabled:opacity-50"
                                                        title="Archive"
                                                    >
                                                        <Archive className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {/* Extra universal actions */}
                                                <button
                                                    onClick={() => handleAction(flagReport, report.id)}
                                                    disabled={isAnyActionPending}
                                                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors disabled:opacity-50 ml-2"
                                                    title="Flag"
                                                >
                                                    <Flag className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm("Are you sure you want to permanently delete this report?")) {
                                                            handleAction(deleteReport, report.id);
                                                        }
                                                    }}
                                                    disabled={isAnyActionPending}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                                                    title="Delete"
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
