import { create } from 'zustand';
import { api } from '../services/api/api';
import type {
    RepoMessage,
    RepoMessagePost,
} from '../shared/interfaces/RepoMessage';

export interface MessageState {
    messages: { [id: string]: RepoMessage };
    setMessage: (message: RepoMessage) => void;
    submit: (msg: RepoMessagePost) => Promise<void>;
    clearChat: (chatId: string) => void;
    getChatMessages: (chatId: string | null) => RepoMessage[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
    messages: {},
    setMessage: (message: RepoMessage) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [message._id]: message,
            },
        })),
    submit: async (msg: RepoMessagePost) => {
        await api.messageChat({
            chatId: msg.chatId,
            input: msg.content,
        });
    },
    clearChat: (chatId: string) => {
        set((state) => {
            let temp = { ...state };
            let chatMsgs = Object.values(temp.messages).filter(
                (msg) => msg.chatId == chatId,
            );
            for (let msg of chatMsgs) {
                delete temp.messages[msg._id];
            }
            return temp;
        });
    },
    getChatMessages: (chatId: string | null) => {
        let temp = { ...get() };
        let msgs = Object.values(temp.messages);
        let chatMsgs = msgs.filter((m) => m.chatId == chatId);
        chatMsgs.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        return chatMsgs;
    },
}));
