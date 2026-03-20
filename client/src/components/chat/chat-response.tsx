import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useSelectedChat } from '@/hooks/useSelectedChat';
import type { RepoMessage } from '../../shared/interfaces/RepoMessage';
import { useMessageStore } from '../../store/messages';
import { ChatResponseLoadingIndicator } from './chat-response-loading-indicator';

type ChatResponseProps = {
    message: RepoMessage;
    speed?: number;
};

export function ChatResponse({ message, speed = 8 }: ChatResponseProps) {
    const chat = useSelectedChat();
    const [displayed, setDisplayed] = useState(
        message.animate ? '' : message.content || '',
    );

    const messageStore = useMessageStore();

    useEffect(() => {
        if (!message.animate) {
            setDisplayed(message.content || '');
            return;
        }

        let index = 0;
        setDisplayed('');

        const interval = setInterval(() => {
            index++;
            const content = message.content || '';
            setDisplayed(content.slice(0, index));

            if (index >= content.length) {
                clearInterval(interval);

                messageStore.upsert({
                    ...message,
                    animate: false,
                });
            }
        }, speed);

        return () => clearInterval(interval);
    }, [message, speed, messageStore]);

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Content */}
            <div className="w-full text-sm leading-relaxed text-foreground">
                {message.loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{message.content || 'Thinking...'}</span>
                    </div>
                ) : (
                    <Markdown
                        children={displayed}
                        components={{
                            code(props) {
                                const { children, className } = props;
                                const match = /language-(\w+)/.exec(
                                    className || '',
                                );

                                return match ? (
                                    <SyntaxHighlighter
                                        PreTag="div"
                                        language={match[1]}
                                        style={okaidia}>
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className={className}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    />
                )}
            </div>
            <ChatResponseLoadingIndicator
                status={chat?.status!}
                date={message.date}
            />
        </div>
    );
}
