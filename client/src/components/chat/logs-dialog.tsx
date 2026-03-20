import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { LogsViewer } from './logs-viewer';

type LogsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function LogsDialog({ open, onOpenChange }: LogsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
            p-0    
            min-w-[800px]
        ">
                <VisuallyHidden>
                    <DialogTitle>Logs Viewer</DialogTitle>
                </VisuallyHidden>
                {/* Content */}
                <LogsViewer />
            </DialogContent>
        </Dialog>
    );
}
