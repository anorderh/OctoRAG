import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import type { RepoMessage } from '../../shared/interfaces/RepoMessage';

interface MessageMarkdownProps extends ComponentProps {
    message: RepoMessage;
}

export function MessageMarkdown({ message }: MessageMarkdownProps) {
    return (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                children={message.content ?? ''}
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
        </div>
    );
}
