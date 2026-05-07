import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDeleteApiReportsId, usePostApiReportsIdSave, useDeleteApiReportsIdSave } from "@/api/generated/reports/reports";
import { useDeleteApiAdminReportsId } from "@/api/generated/admin/admin";
import { useGetApiUsersMeSavedReports } from "@/api/generated/users/users";
import { useGetApiMatchingReportId, usePostApiMatchingRunReportId } from "@/api/generated/matching/matching";
import { usePostApiChatSessionsOtherUserId, apiClient } from "@/api";
import { MapPicker } from "@/components/ui/MapPicker";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import {
    ArrowLeft, MapPin, Calendar, MessageCircle, Share2, Send,
    Trash2, CheckCircle, Tag, User, Sparkles, Bookmark, BookmarkCheck
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const typeColors: Record<string, string> = {
    LostItem: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50",
    FoundItem: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50",
    LostPerson: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50",
    FoundPerson: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50",
};

const BASE_URL = "https://wasitkheir.runasp.net";

export const ReportDetails: React.FC = () => {
    const { t } = useTranslation();
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

    // Saved Reports
    const { data: savedReportsResponse, refetch: refetchSaved } = useGetApiUsersMeSavedReports({
        query: { enabled: !!user?.id }
    });

    const rawSavedList = (savedReportsResponse as any)?.data?.data || (savedReportsResponse as any)?.data || savedReportsResponse;
    const extractedArray = Array.isArray(rawSavedList) ? rawSavedList : (rawSavedList?.reports || []);
    const savedReportsList: any[] = Array.isArray(extractedArray) ? extractedArray : [];

    // DEBUG: View exactly what the API returns so we can fix `isSaved`
    console.log("rawSavedList:", rawSavedList);
    console.log("savedReportsList:", savedReportsList);

    // It's possible the returned array contains strings, ids, or objects like { report: { id } }
    const backendIsSaved = savedReportsList.some(r => r === reportId || r.id === reportId || r.report?.id === reportId || r.reportId === reportId);

    // BACKEND BUG WORKAROUND: The backend /api/Users/me/saved-reports is currently returning [] 
    // even when a report is saved. We will rely on local state if the user clicks the button.
    const [localIsSaved, setLocalIsSaved] = useState<boolean | null>(null);
    const isSaved = localIsSaved !== null ? localIsSaved : backendIsSaved;

    const { mutate: saveReport, isPending: isSaving } = usePostApiReportsIdSave({
        mutation: {
            onSuccess: () => {
                setLocalIsSaved(true);
                refetchSaved();
            },
            onError: (error: any) => {
                console.error("Save Report Error:", error);

                // If the backend says it's already saved, fix our local UI state!
                if (error?.response?.status === 400 &&
                    (error?.response?.data?.message?.includes("already saved") ||
                        error?.response?.data?.includes("already saved"))) {
                    setLocalIsSaved(true);
                } else {
                    alert("Failed to save report. Check console for details.");
                }
            }
        }
    });

    const { mutate: unsaveReport, isPending: isUnsaving } = useDeleteApiReportsIdSave({
        mutation: {
            onSuccess: () => {
                setLocalIsSaved(false);
                refetchSaved();
            },
            onError: (error) => {
                console.error("Unsave Report Error:", error);
                alert("Failed to unsave report. Check console for details.");
            }
        }
    });

    const toggleSave = () => {
        if (!user) {
            alert("You must be logged in to save reports.");
            return;
        }
        if (isSaved) {
            unsaveReport({ id: reportId });
        } else {
            saveReport({ id: reportId });
        }
    };

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
        if (!user) {
            alert(t('auth.loginRequired', { defaultValue: "You must be logged in to contact the reporter." }));
            navigate("/login");
            return;
        }
        const ownerId = reportData?.createdById;
        if (!ownerId) { alert("Unable to contact reporter. Owner ID is missing."); return; }
        createChatSession({ otherUserId: ownerId });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-lg">Loading report details...</p>
                </div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground text-lg">Report not found</p>
                    <Link to="/" className="mt-4 text-blue-600 hover:underline inline-block">Back to Home</Link>
                </div>
            </div>
        );
    }

    const typeClass = typeColors[reportData.type] || "bg-muted text-muted-foreground border-border";
    const typeLabel = t(`reportTypes.${reportData.type}`, { defaultValue: reportData.type });
    const images: any[] = reportData.images || [];

    // Parse matches
    const matchesArray = (matchesResponse as any)?.data || matchesResponse || [];
    const matchesList = Array.isArray(matchesArray) ? matchesArray : [];

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group mb-6"
                >
                    <div className="p-2 rounded-full bg-card border border-border group-hover:border-blue-200/50 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5 rtl:scale-x-[-1]" />
                    </div>
                    <span className="font-medium">Back to Feed</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card text-card-foreground rounded-3xl overflow-hidden shadow-sm border border-border">

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
                            <div className="p-6 border-b border-border">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${typeClass}`}>
                                        {typeLabel}
                                    </span>
                                    {reportData.lifecycleStatus && !["Pending", "Approved", "Rejected", "Flagged", "Active"].includes(reportData.lifecycleStatus) && (
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground border border-border">
                                            {t(`admin.reports.tabs.${reportData.lifecycleStatus}`, { defaultValue: reportData.lifecycleStatus })}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-foreground mb-2">{reportData.title}</h1>

                                {/* Creator */}
                                <Link
                                    to={`/profile/${reportData.createdById}`}
                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity mt-4"
                                >
                                    <img
                                        src={
                                            reportData.createdByProfilePictureUrl
                                                ? `${BASE_URL}${reportData.createdByProfilePictureUrl}`
                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(reportData.createdByName || t('reportDetails.unknownUser'))}&background=random&color=fff`
                                        }
                                        alt={reportData.createdByName}
                                        className="w-10 h-10 rounded-full object-cover border border-border"
                                    />
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">{reportData.createdByName || t('reportDetails.unknownUser')}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                                <div className="px-6 py-3 bg-muted/30 border-b border-border flex flex-wrap gap-2 items-center">
                                    <span className="text-sm font-medium text-muted-foreground ml-2">Manage:</span>
                                    <div className="mr-auto flex gap-2">
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
                                <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">
                                    {reportData.description}
                                </p>

                                {/* Meta pills */}
                                <div className="flex flex-wrap gap-3 text-sm">
                                    {reportData.subCategoryName && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-full border border-border">
                                            <Tag className="w-3.5 h-3.5" />
                                            {t(`subcategories.${reportData.subCategoryName}`, { defaultValue: reportData.subCategoryName })}
                                        </span>
                                    )}
                                    {reportData.locationName && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-full border border-border">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {reportData.locationName}
                                        </span>
                                    )}
                                    {reportData.dateReported && (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-full border border-border">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Reported: {new Date(reportData.dateReported).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {/* Map */}
                                {reportData.latitude && reportData.longitude && (
                                    <div className="space-y-2">
                                        <h4 className="text-foreground font-medium flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                            Location
                                        </h4>
                                        <div className="rounded-2xl overflow-hidden border border-border h-64 shadow-sm">
                                            <MapPicker
                                                initialLocation={{ lat: reportData.latitude, lng: reportData.longitude }}
                                                onLocationSelect={() => { }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions Bar */}
                            <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        <span className="text-sm">Share</span>
                                    </button>

                                    <button
                                        onClick={toggleSave}
                                        disabled={isSaving || isUnsaving}
                                        className={`flex items-center gap-2 transition-colors ${isSaved ? "text-blue-600" : "text-muted-foreground hover:text-foreground"
                                            } disabled:opacity-50`}
                                    >
                                        {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                                        <span className="text-sm">{isSaved ? "Saved" : "Save"}</span>
                                    </button>
                                </div>

                                {!isOwner && (
                                    <button
                                        onClick={handleContact}
                                        disabled={isCreatingChat}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4 rtl:-scale-x-100" />
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
                                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    Potential AI Matches {matchesList.length > 0 ? `(${matchesList.length})` : ''}
                                </h3>

                                {isLoadingMatches ? (
                                    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="ml-3 text-muted-foreground">Loading matches...</span>
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
                                                    className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md hover:border-indigo-500/50 transition-all group flex flex-col gap-3"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColors[matchedReport.type] || 'bg-muted text-muted-foreground border-border border'}`}>
                                                            {t(`reportTypes.${matchedReport.type}`, { defaultValue: matchedReport.type || 'Item' })}
                                                        </span>
                                                        {score !== undefined && score !== null && (
                                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                                                                {(score * (score <= 1.0 ? 100 : 1)).toFixed(0)}% Match
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-semibold text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                        {matchedReport.title || "Untitled Match"}
                                                    </h4>
                                                    <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span className="truncate max-w-[100px]">{matchedReport.locationName || "Unknown"}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {matchedReport.dateReported ? new Date(matchedReport.dateReported).toLocaleDateString() : "N/A"}
                                                        </span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center text-center">
                                        <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground text-sm">No matches found yet. Click "Run AI Match" above to scan.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-card text-card-foreground rounded-3xl overflow-hidden shadow-sm border border-border p-6">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Reporter Info
                            </h3>
                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        reportData.createdByProfilePictureUrl
                                            ? `${BASE_URL}${reportData.createdByProfilePictureUrl}`
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(reportData.createdByName || t('reportDetails.unknownUser'))}&background=random&color=fff`
                                    }
                                    alt={reportData.createdByName}
                                    className="w-14 h-14 rounded-full object-cover border border-border"
                                />
                                <div>
                                    <p className="font-semibold text-foreground">{reportData.createdByName || t('reportDetails.unknown')}</p>
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
                            <div className="bg-card text-card-foreground rounded-3xl overflow-hidden shadow-sm border border-border p-6">
                                <h3 className="text-lg font-bold text-foreground mb-3">Engagement</h3>
                                <div className="flex items-center gap-2 text-muted-foreground">
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
