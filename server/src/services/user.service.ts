import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { injectable } from "tsyringe";
import { env } from '../env';
import { ObjectId } from 'mongoose';
import { Token } from '../utils/interfaces/token';
import { TokenType } from '../utils/enums/token-type';
import { User } from '../data/models';


@injectable()
export class UserService {
    userId?: string;

    async getSelf() {
        if (this.userId == null) {
            throw new Error("Can't get user if request is not authenticated.")
        }
        let self = await User
            .findOne({
                _id: this.userId!
            })
            .populate([
                { path: 'usersFollowed' },  
                { path: 'boardsFollowed' },  
                { path: 'savedTags' }    
            ]);
        if (self == null) {
            throw new Error("Can't find current user.");
        }

        return self;         
    }

    async getUserById(id: string) {
        return await User.findOne({
                _id: id
            });
    }

    async getUserByName(username: string) {
        return await User.findOne({
            username: username
        });
    }
}