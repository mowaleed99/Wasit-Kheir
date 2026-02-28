import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDeleteApiReportsId } from "@/api/generated/reports/reports";
import { useDeleteApiAdminReportsId } from "@/api/generated/admin/admin";
import { useGetApiMatchingReportId, usePostApiMatchingRunReportId } from "@/api/generated/matching/matching";
import { usePostApiChatSessionsOtherUserId, apiClient } from "@/api";
import { MapPicker } from "@/components/ui/MapPicker";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import {
    ArrowLeft, MapPin, Calendar, MessageCircle, Share2, Send,
    Trash2, CheckCircle, Tag, User, Sparkles
} from "lucide-react";
import { useState } from "react";

const typeColors: Record<string, string> = {
    LostItem: "bg-red-100 text-red-700 border-red-200",
    FoundItem: "bg-green-100 text-green-700 border-green-200",
    LostPerson: "bg-orange-100 text-orange-700 border-orange-200",
    FoundPerson: "bg-blue-100 text-blue-700 border-blue-200",
};
const typeLabels: Record<string, string> = {
    LostItem: "Lost Item",
    FoundItem: "Found Item",
    LostPerson: "Lost Person",
    FoundPerson: "Found Person",
};

const BASE_URL = "https://wasitkheir.runasp.net";

