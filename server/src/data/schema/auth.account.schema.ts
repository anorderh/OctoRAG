import { Schema } from "mongoose";
import { AccountStatus } from "../../utils/enums/account-status.enum";

export interface Account {
    _id: Number,
    username: string,
    email: string,
    status: AccountStatus
}

export const accountSchema = new Schema({
    _id: {type: Number, required: true},
    username: {type: String, required: true},
    email: {type: String, required: true},
    status: {type: String, enum: Object.values(AccountStatus), required: true}
}, {
    timestamps: true
})