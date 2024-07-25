import { Schema, model } from "mongoose";
import { Follow } from "../../../utils/types/follow";
import { Account } from "./account";

export interface User {
    id: string;
    username: string;
    followers: string[];
    boardsFollowed: string[];
    usersFollowed: string[];
    savedTags: string[];
    pfpPath: string;
    desc: string;
    accountId: string;
    account: Account;
}

export const User = model<User>(
    'User', 
    new Schema({
        username: {type: String, required: true},
        followers: [{type: String, ref: 'User'}],
        boardsFollowed: [{type: String, ref: 'Board'}],
        usersFollowed: [{type: String, ref: 'User'}],
        savedTags: [{type: String, ref: 'Tag'}],
        pfpPath: {type: String},
        desc: {type: String},
        accountId: {type: String, ref: 'Account', required: true},
    })
);