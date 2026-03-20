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
import { useSelectedChat } from '@/hooks/useSelectedChat';
import { api } from '@/services/api/api';
import { useChatStore } from '@/store/chat';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

type DeleteChatDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DeleteChatDialog({
    open,
    onOpenChange,
}: DeleteChatDialogProps) {
    const chat = useSelectedChat();
    const navigate = useNavigate();
    const deleteChat = useChatStore((s) => s.delete);

    // Guard.
    if (!chat) {
        return null;
    }

    async function handleDelete() {
        try {
            await api.deleteChat({
                chatId: chat!._id,
            });
            deleteChat(chat!._id);
            onOpenChange(false);
            navigate('/');
            toast.success('Chat deleted', {
                icon: <Check className="h-4 w-4 text-primary" />,
            });
        } catch (err) {
            toast.error('Failed to delete chat');
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-popover border border-border shadow-xl">
                <AlertDialogHeader className="pb-2">
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete{' '}
                        <span className="font-medium">{chat.repoName}</span> and
                        all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="bg-transparent border-t border-border pt-4">
                    <AlertDialogCancel className="border border-border bg-transparent hover:bg-accent">
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-primary text-primary-foreground hover:opacity-90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
