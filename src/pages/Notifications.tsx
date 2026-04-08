import { useGetApiNotifications, usePutApiNotificationsIdRead, usePostApiNotificationsMarkAllRead, useDeleteApiNotificationsId } from "@/api/generated/notifications/notifications";
import { useAuth } from "@/context/AuthContext";
import { Bell, Check, CheckCircle2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const Notifications: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: notificationsData, isLoading } = useGetApiNotifications({
        pageSize: 50
    }, {
        query: { enabled: !!user?.id }
    });

    const rawNotificationsList = (notificationsData as any)?.data?.data || (notificationsData as any)?.data || notificationsData;
    const extractedArray = Array.isArray(rawNotificationsList) ? rawNotificationsList : (rawNotificationsList?.items || rawNotificationsList?.notifications || []);
    const notifications: any[] = Array.isArray(extractedArray) ? extractedArray : [];

    const { mutate: markAsRead } = usePutApiNotificationsIdRead({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["/api/Notifications"] });
                queryClient.invalidateQueries({ queryKey: ["/api/Notifications/unread"] });
            }
        }
    });

    const { mutate: markAllAsRead, isPending: isMarkingAllRead } = usePostApiNotificationsMarkAllRead({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["/api/Notifications"] });
                queryClient.invalidateQueries({ queryKey: ["/api/Notifications/unread"] });
            }
        }
    });

    const { mutate: deleteNotification } = useDeleteApiNotificationsId({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["/api/Notifications"] });
                queryClient.invalidateQueries({ queryKey: ["/api/Notifications/unread"] });
            }
        }
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short", day: "numeric", hour: "numeric", minute: "numeric"
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t('notifications.title')}</h1>
                        <p className="text-sm text-muted-foreground">{t('notifications.subtitle')}</p>
                    </div>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAllAsRead()}
                        disabled={isMarkingAllRead}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {t('notifications.markAllAsRead')}
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-muted-foreground">{t('notifications.loading')}</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-2xl shadow-sm border border-border">
                    <div className="p-5 bg-muted rounded-full mb-4">
                        <Bell className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{t('notifications.allCaughtUp')}</h3>
                    <p className="text-muted-foreground text-sm">
                        {t('notifications.noNotifications')}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification: any) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-xl border flex items-start gap-4 transition-colors ${notification.isRead
                                ? "bg-card border-border"
                                : "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/50 shadow-sm"
                                }`}
                        >
                            <div className="flex-1 min-w-0 pt-1">
                                <p className={`text-sm ${notification.isRead ? "text-foreground" : "font-medium text-foreground"}`}>
                                    {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                                    {formatDate(notification.createdAt)}
                                    {notification.reportId && (
                                        <>
                                            <span className="rtl:rotate-180">•</span>
                                            <Link
                                                to={`/report/${notification.reportId}`}
                                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                                onClick={() => !notification.isRead && markAsRead({ id: notification.id })}
                                            >
                                                {t('notifications.viewReport')}
                                            </Link>
                                        </>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 pl-4 rtl:pr-4 rtl:pl-0">
                                {!notification.isRead && (
                                    <button
                                        onClick={() => markAsRead({ id: notification.id })}
                                        className="p-1.5 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                        title={t('notifications.markAsReadTooltip')}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification({ id: notification.id })}
                                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title={t('notifications.deleteTooltip')}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
