import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import type { RepoMessage } from '../../shared/interfaces/RepoMessage';

interface MessageMarkdownProps extends ComponentProps {
    message: RepoMessage;
}

export function MessageMarkdown({ message }: MessageMarkdownProps) {
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
            {message.content}
        </Markdown>
    );
}
