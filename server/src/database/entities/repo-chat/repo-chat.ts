import { ObjectId, OptionalId } from 'mongodb';
import { ChatStatus } from 'src/database/shared/constants/chat-status.enum';

export interface RepoChat {
    _id: ObjectId;
    repoName: string;
    repoUrl: string;
    creationDate: Date;
    lastMessageDate?: Date;
    messageCount: number;
    status: ChatStatus;
}

export type RepoChatEntity = OptionalId<RepoChat>;

export interface RepoChatPost {
    repoName: string;
    repoUrl: string;
}

export interface RepoChatResponse {
    id: string;
    repoName: string;
    repoUrl: string;
    creationDate: string;
    lastMessageDate?: string;
    messageCount: number;
    status: ChatStatus;
}
