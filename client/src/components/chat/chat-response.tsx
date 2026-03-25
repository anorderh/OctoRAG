import type { ChatStatus } from '@/shared/constants/chat-status.enums';
import type { RepoMessage } from '../../shared/interfaces/RepoMessage';
import { MessageMarkdown } from '../shared/message-markdown';
import { ChatResponseLoadingIndicator } from './chat-response-loading-indicator';

type ChatResponseProps = {
    message: RepoMessage;
    status: ChatStatus;
};

export function ChatResponse({ message, status }: ChatResponseProps) {
    return (
        <div className="w-full flex flex-col gap-2">
            {/* AI Content */}
            <div className="max-w-3xl text-[15px] leading-6 text-foreground">
                <MessageMarkdown message={message} />
            </div>

            {/* Status / Timestamp */}
            <ChatResponseLoadingIndicator status={status} date={message.date} />
        </div>
    );
}
