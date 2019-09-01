import { Credentials, NewUser } from '../data/entities/user';
import * as bcrypt from 'bcrypt';
import { User } from '../data/entities/user';
import { UserLogic } from './users';
import logger from '../util/logger';

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
            return null;
        }

        if (!(await bcrypt.compare(cred.password, user.password))) {
            return null;
        }

        user.loggedIn = true;
        // const token = await this._tokenLogic.create(new Token());
        // user.tokenId = token.id;
        return await this._userLogic.update(user);
    }

    async logout(user: User): Promise<void> {
        user.loggedIn = false;
        // user.token = null;
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
            logger.error(`user with username [${existingUser.userName}] already exists; returning null`);
            return null;
        }

        const password = creds.password;
        creds.password = await bcrypt.hash(creds.password, AuthLogic.PASSWORD_SALT_ROUNDS);
        const newUser = await this._userLogic.create(creds as User);
        return await this.login({userName: newUser.userName, password});
    }

    async authenticate(token: string): Promise<User> {
        const user = await this._userLogic.get({
            where: {
                token: token,
                loggedIn: true
            }
        });
        if (user != null) {
            return user;
        }
        return null;
    }
}
