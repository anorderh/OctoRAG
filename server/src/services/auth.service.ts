import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { injectable } from "tsyringe";
import { env } from '../env';
import { ObjectId } from 'mongoose';
import { Token } from '../utils/interfaces/token';
import { TokenType } from '../utils/enums/token-type';


@injectable()
export class AuthService {
    async hash(plainText: string) {
        const saltRounds = 10;
        return await bcrypt.hash(plainText, saltRounds);
    }
    
    async validate(input: string, hash: string) {
        return await bcrypt.compare(input, hash);
    }

    serialize(token: Token) : string {
        switch (token.type) {
            case TokenType.Access:
                return jwt.sign(token, env.tokens.access.secret, { expiresIn: env.tokens.access.expr });
            case TokenType.Refresh:
                return jwt.sign(token, env.tokens.refresh.secret, { expiresIn: env.tokens.refresh.expr });
            default:
                throw new Error(`Unrecognized token type: \"${token?.type}\"`)
        }
    }

    deserialize(type: TokenType, hash: string) : Token | null {
        let token;
        switch (type) {
            case TokenType.Access:
                token = jwt.verify(hash, env.tokens.access.secret) as Token;
                break;
            case TokenType.Refresh:
                token = jwt.verify(hash, env.tokens.refresh.secret) as Token;
                break;
            default:
                throw new Error(`Unrecognized token type: \"${type}\"`)
        }

        return type == token.type
            ? token
            : null;
    }
}