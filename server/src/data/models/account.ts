import { Schema, model } from "mongoose";

export interface Account {
    username: string;
    email: string;
    password: string;
    pfpPath: string;
    desc: string;
}

export const Account = model<Account>(
    'Account', 
    new Schema({
        username: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        pfpPath: {type: String},
        desc: {type: String},
    }, {
        timestamps: true
    })
);