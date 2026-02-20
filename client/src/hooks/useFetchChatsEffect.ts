import { useEffect } from 'react';
import { api } from '../services/api/api';
import { useChatStore } from '../store/chat';

export function useFetchChatsEffect() {
    const chatStore = useChatStore();
    useEffect(() => {
        const fetch = async () => {
            const chats = await api.getChats();
            if (chats.length > 0) {
                chatStore.setChats(...chats);
            }
        };
        fetch();
    }, []);
}
