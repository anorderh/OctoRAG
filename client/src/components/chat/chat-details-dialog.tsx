import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import type { RepoChat } from '@/shared/interfaces/RepoChat';

type ChatDetailsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chat?: RepoChat;
};

const defaultChat: RepoChat = {
    _id: 'demo-id',
    userId: 'demo-user',
    repoName: 'example-repo',
    repoUrl: 'https://github.com/example/repo',
    creationDate: new Date().toISOString(),
    lastMessageDate: new Date().toISOString(),
    messageCount: 12,
    status: 'ACTIVE' as any,
};

export function ChatDetailsDialog({
    open,
    onOpenChange,
    chat = defaultChat,
}: ChatDetailsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Chat Details
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 text-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">
                            Repository
                        </span>
                        <span className="font-medium">{chat.repoName}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Repo URL</span>
                        <a
                            href={chat.repoUrl}
                            target="_blank"
                            className="text-primary underline break-all">
                            {chat.repoUrl}
                        </a>
                    </div>

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
                    </div>

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
