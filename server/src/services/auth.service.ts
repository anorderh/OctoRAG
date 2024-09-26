import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { injectable } from "tsyringe";
import { env } from '../env.js';
import { Token } from '../utils/interfaces/token.js';
import { TokenType } from '../utils/enums/token-type.js';
import { InvalidTokenTypeError } from '../error-handling/errors.js';



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
        let type = token.type;

        switch (type) {
            case TokenType.Access:
                return jwt.sign(token, env.tokens.access.secret, { expiresIn: env.tokens.access.expr });
            case TokenType.Refresh:
                return jwt.sign(token, env.tokens.refresh.secret, { expiresIn: env.tokens.refresh.expr });
            case TokenType.Verify:
                return jwt.sign(token, env.tokens.verify.secret, { expiresIn: env.tokens.verify.expr });
            default:
                throw new InvalidTokenTypeError({
                    body: `Unrecognized token type: \"${token?.type}\"`
                })
        }
    }

    deserialize(type: TokenType, hash: string) : Token {
        let token;
        switch (type) {
            case TokenType.Access:
                token = jwt.verify(hash, env.tokens.access.secret) as Token; break;
            case TokenType.Refresh:
                token = jwt.verify(hash, env.tokens.refresh.secret) as Token; break;
            case TokenType.Verify:
                token = jwt.verify(hash, env.tokens.verify.secret) as Token; break;
            default:
                throw new InvalidTokenTypeError({
                    body: `Unrecognized token type: \"${type}\"`
                })
        }
        return token;
    }
}