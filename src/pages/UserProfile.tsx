import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useGetApiUsersId } from "@/api";
import { usePostApiChatSessionsOtherUserId, apiClient, extractList } from "@/api";
import { ReportCard } from "@/components/reports/ReportCard";
import { Mail, Phone, Calendar, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export const UserProfile: React.FC = () => {
    const { userId, id } = useParams<{ userId?: string; id?: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // Support both /profile/:id and /user/:userId routes
    const userIdNum = parseInt(userId || id || "0");

    // Redirect to /profile if user is viewing their own profile
    useEffect(() => {
        if (currentUser?.id && userIdNum === currentUser.id) {
            navigate("/profile", { replace: true });
        }
    }, [currentUser?.id, userIdNum, navigate]);

    // ── Fetch user profile ───────────────────────────────────────────────
    const { data: userData, isLoading: isLoadingUser, error: userError } = useGetApiUsersId(userIdNum);

    // ── Fetch user's reports (useGetApiUsersIdReports uses customInstance<void> - broken)
    // Using direct apiClient.get instead ──────────────────────────────────
    const { data: postsData, isLoading: isLoadingPosts } = useQuery({
        queryKey: ["user-reports", userIdNum],
        queryFn: async () => {
            const res = await apiClient.get(`/api/Users/${userIdNum}/reports`);
            return res.data;
        },
        enabled: !!userIdNum,
    });

    // Start chat with this user
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

    const user = (userData as any)?.data ?? userData;
    // API shape: { success, data: { data: [], page, totalPages } }
    const userPosts = extractList(postsData);

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric"
        });
    };

    if (isLoadingUser) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-lg">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (userError) {
        const errorResponse = (userError as any)?.response;
        const status = errorResponse?.status;
        const isAuthError = status === 401 || status === 403;

        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                        {isAuthError ? (
                            <>
                                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h2>
                                <p className="text-muted-foreground mb-6">
                                    You don't have permission to view this user's profile.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">User Not Found</h2>
                                <p className="text-muted-foreground mb-6">The user you're looking for doesn't exist or has been removed.</p>
                            </>
                        )}
                        <Link to="/"><Button className="w-full">Go Home</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground text-lg">User not found</p>
                    <Link to="/"><Button className="mt-4">Go Home</Button></Link>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === userIdNum;

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
                >
                    <div className="p-2 rounded-full bg-card border border-border group-hover:border-blue-200/50 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Back</span>
                </Link>

                {/* Profile Header */}
                <div className="bg-card rounded-3xl shadow-sm border border-border mb-6">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
                                {/* Avatar */}
                                <img
                                    src={
                                        user?.profilePictureUrl ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            user?.fullName || "User"
                                        )}&background=3b82f6&color=fff&size=128`
                                    }
                                    alt={user?.fullName || "User"}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-border"
                                />

                                {/* User Info */}
                                <div className="flex flex-col items-center md:items-start">
                                    <h1 className="text-3xl font-bold text-foreground mb-2">
                                        {user?.fullName || "Unknown User"}
                                    </h1>
                                    <div className="space-y-2">
                                        {user?.email && (
                                            <div className="flex items-center space-x-2 text-muted-foreground">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm">{user.email}</span>
                                            </div>
                                        )}
                                        {user?.phone && (
                                            <div className="flex items-center space-x-2 text-muted-foreground">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm">{user.phone}</span>
                                            </div>
                                        )}
                                        {user?.createdAt && (
                                            <div className="flex items-center space-x-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Message Button — wired to API */}
                            {!isOwnProfile && (
                                <Button
                                    variant="default"
                                    onClick={() => createChatSession({ otherUserId: userIdNum })}
                                    disabled={isCreatingChat}
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {isCreatingChat ? "Connecting..." : "Send Message"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 text-center">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{userPosts.length}</p>
                        <p className="text-sm text-muted-foreground mt-1">Reports</p>
                    </div>
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 text-center">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {/* lifecycleStatus field from backend */}
                            {userPosts.filter((p: any) => p.lifecycleStatus === "Resolved").length}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Resolved</p>
                    </div>
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 text-center">
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {userPosts.filter((p: any) => p.lifecycleStatus === "Active" || p.lifecycleStatus === "Pending").length}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Active</p>
                    </div>
                </div>

                {/* User's Reports */}
                <div className="bg-card rounded-3xl shadow-sm border border-border p-6">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">Reports by {user?.fullName}</h2>

                    {isLoadingPosts ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading reports...</p>
                        </div>
                    ) : userPosts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">This user hasn't created any reports yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {userPosts.map((post: any) => (
                                <ReportCard key={post.id} report={post} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
