import { create } from 'zustand';
import { api } from '../services/api/api';
import type {
    RepoMessage,
    RepoMessagePost,
} from '../shared/interfaces/RepoMessage';

export interface MessageState {
    ids: string[];
    entities: Record<string, RepoMessage>;

    upsert: (message: RepoMessage) => void;
    upsertMany: (...messages: RepoMessage[]) => void;
    remove: (id: string) => void;
    clearChat: (chatId: string) => void;

    submit: (msg: RepoMessagePost) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
    ids: [],
    entities: {},

    upsert: (message: RepoMessage) =>
        set((state) => {
            const exists = !!state.entities[message._id];

            return {
                ids: exists ? state.ids : [...state.ids, message._id],
                entities: {
                    ...state.entities,
                    [message._id]: message,
                },
            };
        }),

    upsertMany: (...newMessages: RepoMessage[]) =>
        set((state) => {
            const ids = [...state.ids];
            const entities = { ...state.entities };

            for (const msg of newMessages) {
                if (!entities[msg._id]) {
                    ids.push(msg._id);
                }
                entities[msg._id] = msg;
            }

            return { ids, entities };
        }),

    remove: (id: string) =>
        set((state) => {
            const { [id]: _, ...rest } = state.entities;
            return {
                entities: rest,
                ids: state.ids.filter((x) => x !== id),
            };
        }),

    clearChat: (chatId: string) =>
        set((state) => {
            const entities = { ...state.entities };
            const ids: string[] = [];

            for (const id of state.ids) {
                const msg = entities[id];
                if (msg.chatId === chatId) {
                    delete entities[id];
                } else {
                    ids.push(id);
                }
            }

            return { ids, entities };
        }),

    submit: async (msg: RepoMessagePost) => {
        await api.messageChat({
            chatId: msg.chatId,
            input: msg.content,
        });
    },
}));

export const selectMessagesForChat =
    (chatId: string | null) =>
    (state: MessageState): RepoMessage[] =>
        state.ids
            .map((id) => state.entities[id])
            .filter((m) => m.chatId === chatId)
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
            );
