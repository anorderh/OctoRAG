import { ObjectId } from "mongodb";

export interface UserResponse {
    _id: ObjectId;
    username: string;
    pfpPath: string;
    desc: string;
    followers: ObjectId[];
    usersFollowed: ObjectId[];
    boardsFollowed: ObjectId[];
}