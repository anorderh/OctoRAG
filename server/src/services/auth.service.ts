import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { injectable } from "tsyringe";
import { env } from '../env';
import { ObjectId } from 'mongoose';


@injectable()
export class AuthService {
    hash(plainText: string) {
        const saltRounds = 10;
        return bcrypt.hash(plainText, saltRounds);
    }
    
    validate(input: string, activeHash: string) {
        return bcrypt.compare(input, activeHash);
    }

    createToken(id: any) {
        return jwt.sign({ id }, env.tokens.access.secret, {
            expiresIn: 3 * 24 * 60 * 60,
        });
    }
}