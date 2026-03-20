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
        <div className="flex flex-col items-end gap-1 w-full">
            <div
                className="
                    max-w-[70%]
                    px-4 py-2
                    rounded-2xl
                    bg-primary
                    text-primary-foreground
                    text-sm
                ">
                {message.content}
            </div>

            <span className="text-xs text-muted-foreground pr-1">
                {formattedTime}
            </span>
        </div>
    );
}
