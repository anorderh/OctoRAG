import { Dialog, DialogContent } from '@/components/ui/dialog';

import { type Log, LogsViewer } from './logs-viewer';

type LogsDialogProps = {
    logs: Log[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function LogsDialog({ logs, open, onOpenChange }: LogsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
                    min-w-[600px]
                    p-0
                    bg-transparent
                    border-none
                    shadow-none
                    
                ">
                <LogsViewer logs={logs} />
            </DialogContent>
        </Dialog>
    );
}
