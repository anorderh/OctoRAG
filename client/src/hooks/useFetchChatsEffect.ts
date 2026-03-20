import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';
import { api } from '../services/api/api';
import { useChatStore } from '../store/chat';

export function useFetchChatsEffect() {
    const upsert = useChatStore((s) => s.upsert);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        const fetch = async () => {
            const chats = await api.getChats();
            if (chats.length > 0) {
                upsert(...chats);
            }
        };

        if (user != null) {
            fetch();
        }
    }, [user, upsert]);
}
