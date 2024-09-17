import { ObjectId } from "mongodb";
import { TokenType } from '../enums/token-type';
import { TokenPayload } from '../enums/token-payload';

export interface Token {
    type: TokenType;
    userId: ObjectId;
    payload?: TokenPayload;
}