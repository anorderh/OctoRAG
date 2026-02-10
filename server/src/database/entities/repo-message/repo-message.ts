import { ObjectId, OptionalId } from 'mongodb';

export interface RepoMessage {
    _id: ObjectId;
    chatId: ObjectId;
    source: 'ai' | 'user';
    content?: string;
    loading?: boolean;
    date: Date;
}

export type RepoMessageInsert = Omit<RepoMessage, '_id'>;

export type RepoMessageEntity = OptionalId<RepoMessage>;

export interface RepoMessagePost {
    input: string;
}

export interface RepoMessageResponse {
    id: string;
    chatId: string;
    source: 'ai' | 'user';
    content?: string;
    loading?: boolean;
    date: string;
}
