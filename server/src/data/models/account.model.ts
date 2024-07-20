import { Schema, model } from "mongoose";
import { AccountStatus } from "../../utils/enums/account-status.enum";
import * as bcrypt from 'bcrypt';

export const Account = model(
    'Account', 
    new Schema({
        username: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        pfpPath: {type: String},
        desc: {type: String},
        status: {type: String, enum: Object.values(AccountStatus), required: true}
    }, {
        timestamps: true
    })
);