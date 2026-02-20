import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelectedChat } from '../../hooks/useSelectedChat';
import { ChatStatus } from '../../shared/constants/chat-status.enums';
import type { RepoMessagePost } from '../../shared/interfaces/RepoMessage';
import { useInputStore } from '../../store/input';
import { useMessageStore } from '../../store/messages';

export function ChatConversationPanelMessageBar() {
    const currentChat = useSelectedChat();
    const submit = useMessageStore((state) => state.submit);
    const { message, setMessage } = useInputStore();

    const messageEmpty = message.trim().length === 0;
    const isReady = currentChat?.status === ChatStatus.READY;

    function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setMessage(e.target.value);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            fireSubmit();
        }
    }

    function fireSubmit() {
        if (!currentChat || messageEmpty) return;

        const post: RepoMessagePost = {
            source: 'user',
            content: message.trim(),
            chatId: currentChat._id,
        };

        submit(post);
        setMessage('');
    }

    return (
        <div
            style={{ backgroundColor: 'var(--color-card)' }}
            className="d-flex flex-row justify-content-center align-items-center chat-tab p-2">
            <textarea
                disabled={!isReady}
                value={message}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                style={{ resize: 'none' }}
                className="w-100 p-2 rounded ms-2 mb-2"
            />

            <button
                disabled={messageEmpty || !isReady}
                onClick={fireSubmit}
                className="solid-button bg-primary d-flex flex-row gap-2 ms-2 mb-2">
                <FontAwesomeIcon
                    style={{ width: 20, height: 20 }}
                    icon="fa-solid fa-paper-plane"
                />
                <span>Send</span>
            </button>
        </div>
    );
}
