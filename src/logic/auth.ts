import { Credentials, NewUser } from '../entities/user';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user';
import { UserLogic } from './users';
import { Logger } from 'winston';

export class AuthLogic {
    static PASSWORD_SALT_ROUNDS = 10;
    _userLogic: UserLogic;
    log: Logger;

    constructor(userLogic: UserLogic, log: Logger) {
        this._userLogic = userLogic;
        this.log = log;
    }

    /**
     * This could eventually be written to use JWT's, but for now it returns true
     * if you get logged in, otherwise false
     * @param creds credentials being used to log in
     */
    async login(cred: Credentials, sessionId: string): Promise<boolean> {
        const user = await this._userLogic.get({where: {userName: cred.userName}});
        if (user == null) {
            return false;
        }

        if (!(await bcrypt.compare(cred.password, user.password))) {
            return false;
        }

        user.loggedIn = true;
        user.sessionId = sessionId;
        return await this._userLogic.update(user) != null;
    }

    async logout(sessionId: string): Promise<void> {
        const user = await this._userLogic.get({where: {sessionId: sessionId}});
        user.loggedIn = false;
        user.sessionId = null;
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
            return null;
        }

        creds.password = await bcrypt.hash(creds.password, AuthLogic.PASSWORD_SALT_ROUNDS);

        return await this._userLogic.create(creds as User);
    }

    async authenticate(sessionId: string): Promise<User> {
        const user = await this._userLogic.get({
            where: {
                sessionId: sessionId,
                loggedIn: true
            }
        });
        if (user != null) {
            return user;
        }
        return null;
    }
}
