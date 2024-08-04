import { Schema, Types, model, Mixed, ObjectId } from "mongoose";
import { Account } from "./account";

export interface User {
    id: ObjectId;
    username: string;
    followers: string[];
    boardsFollowed: ObjectId[];
    usersFollowed: string[];
    savedTags: string[];
    pfpPath: string;
    desc: string;
    accountId: ObjectId;
    account: Account;
}

export const User = model<User>(
    'User', 
    new Schema({
        username: {type: String, required: true},
        followers: [{type: Types.ObjectId, ref: 'User'}],
        boardsFollowed: [{type: Types.ObjectId, ref: 'Board'}],
        usersFollowed: [{type: Types.ObjectId, ref: 'User'}],
        savedTags: [{type: Types.ObjectId, ref: 'Tag'}],
        pfpPath: {type: String},
        desc: {type: String},
        accountId: {type: Types.ObjectId, ref: 'Account', required: true}
    })
);