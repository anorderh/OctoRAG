import { useSelectChat } from '../../hooks/useSelectChat';
import { ChatActionPanel } from './ChatActionPanel';
import { ChatConversationPanel } from './ChatConversationPanel';

export function ChatPage() {
    useSelectChat();
    return (
        <div
            style={{
                width: '95%',
                minWidth: '800px',
            }}
            className="h-100 d-flex flex-row justify-content-center align-items-start gap-4">
            <ChatActionPanel />
            <ChatConversationPanel />
        </div>
    );
}
