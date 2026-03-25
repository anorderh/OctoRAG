import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { useSelectedChat } from '@/hooks/useSelectedChat';

type ChatDetailsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function formatRepoSize(kb: number): string {
    if (!kb) return '—';

    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;

    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
}

export function ChatDetailsDialog({
    open,
    onOpenChange,
}: ChatDetailsDialogProps) {
    const chat = useSelectedChat();

    if (!chat) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-popover border border-border shadow-xl sm:max-w-md">
                <DialogHeader className="pb-2">
                    <DialogTitle>Chat Details</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 text-sm">
                    {/* Repo */}
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">
                            Repository
                        </span>
                        <span className="font-medium">{chat.repoName}</span>
                    </div>

                    {/* URL */}
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Repo URL</span>
                        <a
                            href={chat.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline break-all">
                            {chat.repoUrl}
                        </a>
                    </div>

                    {/* Grid stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">
                                Messages
                            </span>
                            <span className="font-medium">
                                {chat.messageCount}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <span className="font-medium">{chat.status}</span>
                        </div>

                        {/* NEW: Repo Size */}
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">
                                Repo Size
                            </span>
                            <span className="font-medium">
                                {formatRepoSize(chat.repoSize)}
                            </span>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">
                            {new Date(chat.creationDate).toLocaleString()}
                        </span>
                    </div>

                    {chat.lastMessageDate && (
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">
                                Last Message
                            </span>
                            <span className="font-medium">
                                {new Date(
                                    chat.lastMessageDate,
                                ).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
