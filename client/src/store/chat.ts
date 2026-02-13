import { create } from 'zustand';
import { ChatStatus } from '../shared/constants/chat-status.enums';
import type { RepoChat, RepoChatPost } from '../shared/interfaces/RepoChat';
import { sleep } from '../shared/utils/sleep';

export interface ChatState {
    chats: RepoChat[];
    selectedId: string | null;
    create: (chat: RepoChatPost) => Promise<RepoChat>;
    add: (chat: RepoChat) => void;
    select: (chatId: string | null) => void;
    remove: (chat: RepoChat) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    chats: [
        {
            id: 'typescript',
            userId: 'anthony',
            repoName: 'Typescript',
            repoUrl: 'https://www.google.com',
            creationDate: '1/1/2025',
            lastMessageDate: '1/1/2025',
            messageCount: 25,
            status: ChatStatus.LOADING,
        },
        {
            id: 'gameboy',
            userId: 'anthony',
            repoName: 'GameboyMod',
            repoUrl: 'https://www.google.com',
            creationDate: '1/1/2025',
            lastMessageDate: '1/1/2025',
            messageCount: 25,
            status: ChatStatus.READY,
        },
    ],
    selectedId: null,
    create: async (chat: RepoChatPost) => {
        await sleep(500);
        const createdChat: RepoChat = {
            id: crypto.randomUUID().toString(),
            repoName: chat.repoName,
            repoUrl: chat.repoUrl,
            creationDate: new Date().toLocaleDateString('en-US'),
            messageCount: 0,
            status: ChatStatus.LOADING,
        };
        set((state) => ({ ...state, chats: state.chats.concat(createdChat) }));
        return createdChat;
    },
    add: (chat: RepoChat) =>
        set((state) => ({ ...state, chats: state.chats.concat([chat]) })),
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
