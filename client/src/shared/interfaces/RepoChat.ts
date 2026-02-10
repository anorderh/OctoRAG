import type { ChatStatus } from '../constants/chat-status.enums';

export interface RepoChat {
    id: string;
    userId: string;
    repoName: string;
    repoUrl: string;
    creationDate: string;
    lastMessageDate?: string;
    messageCount: number;
    status: ChatStatus;
}

export interface RepoChatPost {
    repoName: string;
    repoUrl: string;
}
