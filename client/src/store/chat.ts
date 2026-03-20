import { create } from 'zustand';
import { api } from '../services/api/api';
import type { RepoChat, RepoChatPost } from '../shared/interfaces/RepoChat';

export interface ChatState {
    ids: string[];
    entities: Record<string, RepoChat>;
    selectedId: string | null;

    create: (chat: RepoChatPost) => Promise<RepoChat>;
    upsert: (...chats: RepoChat[]) => void;
    setAll: (...chats: RepoChat[]) => void;
    delete: (chatId: string) => Promise<void>;
    select: (chatId: string | null) => void;
    remove: (chatId: string) => void;

    reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    ids: [],
    entities: {},
    selectedId: null,

    create: async (chatPost: RepoChatPost) => {
        const repoChat = await api.createChat(chatPost);

        set((state) => {
            const ids = state.ids.includes(repoChat._id)
                ? state.ids
                : [...state.ids, repoChat._id];

            return {
                ids,
                entities: {
                    ...state.entities,
                    [repoChat._id]: repoChat,
                },
            };
        });

        return repoChat;
    },

    upsert: (...newChats: RepoChat[]) =>
        set((state) => {
            const ids = [...state.ids];
            const entities = { ...state.entities };

            for (const chat of newChats) {
                if (!entities[chat._id]) {
                    ids.push(chat._id);
                }
                entities[chat._id] = chat;
            }

            return { ids, entities };
        }),

    setAll: (...chats: RepoChat[]) =>
        set(() => {
            const entities: Record<string, RepoChat> = {};
            const ids: string[] = [];

            for (const chat of chats) {
                entities[chat._id] = chat;
                ids.push(chat._id);
            }

            return { ids, entities };
        }),

    delete: async (chatId: string) => {
        await api.deleteChat({ chatId });

        set((state) => {
            const { [chatId]: _, ...rest } = state.entities;

            return {
                entities: rest,
                ids: state.ids.filter((id) => id !== chatId),
                selectedId:
                    state.selectedId === chatId ? null : state.selectedId,
            };
        });
    },

    remove: (chatId: string) =>
        set((state) => {
            const { [chatId]: _, ...rest } = state.entities;

            return {
                entities: rest,
                ids: state.ids.filter((id) => id !== chatId),
            };
        }),

    select: (chatId: string | null) => set({ selectedId: chatId }),

    reset: () =>
        set({
            ids: [],
            entities: {},
            selectedId: null,
        }),
}));
