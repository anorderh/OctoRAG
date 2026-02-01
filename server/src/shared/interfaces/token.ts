import { ObjectId } from 'mongodb';
import { TokenPayload } from '../constants/token-payload';
import { TokenType } from '../constants/token-type';

export interface Token {
    type: TokenType;
    userId: ObjectId;
    payload?: TokenPayload;
}
