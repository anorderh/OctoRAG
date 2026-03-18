import { ObjectId } from 'mongodb';

export interface UserReadModel {
    _id: ObjectId;
    username: string;
    email: string;
}
