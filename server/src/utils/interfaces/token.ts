import { ObjectId } from "mongodb";
import { TokenType } from '../enums/token-type.js';
import { TokenPayload } from '../enums/token-payload.js';

export interface Token {
    type: TokenType;
    userId: ObjectId;
    payload?: TokenPayload;
}