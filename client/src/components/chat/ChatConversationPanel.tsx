import { useShallow } from 'zustand/react/shallow';
import { useSelectedChat } from '../../hooks/useSelectedChat';
import { ChatStatus } from '../../shared/constants/chat-status.enums';
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

    const isLoading = () => currentChat?.status == ChatStatus.LOADING;

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
            className={
                'd-flex flex-column overflow-hidden justify-content-between chat-container rounded-5 '
            }>
            <ChatConversationPanelHeader />
            <div className="flex-grow-1 overflow-scroll d-flex flex-column gap-3 p-3">
                {currentMessages.length == 0 ? (
                    <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                        <span className="text-muted fs-6">
                            {isLoading() ? (
                                <span>
                                    Wait until the Github repo finishes
                                    processing...
                                </span>
                            ) : (
                                <span>
                                    Start chatting with{' '}
                                    <b>{currentChat?.repoName}</b>!
                                </span>
                            )}
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="flex-grow-1" />
                        {currentMessages.map((msg, idx) => {
                            return msg.source == 'ai' ? (
                                <RobotMessage key={idx} messageId={msg.id} />
                            ) : (
                                <UserMessage key={idx} messageId={msg.id} />
                            );
                        })}
                    </>
                )}
            </div>
            <ChatConversationPanelMessageBar />
        </div>
    );
}
