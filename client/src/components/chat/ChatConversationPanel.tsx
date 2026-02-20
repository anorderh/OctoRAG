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
        useShallow((state) =>
            Object.values(state.messages)
                .filter((m) => m.chatId === currentChat?._id)
                .sort(
                    (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                ),
        ),
    );

    const is = () => currentChat?.status == ChatStatus.LOADING;

    let textBoxMsg;
    switch (currentChat?.status) {
        case ChatStatus.IDLE:
            textBoxMsg =
                'Chat has not been scraped. Run scrape to start conversation.';
            break;
        case ChatStatus.READY:
            textBoxMsg = `Start chatting with "${currentChat?.repoName}"`;
            break;
        case ChatStatus.LOADING:
            textBoxMsg = 'Chat is currently being scraped...';
            break;
    }

    return (
        <div
            id="repoChats"
            style={{
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
                        <span className="text-muted fs-6 text-center p-2">
                            {textBoxMsg}
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="flex-grow-1" />
                        {currentMessages.map((msg, idx) => {
                            return msg.source == 'ai' ? (
                                <RobotMessage
                                    key={msg._id}
                                    messageId={msg._id}
                                />
                            ) : (
                                <UserMessage
                                    key={msg._id}
                                    messageId={msg._id}
                                />
                            );
                        })}
                    </>
                )}
            </div>
            <ChatConversationPanelMessageBar />
        </div>
    );
}
