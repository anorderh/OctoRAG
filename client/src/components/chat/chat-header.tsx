import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Input } from '@/components/ui/input';

import { ChevronDown, FileText, Info, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ChatDetailsDialog } from './chat-details-dialog';
import { DeleteChatDialog } from './delete-chat-dialog';
import { LogsDialog } from './logs-dialog';

import { useSelectedChat } from '@/hooks/useSelectedChat';
import { api } from '@/services/api/api';

export function ChatHeader() {
    const chat = useSelectedChat();

    const [logsOpen, setLogsOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(chat?.repoName ?? '');

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(chat?.repoName ?? '');
    }, [chat]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const submit = async () => {
        const trimmed = value.trim();

        if (!chat?._id) return;

        if (!trimmed || trimmed === chat.repoName) {
            setIsEditing(false);
            return;
        }

        setIsEditing(false);

        try {
            await api.editChat({
                chatId: chat._id,
                repoName: trimmed,
            });
        } catch {}
    };

    const cancel = () => {
        setIsEditing(false);
        setValue(chat?.repoName ?? '');
    };

    return (
        <div className="w-full flex items-center justify-between px-6 py-3">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <Input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={submit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submit();
                            }
                            if (e.key === 'Escape') {
                                e.preventDefault();
                                cancel();
                            }
                        }}
                        className="h-7 text-sm px-2"
                    />
                ) : (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <button
                                onDoubleClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                                <span className="truncate max-w-[240px]">
                                    {chat?.repoName}
                                </span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="start"
                            className="w-48 bg-popover border border-border text-popover-foreground">
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setDetailsOpen(true);
                                }}
                                className="flex items-center gap-2 text-sm cursor-pointer">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                Details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setLogsOpen(true);
                                }}
                                className="flex items-center gap-2 text-sm cursor-pointer">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Open Logs
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-border" />

                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setDeleteOpen(true);
                                }}
                                className="flex items-center gap-2 text-sm text-destructive cursor-pointer">
                                <Trash2 className="h-4 w-4" />
                                Delete Chat
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* DIALOGS */}
            <ChatDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
            <LogsDialog open={logsOpen} onOpenChange={setLogsOpen} />
            <DeleteChatDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
        </div>
    );
}
