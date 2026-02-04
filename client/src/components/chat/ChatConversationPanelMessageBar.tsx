import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';
import { useSelectedChat } from '../../hooks/selectors/useSelectedChat';
import type { RepoMessagePost } from '../../shared/interfaces/RepoMessage';
import { useMessageStore } from '../../store/messages';

export function ChatConversationPanelMessageBar() {
    const textarea = useRef<HTMLTextAreaElement>(null);
    const currentInput = () => textarea.current?.value ?? '';
    const currentChat = useSelectedChat();
    const submit = useMessageStore((state) => state.submit);

    function fireSubmit() {
        const input = currentInput();
        console.log(input);
        if (input !== '') {
            const post: RepoMessagePost = {
                source: 'user',
                content: currentInput(),
                chatId: currentChat!.id,
            };
            submit(post);
            textarea.current!.value = '';
        }
    }

    return (
        <div
            style={{
                backgroundColor: 'var(--color-card)',
            }}
            className="d-flex flex-row justify-content-center align-items-center chat-tab p-2">
            <textarea
                ref={textarea}
                placeholder="Send a message..."
                style={{
                    resize: 'none',
                }}
                className="w-100 p-2 rounded ms-2 mb-2"></textarea>
            <button
                onClick={() => fireSubmit()}
                className="solid-button d-flex flex-row gap-2 ms-2 mb-2">
                <FontAwesomeIcon
                    style={{ width: 20, height: 20 }}
                    icon="fa-solid fa-paper-plane"></FontAwesomeIcon>
                <span>Send</span>
            </button>
        </div>
    );
}
