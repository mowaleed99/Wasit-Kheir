import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, Navigate } from "react-router-dom";
import {
    useGetApiAdminReports,
    usePutApiAdminReportsIdApprove,
    usePutApiAdminReportsIdReject,
} from "@/api/generated/admin/admin";
import { useGetApiHomeDashboard } from "@/api/generated/home/home";
import { queryClient } from "@/api";
import { CheckCircle, XCircle, Search, Clock, Activity } from "lucide-react";

export const AdminDashboard: React.FC = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected">("Pending");

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

    // Fetch Dashboard Stats
    const { data: dashboardRaw, isLoading: dashboardLoading } = useGetApiHomeDashboard({
        query: {
            enabled: isAuthenticated && (user?.roles?.includes("Admin") || user?.email === "lost.found2026@gmail.com")
        }
    });

    const dashboardData = (dashboardRaw as any)?.data?.data || (dashboardRaw as any)?.data || dashboardRaw || {};
    console.log("Admin Dashboard Stats raw:", dashboardRaw);
    console.log("Admin Dashboard Stats parsed:", dashboardData);

    const { mutate: approveReport, isPending: isApproving } = usePutApiAdminReportsIdApprove();
    const { mutate: rejectReport, isPending: isRejecting } = usePutApiAdminReportsIdReject();

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || (!user?.roles?.includes("Admin") && user?.email !== "lost.found2026@gmail.com")) {
        return <Navigate to="/" replace />;
    }

    // Extract the list of reports
    const rawData: any = (reportsData as any)?.data || reportsData;
    const reportsList = Array.isArray(rawData) ? rawData : rawData?.data || [];

    const handleApprove = (id: number) => {
        approveReport(
            { id },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["/api/Admin/reports"] });
                },
            }
        );
    };

    const handleReject = (id: number) => {
        rejectReport(
            { id },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["/api/Admin/reports"] });
                },
            }
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-2 text-sm">Manage and review incoming reports.</p>
            </div>

            {/* Dashboard Stats */}
            {!dashboardLoading && (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Reports</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.totalReportsCount ?? 0}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Platform Categories</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.categoriesCount ?? 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                {(["Pending", "Approved", "Rejected"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === tab
                            ? "text-blue-600 border-blue-600"
                            : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {reportsLoading ? (
                    <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading reports...</p>
                    </div>
                ) : reportsError ? (
                    <div className="text-center py-12 bg-red-50">
                        <p className="text-red-600">Failed to load reports.</p>
                    </div>
                ) : reportsList.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No {activeTab.toLowerCase()} reports</h3>
                        <p className="text-gray-500 mt-1">There are currently no reports in this category.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                    <th className="px-6 py-4 font-semibold">Report Details</th>
                                    <th className="px-6 py-4 font-semibold">Creator</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportsList.map((report: any) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {/* Thumbnail */}
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {report.images?.[0]?.imageUrl ? (
                                                        <img
                                                            src={`https://wasitkheir.runasp.net${report.images[0].imageUrl}`}
                                                            alt={report.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div>
                                                    <Link
                                                        to={`/report/${report.id}`}
                                                        className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                                                    >
                                                        {report.title}
                                                    </Link>
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded border border-gray-200 bg-white">
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
                                                    className="w-8 h-8 rounded-full border border-gray-200"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">
                                                    {report.createdByName || "Unknown User"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {activeTab === "Pending" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApprove(report.id)}
                                                        disabled={isApproving || isRejecting}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200 disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(report.id)}
                                                        disabled={isApproving || isRejecting}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 italic">
                                                    {activeTab}
                                                </span>
                                            )}
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
