import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';
import { useSelectedChat } from '../../hooks/useSelectedChat';
import { ChatStatus } from '../../shared/constants/chat-status.enums';
import type { RepoMessagePost } from '../../shared/interfaces/RepoMessage';
import { useInputStore } from '../../store/input';
import { useMessageStore } from '../../store/messages';

export function ChatConversationPanelMessageBar() {
    // Reference DOM.
    const textarea = useRef<HTMLTextAreaElement>(null);
    const currentInput = () => textarea.current?.value ?? '';

    // Store values.
    const currentChat = useSelectedChat();
    const submit = useMessageStore((state) => state.submit);
    const { message, setMessage } = useInputStore();

    const messageEmpty = () => (message?.length ?? 0) == 0;
    const isLoading = () => currentChat?.status == ChatStatus.LOADING;

    // Handlers.
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        setMessage(e.target.value);
    }
    function handleKeyDown(e: KeyboardEvent) {
        if (e.key == 'Enter' && (e.metaKey || e.ctrlKey)) {
            fireSubmit();
        }
    }
    function fireSubmit() {
        const input = currentInput();
        console.log(input);
        if (input !== '') {
            const post: RepoMessagePost = {
                source: 'user',
                content: message,
                chatId: currentChat!.id,
            };
            submit(post);
            setMessage('');
        }
    }

    return (
        <div
            style={{
                backgroundColor: 'var(--color-card)',
            }}
            className="d-flex flex-row justify-content-center align-items-center chat-tab p-2">
            <textarea
                disabled={isLoading()}
                value={message}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                ref={textarea}
                placeholder="Send a message..."
                style={{
                    resize: 'none',
                }}
                className="w-100 p-2 rounded ms-2 mb-2"></textarea>
            <button
                disabled={messageEmpty() || isLoading()}
                onClick={() => fireSubmit()}
                className="solid-button bg-primary d-flex flex-row gap-2 ms-2 mb-2">
                <FontAwesomeIcon
                    style={{ width: 20, height: 20 }}
                    icon="fa-solid fa-paper-plane"></FontAwesomeIcon>
                <span>Send</span>
            </button>
        </div>
    );
}
