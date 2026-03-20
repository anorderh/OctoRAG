import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSelectedChat } from '@/hooks/useSelectedChat';
import { ChatStatus } from '@/shared/constants/chat-status.enums';
import type { RepoMessagePost } from '@/shared/interfaces/RepoMessage';
import { useInputStore } from '@/store/input';
import { useMessageStore } from '@/store/messages';
import { Send } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function ChatMessageInput() {
    const currentChat = useSelectedChat();
    const submit = useMessageStore((state) => state.submit);
    const { message, setMessage } = useInputStore();

    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Auto-grow WITHOUT scrollbars
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = '0px';

        const newHeight = Math.min(el.scrollHeight, 160);
        el.style.height = `${newHeight}px`;
    }, [message]);

    return (
        <div className="px-4 pb-6 bg-background">
            <div className="relative max-w-3xl mx-auto">
                <Textarea
                    ref={textareaRef}
                    disabled={!isReady}
                    value={message}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Send a message..."
                    rows={1}
                    className="
                        min-h-[48px]
                        resize-none
                        overflow-hidden
                        rounded-2xl
                        pl-5
                        pr-14
                        py-3
                        bg-card
                        text-card-foreground
                        text-[15px]
                        leading-6
                        border border-border
                        focus-visible:ring-1
                        focus-visible:ring-primary
                        disabled:opacity-100
                        disabled:cursor-not-allowed
                    "
                />

                <Button
                    size="icon"
                    disabled={messageEmpty || !isReady}
                    onClick={fireSubmit}
                    className="
                        absolute right-2 bottom-2
                        h-8 w-8
                        rounded-full
                        bg-primary
                        hover:bg-primary/90
                        disabled:opacity-50
                    ">
                    <Send className="h-4 w-4 text-white" />
                </Button>
            </div>
        </div>
    );
}