export const ReportDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const reportId = parseInt(id || "0");

    // Fetch report via direct apiClient call (generated hook uses customInstance<void> and always returns undefined)
    const { data: reportResponse, isLoading } = useQuery({
        queryKey: ["report-detail", reportId],
        queryFn: async () => {
            const res = await apiClient.get(`/api/Reports/${reportId}`);
            return res.data;
        },
        enabled: !!reportId,
    });

    // AI Matching
    const isOwner = (reportResponse as any)?.data?.createdById === user?.id;
    const isAdmin = user?.roles?.includes("Admin") || user?.email === "lost.found2026@gmail.com";

    const { data: matchesResponse, isLoading: isLoadingMatches, refetch: refetchMatches } = useGetApiMatchingReportId(reportId, {
        query: { enabled: !!reportId && (isOwner || isAdmin) }
    });

    const { mutate: runMatch, isPending: isRunningMatch } = usePostApiMatchingRunReportId({
        mutation: {
            onSuccess: () => {
                alert("AI Match scan complete!");
                refetchMatches();
            },
            onError: () => alert("Failed to run AI matching.")
        }
    });

    const { mutate: deleteReport, isPending: isDeleting } = useDeleteApiReportsId();
    const { mutate: deleteAdminReport, isPending: isAdminDeleting } = useDeleteApiAdminReportsId();
    const { mutate: createChatSession, isPending: isCreatingChat } = usePostApiChatSessionsOtherUserId({
        mutation: {
            onSuccess: (response: any) => {
                const session = response?.data || response;
                const sessionId = session?.id || session?.data?.id;
                if (sessionId) {
                    navigate(`/chat/${sessionId}`);
                } else {
                    console.error("Missing session ID in response:", response);
                    navigate("/chat");
                }
            },
            onError: (error) => {
                console.error("Chat creation error:", error);
                alert("Failed to start chat. Please try again.");
            },
        },
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // API body: { success, data: { id, title, ... } }
    const reportData = (reportResponse as any)?.data ?? reportResponse;

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/report/${reportId}`;
        const title = reportData?.title || "Wasit Kheir Report";
        if (navigator.share) {
            try { await navigator.share({ title, url: shareUrl }); }
            catch (e) { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(shareUrl).catch(() => { });
            alert("Link copied to clipboard!");
        }
    };

    const handleDelete = () => {
        const onSuccessAction = () => {
            queryClient.invalidateQueries({ queryKey: ["reports-feed"] });
            queryClient.invalidateQueries({ queryKey: ["reports-mine"] });
            queryClient.invalidateQueries({ queryKey: ["/api/Admin/reports"] });
            navigate("/");
        };
        const onErrorAction = () => alert("Failed to delete report.");

        if (!isOwner && isAdmin) {
            deleteAdminReport({ id: reportId }, { onSuccess: onSuccessAction, onError: onErrorAction });
        } else {
            deleteReport({ id: reportId }, { onSuccess: onSuccessAction, onError: onErrorAction });
        }
    };

    const handleContact = () => {
        const ownerId = reportData?.createdById;
        if (!ownerId) { alert("Unable to contact reporter"); return; }
        createChatSession({ otherUserId: ownerId });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-lg">Loading report...</p>
                </div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Report not found.</p>
                    <Link to="/" className="mt-4 text-blue-600 hover:underline inline-block">← Back to Home</Link>
                </div>
            </div>
        );
    }

    const typeClass = typeColors[reportData.type] || "bg-gray-100 text-gray-600 border-gray-200";
    const typeLabel = typeLabels[reportData.type] || reportData.type;
    const images: any[] = reportData.images || [];

    // Parse matches
    const matchesArray = (matchesResponse as any)?.data || matchesResponse || [];
    const matchesList = Array.isArray(matchesArray) ? matchesArray : [];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group mb-6"
                >
                    <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Back to Feed</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

                            {/* Image Gallery */}
                            {images.length > 0 && (
                                <div className="relative">
                                    <img
                                        src={`${BASE_URL}${images[0].imageUrl}`}
                                        alt={reportData.title}
                                        className="w-full h-72 object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                    {images.length > 1 && (
                                        <div className="absolute bottom-3 right-3 flex gap-2">
                                            {images.slice(1).map((img: any, i: number) => (
                                                <img
                                                    key={i}
                                                    src={`${BASE_URL}${img.imageUrl}`}
                                                    alt={`Image ${i + 2}`}
                                                    className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Type & Status badges */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${typeClass}`}>
                                        {typeLabel}
                                    </span>
                                    {reportData.lifecycleStatus && (
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                            {reportData.lifecycleStatus}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{reportData.title}</h1>

                                {/* Creator */}
                                <Link
                                    to={`/profile/${reportData.createdById}`}
                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity mt-4"
                                >
                                    <img
                                        src={
                                            reportData.createdByProfilePictureUrl
                                                ? `${BASE_URL}${reportData.createdByProfilePictureUrl}`
                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(reportData.createdByName || "User")}&background=random&color=fff`
                                        }
                                        alt={reportData.createdByName}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{reportData.createdByName || "Unknown User"}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(reportData.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Owner or Admin Actions */}
                            {(isOwner || isAdmin) && (
                                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2 items-center">
                                    <span className="text-sm font-medium text-gray-500 mr-2">Manage:</span>
                                    <div className="ml-auto flex gap-2">
                                        {showDeleteConfirm ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-red-600 font-medium">Sure?</span>
                                                <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isDeleting || isAdminDeleting}>
                                                    Yes, Delete
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm" variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setShowDeleteConfirm(true)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm" variant="outline"
                                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                                            onClick={() => runMatch({ reportId })}
                                            disabled={isRunningMatch}
                                        >
                                            <Sparkles className="w-4 h-4 mr-1" />
                                            {isRunningMatch ? "Scanning..." : "Run AI Match"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                                    {reportData.description}
                                </p>

                                {/* Meta pills */}
                                <div className="flex flex-wrap gap-3 text-sm">
                                    {reportData.subCategoryName && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full">
                                            <Tag className="w-3.5 h-3.5" />
                                            {reportData.subCategoryName}
                                        </span>
                                    )}
                                    {reportData.locationName && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {reportData.locationName}
                                        </span>
                                    )}
                                    {reportData.dateReported && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Reported: {new Date(reportData.dateReported).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {/* Map */}
                                {reportData.latitude && reportData.longitude && (
                                    <div className="space-y-2">
                                        <h4 className="text-gray-900 font-medium flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                            Location
                                        </h4>
                                        <div className="rounded-2xl overflow-hidden border border-gray-200 h-64 shadow-sm">
                                            <MapPicker
                                                initialLocation={{ lat: reportData.latitude, lng: reportData.longitude }}
                                                onLocationSelect={() => { }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions Bar */}
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                    <span className="text-sm">Share</span>
                                </button>

                                {!isOwner && (
                                    <button
                                        onClick={handleContact}
                                        disabled={isCreatingChat}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {isCreatingChat ? "Connecting..." : "Contact Reporter"}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Match Results */}
                        {(isOwner || isAdmin) && (
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    Potential AI Matches {matchesList.length > 0 ? `(${matchesList.length})` : ''}
                                </h3>

                                {isLoadingMatches ? (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="ml-3 text-gray-500">Loading matches...</span>
                                    </div>
                                ) : matchesList.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {matchesList.map((match: any, idx: number) => {
                                            const matchedReport = match.matchedReport || match;
                                            const score = match.matchScore || match.score || match.similarityScore;
                                            const matchId = matchedReport.id || match.id;

                                            return (
                                                <Link
                                                    key={idx}
                                                    to={`/report/${matchId}`}
                                                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col gap-3"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColors[matchedReport.type] || 'bg-gray-100 text-gray-600'}`}>
                                                            {typeLabels[matchedReport.type] || matchedReport.type || 'Item'}
                                                        </span>
                                                        {score !== undefined && score !== null && (
                                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
                                                                {(score * (score <= 1.0 ? 100 : 1)).toFixed(0)}% Match
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                        {matchedReport.title || "Untitled Match"}
                                                    </h4>
                                                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span className="truncate max-w-[100px]">{matchedReport.locationName || 'Unknown'}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {matchedReport.dateReported ? new Date(matchedReport.dateReported).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                                        <Sparkles className="w-8 h-8 text-gray-300 mb-2" />
                                        <p className="text-gray-500 text-sm">No matches found yet.<br />Click "Run AI Match" above to scan.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Reporter Info
                            </h3>
                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        reportData.createdByProfilePictureUrl
                                            ? `${BASE_URL}${reportData.createdByProfilePictureUrl}`
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(reportData.createdByName || "User")}&background=random&color=fff`
                                    }
                                    alt={reportData.createdByName}
                                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">{reportData.createdByName || "Unknown"}</p>
                                    <Link
                                        to={`/profile/${reportData.createdById}`}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>

                            {!isOwner && (
                                <button
                                    onClick={handleContact}
                                    disabled={isCreatingChat}
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {isCreatingChat ? "Connecting..." : "Send Message"}
                                </button>
                            )}
                        </div>

                        {/* Interested count */}
                        {reportData.interestedCount !== undefined && (
                            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Engagement</h3>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>{reportData.interestedCount} people marked as interested</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
};
