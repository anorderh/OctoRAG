import { Schema, model } from "mongoose";
import { User } from "./user";

export interface Account {
    id: string;
    username: string;
    email: string;
    password: string;
    userId: string;
    user: User;
}

export const Account = model<Account>(
    'Account', 
    new Schema({
        username: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        userId: {type: String, ref: 'User', required: true},
    }, {
        timestamps: true
    })
);