import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MessageCircle } from "lucide-react";

export const ChatPage = () => {
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
        <div className="bg-background h-[calc(100vh-4rem)] pb-16 md:pb-0">
            <div className="max-w-6xl mx-auto h-full bg-card md:rounded-3xl shadow-sm border-0 md:border border-border overflow-hidden flex">
                {/* Sidebar - Chat List */}
                <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <MessageCircle className="w-6 h-6 text-blue-600" />
                            Messages
                        </h2>
                    </div>
                    <ChatList
                        selectedSessionId={selectedSessionId}
                        onSelectSession={handleSelectSession}
                    />
                </div>

                {/* Main Area - Chat Window */}
                <div className={`flex-1 flex flex-col bg-muted/30 ${!selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                    {selectedSessionId ? (
                        <ChatWindow
                            sessionId={selectedSessionId}
                            onBack={() => navigate('/chat')}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
                                <MessageCircle className="w-10 h-10 text-muted-foreground opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-1">Select a conversation</h3>
                            <p>Choose a chat from the list to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
