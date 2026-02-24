import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useChatSocket } from '../../hooks/useChatSocket';
import { useFetchSelectedChatEffect } from '../../hooks/useFetchSelectedChatEffect';
import { useSelectChat } from '../../hooks/useSelectChat';
import { useSelectedChat } from '../../hooks/useSelectedChat';
import type { RepoChat } from '../../shared/interfaces/RepoChat';
import { useChatStore } from '../../store/chat';
import { useLogStore } from '../../store/log';
import { useMessageStore } from '../../store/messages';
import { ChatActionPanel } from './ChatActionPanel';
import { ChatConversationPanel } from './ChatConversationPanel';

export function ChatPage() {
    useSelectChat();
    useFetchSelectedChatEffect();

    const setChat = useChatStore((state) => state.upsert);
    const setMessage = useMessageStore((state) => state.upsert);
    const setLog = useLogStore((state) => state.upsert);

    // Setup socket to receive new events.
    const currentChat: RepoChat | null = useSelectedChat();
    useChatSocket({
        chatId: currentChat?._id,
        onStatus: (updatedChat) => {
            setChat(updatedChat);
        },
        onMessage: (message) => {
            setMessage(message);
        },
        onLog: (log) => {
            setLog(log);
        },
    });

    return (
        <div
            style={{ height: '750px' }}
            className="w-100 d-flex flex-row justify-content-center gap-4">
            {currentChat ? (
                <>
                    <ChatActionPanel />
                    <ChatConversationPanel />
                </>
            ) : (
                <div className="w-100 d-flex flex-column align-items-center justify-content-center py-5 gap-3">
                    <FontAwesomeIcon
                        className="fa-spin fs-2"
                        icon="fa-solid fa-spinner"
                    />
                    <span className="fs-5 fw-semibold">Loading chat...</span>
                </div>
            )}
        </div>
    );
}
