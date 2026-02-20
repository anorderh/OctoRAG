import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../services/api/api';
import { useChatStore } from '../store/chat';
import { useSelectedChat } from './useSelectedChat';

export function useFetchSelectedChatEffect() {
    const selectedChat = useSelectedChat();
    const chatStore = useChatStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedChat == null) {
            const fetch = async () => {
                const chats = await api.getChats();
                if (chats.length > 0) {
                    chatStore.setChats(...chats);
                } else {
                    // Navigate back to grid if chat doesn't exist.
                    navigate('/');
                }
            };
            fetch();
        }
    }, [selectedChat]);
}
