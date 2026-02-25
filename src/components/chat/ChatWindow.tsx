import { useGetApiChatSessionsSessionIdMessages, usePostApiChatSessionsSessionIdMessages, useGetApiChatSessionsSessionId, usePutApiChatMessagesMessageIdRead } from "@/api/generated/chat/chat";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ChatWindowProps {
    sessionId: number;
    onBack: () => void;
}

export const ChatWindow = ({ sessionId, onBack }: ChatWindowProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [messageInput, setMessageInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages
    // Poll every 3 seconds for real-time-like updates (simple solution)
    const { data: messagesData, isLoading } = useGetApiChatSessionsSessionIdMessages(sessionId, {
        query: {
            refetchInterval: 3000
        }
    });

    // Fetch session details for header
    const { data: sessionData } = useGetApiChatSessionsSessionId(sessionId);
    const session = (sessionData as any)?.data;

    // Try to get otherUser directly, or find in participants
    let otherUser = session?.otherUser;
    if (!otherUser && session?.participants && Array.isArray(session.participants)) {
        otherUser = session.participants.find((p: any) => p.userId !== user?.id);
    }

    const { mutate: sendMessage, isPending: isSending } = usePostApiChatSessionsSessionIdMessages();

    const messages = (messagesData as any)?.data || [];
    console.log('ChatWindow messages:', messages);

    // Mark messages as read
    const { mutate: markAsRead } = usePutApiChatMessagesMessageIdRead();

    useEffect(() => {
        if (!messages || messages.length === 0 || !user) return;

        const unreadMessages = messages.filter((msg: any) =>
            msg.senderId !== user.id && !msg.isRead
        );

        if (unreadMessages.length > 0) {
            // Mark unread messages as read
            // To avoid too many requests, we could just mark the latest one if the backend supports "read up to"
            // But with this API, we might need to mark them individually. 
            // For now, let's just mark the last one and see if it clears the count, 
            // or iterate if needed. Let's iterate but maybe limit concurrency?
            // Actually, let's just mark them.
            unreadMessages.forEach((msg: any) => {
                markAsRead({ messageId: msg.id }, {
                    onSuccess: () => {
                        // Invalidate sessions to update unread count in sidebar
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

        sendMessage({
            sessionId,
            data: { text: messageInput }
        }, {
            onSuccess: () => {
                setMessageInput("");
                // Invalidate query to fetch new message immediately
                queryClient.invalidateQueries({ queryKey: [`/api/chat/sessions/${sessionId}/messages`] });
            },
            onError: (error) => {
                console.error("Failed to send message:", error);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm z-10">
                <button
                    onClick={onBack}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>

                {/* We could show the other user's name here if we passed it down or fetched session details */}
                <div className="flex items-center gap-3">
                    {otherUser ? (
                        <>
                            <img
                                src={otherUser.avatar || otherUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullName || 'User')}&background=random&color=fff`}
                                alt={otherUser.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                            <div>
                                <h3 className="font-bold text-gray-900">{otherUser.fullName}</h3>
                                {otherUser.isOnline && (
                                    <span className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                        Online
                                    </span>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                #
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Chat Session</h3>
                                <span className="text-xs text-green-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Active
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((msg: any) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${isMe
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{msg.content || msg.text || ''}</p>
                                    <span className={`text-[10px] mt-1 block ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl py-3 px-4 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!messageInput.trim() || isSending}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {isSending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
