import type { RepoMessage } from '../../shared/interfaces/RepoMessage';

type ChatInputProps = {
    message: RepoMessage;
};

export function ChatInput({ message }: ChatInputProps) {
    const formattedTime = new Date(message.date).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });

    return (
        <div className="w-full flex flex-col items-end gap-1">
            {/* Message Bubble */}
            <div
                className="
                    max-w-[75%]
                    px-4 py-2.5
                    rounded-2xl
                    bg-primary
                    text-primary-foreground
                    text-[15px]
                    leading-6
                    break-words
                    whitespace-pre-wrap
                ">
                {message.content}
            </div>

            {/* Timestamp */}
            <span className="text-xs text-muted-foreground pr-1 select-none">
                {formattedTime}
            </span>
        </div>
    );
}
