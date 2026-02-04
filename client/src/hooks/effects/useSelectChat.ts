import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useChatStore } from '../../store/chat';

// Hook responsible for selecting a chat.
export function useSelectChat() {
    const params = useParams();
    const selectChat = useChatStore((state) => state.select);

    useEffect(() => {
        selectChat(params.chatId ?? null);
        return () => {
            selectChat(null);
        };
    }, []);
}
