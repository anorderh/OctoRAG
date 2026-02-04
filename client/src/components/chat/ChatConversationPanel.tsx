import { useShallow } from 'zustand/react/shallow';
import { useSelectedChat } from '../../hooks/selectors/useSelectedChat';
import { useMessageStore } from '../../store/messages';
import { ChatConversationPanelHeader } from './ChatConversationPanelHeader';
import { ChatConversationPanelMessageBar } from './ChatConversationPanelMessageBar';
import { RobotMessage } from './RobotMessage';
import { UserMessage } from './UserMessage';

export function ChatConversationPanel() {
    const currentChat = useSelectedChat();
    const currentMessages = useMessageStore(
        useShallow((state) => state.getChatMessages(currentChat?.id ?? '')),
    );

    return (
        <div
            id="repoChats"
            style={{
                minHeight: '750px',
                height: '90%',
                width: '50%',
                minWidth: '400px',
                maxWidth: '550px',
            }}
            className="d-flex flex-column overflow-hidden justify-content-between chat-container rounded-5">
            <ChatConversationPanelHeader />
            <div className="flex-grow-1 overflow-scroll d-flex flex-column gap-3 p-3">
                <div className="flex-grow-1" />
                {currentMessages.map((msg) => {
                    return msg.source == 'ai' ? (
                        <RobotMessage messageId={msg.id} />
                    ) : (
                        <UserMessage messageId={msg.id} />
                    );
                })}
            </div>
            <ChatConversationPanelMessageBar />
        </div>
    );
}
