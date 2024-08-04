import { ObjectId, Schema, Types, model } from "mongoose";
import { User } from "./user";

export interface Account {
    id: ObjectId;
    username: string;
    email: string;
    password: string;
    userId: ObjectId;
    user: User;
}

export const Account = model<Account>(
    'Account', 
    new Schema({
        username: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        userId: {type: Types.ObjectId, ref: 'User'},
    }, {
        timestamps: true
    })
);