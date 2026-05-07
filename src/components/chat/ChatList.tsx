import { useGetApiChatSessions, useGetApiChatSessionsSessionIdMessages } from "@/api/generated/chat/chat";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ChatListProps {
    selectedSessionId?: number | null;
    onSelectSession?: (sessionId: number) => void;
}

export const ChatList = ({ selectedSessionId = null, onSelectSession }: ChatListProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // const { user } = useAuth(); // Removed unused
    const { data: sessionsData, isLoading } = useGetApiChatSessions();
    const [searchTerm, setSearchTerm] = useState("");

    const sessions = (sessionsData as any)?.data || [];
    console.log('ChatList sessions:', sessions);

    const filteredSessions = sessions.filter((session: any) => {
        const otherUser = session.otherUser;
        if (!otherUser || !otherUser.fullName) return false;
        return otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSelectSession = (sessionId: number) => {
        if (onSelectSession) {
            onSelectSession(sessionId);
        } else {
            navigate(`/chat/${sessionId}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('chat.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 bg-muted border-transparent focus:bg-card focus:border-blue-500 focus:ring-0 rounded-xl text-sm transition-all text-foreground placeholder:text-muted-foreground shadow-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filteredSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        {t('chat.noConversations')}
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filteredSessions.map((session: any) => (
                            <ChatListItem
                                key={session.id}
                                session={session}
                                isSelected={selectedSessionId === session.id}
                                onSelect={() => handleSelectSession(session.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

interface ChatListItemProps {
    session: any;
    isSelected: boolean;
    onSelect: () => void;
}

const ChatListItem = ({ session, isSelected, onSelect }: ChatListItemProps) => {
    const { t } = useTranslation();
    const otherUser = session.otherUser;

    // Fetch messages for this specific session to get the REAL last message
    // since the backend's session.lastMessage is currently returning the FIRST message.
    const { data: messagesData } = useGetApiChatSessionsSessionIdMessages(session.id);
    const messages = (messagesData as any)?.data || [];
    
    // Use the fetched messages to find the true last message, fallback to session.lastMessage if not loaded yet
    const trueLastMessage = messages.length > 0 ? messages[messages.length - 1] : session.lastMessage;

    return (
        <button
            onClick={onSelect}
            className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left rtl:text-right ${isSelected ? "bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50/50 dark:hover:bg-blue-900/10" : ""
                }`}
        >
            <div className="relative">
                <img
                    src={otherUser?.avatar || otherUser?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.fullName || 'User')}&background=random&color=fff`}
                    alt={otherUser?.fullName}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold truncate ${isSelected ? "text-blue-900 dark:text-blue-400" : "text-foreground"}`}>
                        {otherUser?.fullName || t('chat.unknownUser')}
                    </h3>
                    {trueLastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {new Date(trueLastMessage.createdAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <p className={`text-sm truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground"}`}>
                    {trueLastMessage?.content || trueLastMessage?.text || t('chat.noMessages')}
                </p>
            </div>

            {session.unreadCount > 0 && (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{session.unreadCount}</span>
                </div>
            )}
        </button>
    );
};
