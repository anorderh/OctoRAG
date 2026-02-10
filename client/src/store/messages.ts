import { create } from 'zustand';
import type {
    RepoMessage,
    RepoMessagePost,
} from '../shared/interfaces/RepoMessage';
import { sleep } from '../shared/utils/sleep';

export interface MessageState {
    messages: { [id: string]: RepoMessage };
    submit: (msg: RepoMessagePost) => Promise<void>;
    clearChat: (chatId: string) => void;
    getChatMessages: (chatId: string | null) => RepoMessage[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
    messages: {},
    submit: async (msg: RepoMessagePost) => {
        // Submit human response.
        const newMsg: RepoMessage = {
            id: crypto.randomUUID(),
            chatId: msg.chatId,
            source: msg.source,
            content: msg.content,
            date: new Date(),
        };
        set((state) => {
            let temp = { ...state };
            temp.messages[newMsg.id] = newMsg;
            return temp;
        });

        // Simulate waiting for AI.
        await sleep(500);
        const robotMsg: RepoMessage = {
            id: crypto.randomUUID(),
            chatId: msg.chatId,
            source: 'ai',
            loading: true,
            date: new Date(),
        };
        set((state) => {
            let temp = { ...state };
            temp.messages[robotMsg.id] = robotMsg;
            return temp;
        });
        await sleep(1000);
        set((state) => ({
            messages: {
                ...state.messages,
                [robotMsg.id]: {
                    id: robotMsg.id,
                    chatId: msg.chatId,
                    source: 'ai',
                    content: 'I agree!',
                    loading: false,
                    date: new Date(),
                },
            },
        }));
    },
    clearChat: (chatId: string) => {
        set((state) => {
            let temp = { ...state };
            let chatMsgs = Object.values(temp.messages).filter(
                (msg) => msg.chatId == chatId,
            );
            for (let msg of chatMsgs) {
                delete temp.messages[msg.id];
            }
            return temp;
        });
    },
    getChatMessages: (chatId: string | null) => {
        let temp = { ...get() };
        let msgs = Object.values(temp.messages);
        let chatMsgs = msgs.filter((m) => m.chatId == chatId);
        chatMsgs.sort((a, b) => a.date.getTime() - b.date.getTime());
        return chatMsgs;
    },
}));
