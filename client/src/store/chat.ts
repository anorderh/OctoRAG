import { create } from 'zustand';
import type { RepoChat } from '../shared/interfaces/RepoChat';

export interface ChatState {
    chats: RepoChat[];
    add: (chat: RepoChat) => void;
    remove: (chat: RepoChat) => void;
}

export const useChatState = create<ChatState>((set) => ({
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
    add: (chat: RepoChat) =>
        set((state) => ({ ...state, crumbs: state.chats.concat([chat]) })),
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
