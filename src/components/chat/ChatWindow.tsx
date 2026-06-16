import { useGetApiChatSessions, useGetApiChatSessionsSessionIdMessages, usePostApiChatSessionsSessionIdMessages, useGetApiChatSessionsSessionId, usePutApiChatMessagesMessageIdRead, useDeleteApiChatSessionsSessionId } from "@/api/generated/chat/chat";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2, Send, Trash2, Check, CheckCheck, MoreVertical, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { resolveImageUrl } from "@/utils/imageUrl";

interface ChatWindowProps {
    sessionId: number;
    onBack: () => void;
}

export const ChatWindow = ({ sessionId, onBack }: ChatWindowProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [messageInput, setMessageInput] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages — poll every 3 seconds for real-time feel
    const { data: messagesData, isLoading } = useGetApiChatSessionsSessionIdMessages(sessionId, {
        query: { refetchInterval: 3000 }
    });

    // Fetch single session details
    const { data: sessionData } = useGetApiChatSessionsSessionId(sessionId);
    const session = (sessionData as any)?.data;

    // Also fetch sessions list — it always has otherUser, works even on direct URL visit
    const { data: sessionsListData } = useGetApiChatSessions();
    const sessionFromList = ((sessionsListData as any)?.data || []).find((s: any) => s.id === sessionId);

    // Resolve otherUser from all possible sources
    let otherUser = session?.otherUser || sessionFromList?.otherUser;
    if (!otherUser && session?.participants && Array.isArray(session.participants)) {
        const participant = session.participants.find((p: any) => p.userId !== user?.id);
        otherUser = participant?.user || participant;
    }

    const { mutate: sendMessage, isPending: isSending } = usePostApiChatSessionsSessionIdMessages();
    const { mutate: markAsRead } = usePutApiChatMessagesMessageIdRead();
    const { mutate: deleteSession, isPending: isDeleting } = useDeleteApiChatSessionsSessionId();

    const messages = (messagesData as any)?.data || [];

    // Mark unread messages as read
    useEffect(() => {
        if (!messages || messages.length === 0 || !user) return;
        const unreadMessages = messages.filter((msg: any) => msg.senderId !== user.id && !msg.isRead);
        if (unreadMessages.length > 0) {
            unreadMessages.forEach((msg: any) => {
                markAsRead({ messageId: msg.id }, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: [`/api/chat/sessions`] });
                    }
                });
            });
        }
    }, [messages, user, markAsRead, queryClient]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        sendMessage(
            { sessionId, data: { Text: messageInput } as any },
            {
                onSuccess: () => {
                    setMessageInput("");
                    queryClient.invalidateQueries({ queryKey: [`/api/chat/sessions/${sessionId}/messages`] });
                }
            }
        );
    };

    const otherUserAvatar = otherUser
        ? otherUser.avatar ||
          (otherUser.profilePictureUrl ? resolveImageUrl(otherUser.profilePictureUrl) : null) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullName || 'User')}&background=4f46e5&color=fff`
        : null;

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-muted/20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-4 py-3 bg-card/95 backdrop-blur-md border-b border-border flex items-center gap-3 shadow-sm z-10">
                {/* Back button (mobile) */}
                <button
                    onClick={onBack}
                    className="md:hidden p-2 hover:bg-muted/80 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-foreground rtl:scale-x-[-1]" />
                </button>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {otherUser ? (
                        <>
                            <div className="relative flex-shrink-0">
                                <img
                                    src={otherUserAvatar!}
                                    alt={otherUser.fullName}
                                    className="w-11 h-11 rounded-full object-cover border-2 border-border shadow-sm"
                                />
                                {otherUser.isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-foreground text-[15px] leading-tight truncate">
                                    {otherUser.fullName || t('chat.unknownUser')}
                                </h3>
                                <span className={`text-xs font-medium ${otherUser.isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
                                    {otherUser.isOnline ? t('chat.online') : ''}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Skeleton while loading */}
                            <div className="w-11 h-11 rounded-full bg-muted animate-pulse flex-shrink-0" />
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                <div className="h-3 w-16 bg-muted/60 animate-pulse rounded" />
                            </div>
                        </>
                    )}
                </div>

                {/* ⋮ Menu */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-muted-foreground hover:bg-muted/80 rounded-full transition-colors"
                        title={t('common.moreOptions') || 'More options'}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="absolute top-full right-0 rtl:left-0 rtl:right-auto mt-2 w-52 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden py-1.5">
                                {otherUser && (
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            navigate(`/user/${otherUser.id || otherUser.userId}`);
                                        }}
                                        className="w-full px-4 py-2.5 text-left rtl:text-right text-sm font-medium hover:bg-muted flex items-center gap-3 transition-colors"
                                    >
                                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                                        {t('chat.viewProfile') || 'View Profile'}
                                    </button>
                                )}
                                <div className="h-px bg-border mx-2 my-1" />
                                <button
                                    onClick={() => { setShowMenu(false); setShowDeleteModal(true); }}
                                    disabled={isDeleting}
                                    className="w-full px-4 py-2.5 text-left rtl:text-right text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 disabled:opacity-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t('chat.deleteChat') || 'Delete Chat'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Send className="w-7 h-7 text-blue-500/70" />
                        </div>
                        {otherUser && (
                            <p className="font-semibold text-foreground">{otherUser.fullName}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{t('chat.noMessages')}</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {messages.map((msg: any, index: number) => {
                            const isMe = msg.senderId === user?.id;
                            const msgDate = new Date(msg.createdAt);
                            const prevMsg = index > 0 ? messages[index - 1] : null;
                            const showDate = !prevMsg || new Date(prevMsg.createdAt).toDateString() !== msgDate.toDateString();

                            return (
                                <div key={msg.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4">
                                            <span className="bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-full border border-border/50">
                                                {msgDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex mb-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        {/* Other user avatar */}
                                        {!isMe && (
                                            <img
                                                src={otherUserAvatar || `https://ui-avatars.com/api/?name=U&background=random&color=fff`}
                                                alt=""
                                                className="w-7 h-7 rounded-full object-cover self-end mb-1 mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0"
                                            />
                                        )}
                                        <div className={`max-w-[72%] md:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                            isMe
                                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                                                : 'bg-card text-foreground border border-border/60 rounded-bl-sm'
                                        }`}>
                                            <p className="text-[14px] leading-relaxed break-words">{msg.content || msg.text || ''}</p>
                                            <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <span className={`text-[11px] font-medium ${isMe ? 'text-blue-100' : 'text-muted-foreground'}`}>
                                                    {msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <span title={msg.isRead ? 'Read' : 'Sent'}>
                                                        {msg.isRead
                                                            ? <CheckCheck className="w-3.5 h-3.5 text-blue-100" />
                                                            : <Check className="w-3.5 h-3.5 text-blue-200/70" />
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* ── Input Bar ── */}
            <div className="flex-shrink-0 px-4 py-3 bg-card/90 backdrop-blur-md border-t border-border">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder={t('chat.typeMessage')}
                        className="flex-1 bg-muted/50 border border-border/50 focus:bg-background focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 rounded-full py-3 px-5 text-sm transition-all text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!messageInput.trim() || isSending}
                        className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-md hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all flex-shrink-0"
                    >
                        {isSending
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <Send className="w-5 h-5 rtl:-scale-x-100" />
                        }
                    </button>
                </form>
            </div>

            {/* ── Delete Confirmation Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">{t('chat.deleteChat') || 'Delete Chat'}</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            {t('chat.confirmDelete') || 'Are you sure you want to delete this chat? This cannot be undone.'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-xl text-foreground bg-muted hover:bg-muted/80 transition-colors font-medium text-sm"
                            >
                                {t('common.cancel') || 'Cancel'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    deleteSession({ sessionId }, {
                                        onSuccess: () => {
                                            queryClient.invalidateQueries({ queryKey: [`/api/chat/sessions`] });
                                            setShowDeleteModal(false);
                                            onBack();
                                        }
                                    });
                                }}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                            >
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {t('common.delete') || 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
