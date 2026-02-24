import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../services/api/api';
import { useChatStore } from '../store/chat';
import { useLogStore } from '../store/log';
import { useMessageStore } from '../store/messages';

export function useFetchSelectedChatEffect() {
    const chatStore = useChatStore();
    const messageStore = useMessageStore();
    const logStore = useLogStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            const selectedId = chatStore.selectedId;
            if (selectedId != null) {
                try {
                    const res = await api.getChat({ chatId: selectedId });
                    chatStore.upsert(res.data.chat);
                    messageStore.upsertMany(...res.data.messages);
                    logStore.upsert(...res.data.logs);
                } catch (err) {
                    navigate('/');
                }
            }
        };
        fetch();
    }, [chatStore.selectedId]);
}
