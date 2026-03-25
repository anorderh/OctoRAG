import type { ChatStatus } from '../constants/chat-status.enums';

export interface RepoChat {
    _id: string;
    userId: string;
    repoName: string;
    repoUrl: string;
    repoSize: number;
    creationDate: string;
    lastMessageDate?: string;
    messageCount: number;
    status: ChatStatus;
}

export interface RepoChatPost {
    repoUrl: string;
}
