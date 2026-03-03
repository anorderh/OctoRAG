import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import type { RepoMessage } from '../../shared/interfaces/RepoMessage';
import { useMessageStore } from '../../store/messages';

interface MessageMarkdownProps extends ComponentProps {
    message: RepoMessage;
    speed?: number;
    animate?: boolean;
}

export function MessageMarkdown({
    message,
    speed = 8,
    animate = false,
}: MessageMarkdownProps) {
    const [displayed, setDisplayed] = useState(message.content);
    const messageStore = useMessageStore();

    useEffect(() => {
        console.log(displayed);
        // Start typing.
        if (animate) {
            let index = 0;
            setDisplayed('');
            const interval = setInterval(() => {
                index++;
                let content = message.content ?? '';
                setDisplayed(content.slice(0, index));
                if (index >= content.length) {
                    messageStore.upsert({
                        ...message,
                        animate: false,
                    });
                    clearInterval(interval);
                }
            }, speed);
        }
    }, [message, speed]);

    return (
        <Markdown
            children={displayed}
            components={{
                code(props) {
                    const { children, className } = props;
                    const match = /language-(\w+)/.exec(className || '');

                    return match ? (
                        <SyntaxHighlighter
                            PreTag="div"
                            language={match[1]}
                            children={String(children).replace(/\n$/, '')}
                            style={okaidia}
                        />
                    ) : (
                        <code className={className}>{children}</code>
                    );
                },
            }}
        />
    );
}
