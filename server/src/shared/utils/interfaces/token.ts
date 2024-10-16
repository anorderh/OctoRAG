import { ObjectId } from "mongodb";
import { TokenType } from '../constants/token-type.js';
import { TokenPayload } from '../constants/token-payload.js';

export interface Token {
    type: TokenType;
    userId: ObjectId;
    payload?: TokenPayload;
}