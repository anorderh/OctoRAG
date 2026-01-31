import { ObjectId } from 'mongodb';
import { TokenPayload } from '../../constants/token-payload.js';
import { TokenType } from '../../constants/token-type.js';

export interface Token {
    type: TokenType;
    userId: ObjectId;
    payload?: TokenPayload;
}
