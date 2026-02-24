import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import type { RepoMessage } from '../../shared/interfaces/RepoMessage';
import { useMessageStore } from '../../store/messages';

interface TypewriterMarkdownProps extends ComponentProps {
    message: RepoMessage;
    speed?: number;
}

export function TypewriterMarkdown({
    message,
    speed = 15,
}: TypewriterMarkdownProps) {
    const [displayed, setDisplayed] = useState('');
    const messageStore = useMessageStore();

    useEffect(() => {
        let index = 0;
        setDisplayed('');

        // Start typing.
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
        return () => {
            messageStore.upsert({
                ...message,
                animate: false,
            });
            clearInterval(interval);
        };
    }, [message, speed]);

    return (
        <Markdown
            rehypePlugins={[rehypeHighlight]}
            components={{
                p: ({ children }) => (
                    <p style={{ marginBottom: '0px' }}>{children}</p>
                ),
                pre: ({ children }) => (
                    <pre
                        style={{
                            borderRadius: '15px',
                            padding: '10px',
                            background: '#202020',
                            color: '#CCCCCC',
                            overflowX: 'auto',
                        }}>
                        {children}
                    </pre>
                ),
            }}>
            {displayed}
        </Markdown>
    );
}
