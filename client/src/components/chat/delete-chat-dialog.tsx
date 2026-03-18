import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

type DeleteChatDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm?: () => void;
    chatName?: string;
};

export function DeleteChatDialog({
    open,
    onOpenChange,
    onConfirm,
    chatName = 'this chat',
}: DeleteChatDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-popover border border-border shadow-xl">
                <AlertDialogHeader className="pb-2">
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete <span className="font-medium">{chatName}</span>{' '}
                        and all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="bg-transparent border-t border-border pt-4">
                    <AlertDialogCancel className="border border-border bg-transparent hover:bg-accent">
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={() => {
                            onConfirm?.();
                            toast.success('Chat deleted', {
                                icon: (
                                    <Check className="h-4 w-4 text-primary" />
                                ),
                            });
                        }}
                        className="bg-primary text-primary-foreground hover:opacity-90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
