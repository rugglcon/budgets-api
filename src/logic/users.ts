import { BaseLogic } from './base-logic';
import { User } from 'data/entities/user';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

export class UserLogic extends BaseLogic<User> {
    constructor(repo: Repository<User>) {
        super(repo);
    }

    generateJWT(user: User): string {
        const date = new Date();
        date.setDate(date.getDate() + 10);
        return jwt.sign({
            id: user.id,
            email: user.email,
            userName: user.userName,
// tslint:disable-next-line: radix
            exp: parseInt((date.getTime() / 1000).toString())
        }, 'secret');
    }
}
