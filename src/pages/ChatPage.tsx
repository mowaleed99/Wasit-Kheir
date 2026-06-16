import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ChatPage = () => {
    const { t } = useTranslation();
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

    // Sync URL param with state
    useEffect(() => {
        if (sessionId) {
            const id = parseInt(sessionId);
            if (!isNaN(id)) {
                setSelectedSessionId(id);
            }
        } else {
            setSelectedSessionId(null);
        }
    }, [sessionId]);

    const handleSelectSession = (id: number) => {
        navigate(`/chat/${id}`);
    };

    return (
        <div className="bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/50 dark:from-background dark:via-background dark:to-blue-950/20 h-[calc(100vh-4rem)] pb-16 md:pb-0 md:p-4 lg:p-6">
            <div className="max-w-6xl mx-auto h-full bg-card/80 backdrop-blur-xl md:rounded-[2rem] shadow-2xl border-0 md:border border-border/50 overflow-hidden flex ring-1 ring-black/5 dark:ring-white/10 relative">
                {/* Sidebar - Chat List */}
                <div className={`w-full md:w-80 lg:w-96 border-r border-border/50 flex flex-col bg-card/50 ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-5 border-b border-border/50 flex items-center justify-between sticky top-0 z-10 bg-card/80 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            {t('chat.messages')}
                        </h2>
                    </div>
                    <ChatList
                        selectedSessionId={selectedSessionId}
                        onSelectSession={handleSelectSession}
                    />
                </div>

                {/* Main Area - Chat Window */}
                <div className={`flex-1 flex flex-col bg-muted/20 ${!selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                    {selectedSessionId ? (
                        <ChatWindow
                            sessionId={selectedSessionId}
                            onBack={() => navigate('/chat')}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-transparent to-blue-50/30 dark:to-blue-900/10">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl"></div>
                                <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center border border-border/50 shadow-xl relative z-10">
                                    <MessageCircle className="w-12 h-12 text-blue-500/70" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight">{t('chat.selectConversation')}</h3>
                            <p className="text-muted-foreground max-w-sm">{t('chat.selectConversationDesc')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
