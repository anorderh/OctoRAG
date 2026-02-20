import { create } from 'zustand';
import { api } from '../services/api/api';
import type { RepoChat, RepoChatPost } from '../shared/interfaces/RepoChat';

export interface ChatState {
    chats: RepoChat[];
    selectedId: string | null;
    create: (chat: RepoChatPost) => Promise<RepoChat>;
    setChat: (chat: RepoChat) => void;
    delete: (chatId: string) => Promise<void>;
    setChats: (...chats: RepoChat[]) => void;
    addChats: (...chats: RepoChat[]) => void;
    select: (chatId: string | null) => void;
    remove: (chat: RepoChat) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    chats: [],
    selectedId: null,
    create: async (chatPost: RepoChatPost) => {
        const repoChat = await api.createChat(chatPost);
        set((state) => ({ ...state, chats: state.chats.concat(repoChat) }));
        return repoChat;
    },
    setChat: (chat: RepoChat) =>
        set((state) => {
            const idx = state.chats.findIndex((c) => c._id === chat._id);
            if (idx === -1) return state;
            const updatedChats = [...state.chats];
            updatedChats[idx] = chat;
            return { chats: updatedChats };
        }),
    delete: async (chatId: string) => {
        await api.deleteChat({ chatId });
        set((state) => {
            const updatedChats = state.chats.filter(
                (chat) => chat._id !== chatId,
            );

            return {
                chats: updatedChats,
                selectedId:
                    state.selectedId === chatId ? null : state.selectedId,
            };
        });
    },
    setChats: (...chats: RepoChat[]) => set((state) => ({ ...state, chats })),
    addChats: (...chats: RepoChat[]) =>
        set((state) => ({ ...state, chats: state.chats.concat(chats) })),
    select: (chatId: string | null) =>
        set((state) => ({ ...state, selectedId: chatId })),
    remove: (chat: RepoChat) =>
        set((state) => {
            let chats = state.chats;
            chats = chats.filter((c) => c._id != chat._id);
            return {
                ...state,
                chats,
            };
        }),
}));
