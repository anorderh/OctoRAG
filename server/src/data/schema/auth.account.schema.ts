import { Schema, model } from "mongoose";
import { AccountStatus } from "../../utils/enums/account-status.enum";
import * as bcrypt from 'bcrypt';

export const Account = model(
    'Account', 
    new Schema({
        username: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        status: {type: String, enum: Object.values(AccountStatus), required: true}
    }, {
        timestamps: true
    })
);

Account.schema.methods.hash = function (plainText: string) {
    const saltRounds = 10;
    return bcrypt.hash(plainText, saltRounds);
}

Account.schema.methods.validate = function (input: string) {
    return bcrypt.compare(input, this.password);
}