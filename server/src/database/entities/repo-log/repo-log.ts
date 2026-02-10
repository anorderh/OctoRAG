import { ObjectId, OptionalId } from 'mongodb';

export interface RepoLog {
    _id: ObjectId;
    chatId: ObjectId;
    date: Date;
    content: string;
}

export type RepoLogEntity = OptionalId<RepoLog>;

export type RepoLogInsert = Omit<RepoLog, '_id'>;

export interface RepoLogResponse {
    id: string;
    chatId: string;
    date: string;
    content: string;
}
