import { ChatMessageInput } from '@/components/chat/chat-message-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useFetchSelectedChatEffect } from '@/hooks/useFetchSelectedChatEffect';
import { useSelectChat } from '@/hooks/useSelectChat';
import { useSelectedChat } from '@/hooks/useSelectedChat';
import type { RepoChat } from '@/shared/interfaces/RepoChat';
import { useChatStore } from '@/store/chat';
import { useLogStore } from '@/store/log';
import { useMessageStore } from '@/store/messages';

import { Loader2 } from 'lucide-react';

export function ChatPage() {
    useSelectChat();
    const [fetching] = useFetchSelectedChatEffect();

    const setChat = useChatStore((state) => state.upsert);
    const setMessage = useMessageStore((state) => state.upsert);
    const setLog = useLogStore((state) => state.upsert);

    const currentChat: RepoChat | null = useSelectedChat();

    useChatSocket({
        chatId: fetching ? undefined : currentChat?._id,
        onStatus: (updatedChat) => setChat(updatedChat),
        onMessage: (message) => setMessage({ ...message, animate: true }),
        onLog: (log) => setLog(log),
    });

    if (fetching) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto flex flex-col">
                <ChatMessages />
            </div>

            <div className="sticky bottom-0 z-10">
                <ChatMessageInput />
            </div>
        </div>
    );
}
