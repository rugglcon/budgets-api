import { Credentials, NewUser, LoginSuccess } from '../entities/user';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user';
import { UserLogic } from './users';
import { Logger } from 'winston';
import { TokenLogic } from './tokens';
import { Token } from '../entities/token';

export class AuthLogic {
    static PASSWORD_SALT_ROUNDS = 10;
    _userLogic: UserLogic;
    log: Logger;
    _tokenLogic: TokenLogic;

    constructor(userLogic: UserLogic, tokenLogic: TokenLogic, log: Logger) {
        this._userLogic = userLogic;
        this._tokenLogic = tokenLogic;
        this.log = log;
    }

    /**
     * This could eventually be written to use JWT's, but for now it returns true
     * if you get logged in, otherwise false
     * @param creds credentials being used to log in
     */
    async login(cred: Credentials): Promise<LoginSuccess> {
        console.log('got creds', cred);
        const user = await this._userLogic.get({where: {userName: cred.userName}});
        console.log('got user', user);
        if (user == null) {
            return null;
        }

        if (!(await bcrypt.compare(cred.password, user.password))) {
            return null;
        }

        user.loggedIn = true;
        const token = await this._tokenLogic.create(new Token());
        user.tokenId = token.id;
        const loggedIn = await this._userLogic.update(user) != null;
        return (loggedIn ? {
            token: token.tokenString,
            id: user.id,
            userName: user.userName,
            email: user.email
        } : null);
    }

    async logout(user: User): Promise<void> {
        user.loggedIn = false;
        user.token = null;
        await this._userLogic.update(user);
    }

    /**
     * Creates a new user with the given credentials if a user with the same
     * username doesn't already exist
     * @param creds credentials to use to create the new user
     */
    async signup(creds: NewUser): Promise<LoginSuccess> {
        const existingUser = await this._userLogic.get({where: {userName: creds.userName}});
        if (existingUser != null) {
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
        console.log('authenticated user', user);
        if (user != null) {
            return user;
        }
        return null;
    }
}
