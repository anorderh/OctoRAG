import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useChatStore } from '../store/chat';
import { useInputStore } from '../store/input';

// Hook responsible for selecting a chat.
export function useSelectChat() {
    const params = useParams();
    const selectChat = useChatStore((state) => state.select);
    const setMessage = useInputStore((state) => state.setMessage);

    useEffect(() => {
        selectChat(params.chatId ?? null);
        return () => {
            selectChat(null);
            setMessage('');
        };
    }, [params]);
}
