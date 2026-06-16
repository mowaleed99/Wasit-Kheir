import { useGetApiChatSessions, useGetApiChatSessionsSessionIdMessages } from "@/api/generated/chat/chat";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resolveImageUrl } from "@/utils/imageUrl";

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
            <div className="p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="relative group">
                    <Search className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={t('chat.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 bg-muted/50 border border-transparent focus:bg-background focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 rounded-full text-sm transition-all duration-200 text-foreground placeholder:text-muted-foreground shadow-sm hover:bg-muted/80"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
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
            className={`w-full p-4 flex items-center gap-4 transition-all duration-200 text-left rtl:text-right border-l-4 group ${isSelected ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30" : "border-transparent hover:bg-muted/60"
                }`}
        >
            <div className="relative">
                <img
                    src={otherUser?.avatar || (otherUser?.profilePictureUrl ? resolveImageUrl(otherUser.profilePictureUrl) : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.fullName || 'User')}&background=random&color=fff`}
                    alt={otherUser?.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-background shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
                {session.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 border-2 border-background rounded-full"></span>
                )}
            </div>

            <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center justify-between mb-1.5">
                    <h3 className={`font-semibold truncate text-[15px] ${isSelected ? "text-blue-900 dark:text-blue-300" : "text-foreground"}`}>
                        {otherUser?.fullName || t('chat.unknownUser')}
                    </h3>
                    {trueLastMessage && (
                        <span className={`text-xs font-medium whitespace-nowrap ml-2 ${session.unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground/80'}`}>
                            {new Date(trueLastMessage.createdAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${session.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {trueLastMessage?.content || trueLastMessage?.text || t('chat.noMessages')}
                    </p>
                    {session.unreadCount > 0 && (
                        <div className="min-w-[1.25rem] h-5 px-1.5 bg-blue-600 rounded-full flex items-center justify-center shadow-sm shadow-blue-500/20">
                            <span className="text-[10px] text-white font-bold">{session.unreadCount}</span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
};
