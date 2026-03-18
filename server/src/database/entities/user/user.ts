import { ObjectId, OptionalId } from 'mongodb';

export type UserEntity = OptionalId<User>;

export interface User {
    _id: ObjectId;
    username: string;
    email: string;
    password: string;
}

export type UserInsert = Omit<User, '_id'>;

export interface UserResponse {
    id: string;
    username: string;
    email: string;
}
