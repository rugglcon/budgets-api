import { Credentials, NewUser } from '../data/entities/user';
import * as bcrypt from 'bcrypt';
import { User } from '../data/entities/user';
import { UserLogic } from './users';
import logger from '../util/logger';
import { BadRequestError } from '../models/bad-request';
import { NotFoundError } from '../models/not-found';
import { UnauthorizedError } from '../models/unauthorized';

export class AuthLogic {
    static PASSWORD_SALT_ROUNDS = 10;
    _userLogic: UserLogic;

    constructor(userLogic: UserLogic) {
        this._userLogic = userLogic;
    }

    /**
     * This could eventually be written to use JWT's, but for now it returns true
     * if you get logged in, otherwise false
     * @param creds credentials being used to log in
     */
    async login(cred: Credentials): Promise<User> {
        const user = await this._userLogic.get({where: {userName: cred.userName}});
        if (user == null) {
            logger.error('Got a null user');
            throw new NotFoundError(`User with username ${cred.userName} not found.`);
        }

        if (!(await bcrypt.compare(cred.password, user.password))) {
            throw new UnauthorizedError('Username and password do not match.');
        }

        user.loggedIn = true;
        return await this._userLogic.update(user);
    }

    async logout(user: User): Promise<void> {
        user.loggedIn = false;
        await this._userLogic.update(user);
    }

    /**
     * Creates a new user with the given credentials if a user with the same
     * username doesn't already exist
     * @param creds credentials to use to create the new user
     */
    async signup(creds: NewUser): Promise<User> {
        const existingUser = await this._userLogic.get({where: {userName: creds.userName}});
        if (existingUser != null) {
            logger.error(`user with username [${existingUser.userName}] already exists`);
            throw new BadRequestError(`User with username ${existingUser.userName} already exists.`);
        }

        const password = creds.password;
        creds.password = await bcrypt.hash(creds.password, AuthLogic.PASSWORD_SALT_ROUNDS);
        const newUser = await this._userLogic.create(creds as User);
        return await this.login({userName: newUser.userName, password});
    }

    async authenticate(userName: string): Promise<User> {
        const user = await this._userLogic.get({
            where: {
                userName,
                loggedIn: true
            }
        });
        if (user == null) {
            throw new NotFoundError(`User with username ${userName} not found as being logged in.`);
        }
        return user;
    }
}
