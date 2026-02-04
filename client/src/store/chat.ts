import { create } from 'zustand';
import type { RepoChat } from '../shared/interfaces/RepoChat';

export interface ChatState {
    chats: RepoChat[];
    selectedId: string | null;
    add: (chat: RepoChat) => void;
    select: (chatId: string | null) => void;
    remove: (chat: RepoChat) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    chats: [
        {
            id: 'test',
            repoName: 'Typescript',
            repoUrl: 'https://www.google.com',
            creationDate: '1/1/2025',
            lastMessageDate: '1/1/2025',
            messageCount: 25,
        },
        {
            id: 'test',
            repoName: 'Typescript',
            repoUrl: 'https://www.google.com',
            creationDate: '1/1/2025',
            lastMessageDate: '1/1/2025',
            messageCount: 25,
        },
        {
            id: 'test',
            repoName: 'Typescript',
            repoUrl: 'https://www.google.com',
            creationDate: '1/1/2025',
            lastMessageDate: '1/1/2025',
            messageCount: 25,
        },
        {
            id: 'test',
            repoName: 'Typescript',
            repoUrl: 'https://www.google.com',
            creationDate: '1/1/2025',
            lastMessageDate: '1/1/2025',
            messageCount: 25,
        },
        {
            id: 'test',
            repoName: 'Typescript',
            repoUrl: 'https://www.google.com',
            creationDate: '1/1/2025',
            lastMessageDate: '1/1/2025',
            messageCount: 25,
        },
        {
            id: 'test',
            repoName: 'Typescript',
            repoUrl: 'https://www.google.com',
            creationDate: '1/1/2025',
            lastMessageDate: '1/1/2025',
            messageCount: 25,
        },
        {
            id: 'test',
            repoName: 'Typescript',
            repoUrl: 'https://www.google.com',
            creationDate: '1/1/2025',
            lastMessageDate: '1/1/2025',
            messageCount: 25,
        },
        {
            id: 'test',
            repoName: 'Typescript',
            repoUrl: 'https://www.google.com',
            creationDate: '1/1/2025',
            lastMessageDate: '1/1/2025',
            messageCount: 25,
        },
    ],
    selectedId: null,
    add: (chat: RepoChat) =>
        set((state) => ({ ...state, crumbs: state.chats.concat([chat]) })),
    select: (chatId: string | null) =>
        set((state) => ({ ...state, selectedId: chatId })),
    remove: (chat: RepoChat) =>
        set((state) => {
            let chats = state.chats;
            chats = chats.filter((c) => c.id != chat.id);
            return {
                ...state,
                chats,
            };
        }),
}));
