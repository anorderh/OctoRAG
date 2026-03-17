import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ChevronDown, FileText, Info, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { LogsDialog } from './logs-dialog';

type Log = {
    id: number;
    timestamp: string;
    content: string;
};

type ChatHeaderProps = {
    title: string;
};

export function ChatHeader({ title }: ChatHeaderProps) {
    const [logsOpen, setLogsOpen] = useState(false);

    const logs: Log[] = [
        {
            id: 1,
            timestamp: '7:09 am, May 5 2025',
            content: 'Log content Log content Log content...',
        },
        {
            id: 2,
            timestamp: '7:10 am, May 5 2025',
            content: 'Another log entry here...',
        },
    ];

    return (
        <div className="w-full flex items-center justify-between px-6 py-3">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <span className="truncate max-w-[240px]">{title}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="start"
                    className="w-48 bg-popover border border-border text-popover-foreground">
                    <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer">
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

                    <DropdownMenuItem className="flex items-center gap-2 text-sm text-destructive cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                        Delete Chat
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <LogsDialog
                logs={logs}
                open={logsOpen}
                onOpenChange={setLogsOpen}
            />
        </div>
    );
}
