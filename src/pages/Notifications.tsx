import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api";

export const Notifications: React.FC = () => {
    const queryClient = useQueryClient();

    // ── Fetch notifications via direct apiClient (generated hook uses customInstance<void>) ──
    const { data: notificationsRaw, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await apiClient.get("/api/Notifications", {
                params: { pageSize: 50 },
            });
            return res.data;
        },
    });

    // ── Mark single notification as read ─────────────────────────────────
    const { mutate: markRead } = useMutation({
        mutationFn: async (id: number) => {
            await apiClient.put(`/api/Notifications/${id}/read`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    // ── Mark ALL notifications as read ───────────────────────────────────
    const { mutate: markAllRead, isPending: markingAll } = useMutation({
        mutationFn: async () => {
            await apiClient.post("/api/Notifications/mark-all-read");
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const notifications: any[] = (() => {
        if (!notificationsRaw) return [];
        if (Array.isArray(notificationsRaw?.data?.data)) return notificationsRaw.data.data;
        if (Array.isArray(notificationsRaw?.data)) return notificationsRaw.data;
        if (Array.isArray(notificationsRaw)) return notificationsRaw;
        return [];
    })();

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    const formatTime = (d: string) => {
        if (!d) return "";
        const diff = Date.now() - new Date(d).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(diff / 3600000);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                            You have {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                        </p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllRead()}
                        disabled={markingAll}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                        <CheckCheck className="w-5 h-5" />
                        <span>Mark all as read</span>
                    </button>
                )}
            </div>

            {/* List */}
            <div className="space-y-2">
                {notifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No notifications yet</p>
                        <p className="text-sm text-gray-500 mt-2">We'll notify you when something happens</p>
                    </div>
                ) : (
                    notifications.map((n: any) => (
                        <div
                            key={n.id}
                            onClick={() => !n.isRead && markRead(n.id)}
                            className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer ${!n.isRead ? "border-blue-200 bg-blue-50" : "border-gray-200"
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <Bell className={`w-5 h-5 mt-0.5 flex-shrink-0 ${!n.isRead ? "text-blue-500" : "text-gray-400"}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 font-medium">{n.title || n.type}</p>
                                    {n.message && <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>}
                                    <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                                </div>
                                {!n.isRead && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
