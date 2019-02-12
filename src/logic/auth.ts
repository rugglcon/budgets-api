import { Credentials, NewUser, Token } from '../entities/user';
import { Query } from '../util/query';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../entities/user';
import { Result } from '../entities/result';
import { UserLogic } from './users';

export class AuthLogic {
    static PASSWORD_SALT_ROUNDS = 10;
    _userLogic: UserLogic;
    // _tokenLogic: TokenLogic;

    constructor(userLogic: UserLogic) {
        this._userLogic = userLogic;
    }

    /**
     * This could eventually be written to use JWT's, but for now it returns true
     * if you get logged in, otherwise false
     * @param creds credentials being used to log in
     */
    async login(cred: Credentials): Promise<boolean> {
        const user = await this._userLogic.get({where: {userName: cred.userName}});
        if (user == null) {
            return false;
        }

        if (!(await bcrypt.compare(cred.password, user.password))) {
            return false;
            // return doToken(query, data);
        }
        return true;
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
}

export async function authenticate(query: Query, username: string, email: string): Promise<Result<string, boolean>> {
    let retVal: Result<string, boolean> = {
        result: false,
        err: 'You are not authorized to perform that action.'
    };
    const data = await query.query({
        sqlString: 'select * from Users where Username = ? and Email = ?',
        values: [username, email]
    });
    if (data.err) {
        retVal.err = data.err.message;
        return retVal;
    }
    if (!data.result) {
        return retVal;
    }
    if (data.result.length > 0) {
        const tokens = await query.query<Token>({
            sqlString: 'select * from Tokens where UserId = ?',
            values: [data.result[0]['Id']]
        });
        if (tokens.err) {
            retVal.err = tokens.err.message;
            return retVal;
        }
        if (!data.result) {
            return retVal;
        }
        if (tokens.result.length > 0) {
            retVal.result = true;
            retVal.err = null;
        }
    }
    return retVal;
}

export function logout(query: Query, id: number): void {
    query.query({
        sqlString: 'delete from Tokens where UserId = ?',
        values: [id.toString()]
    });
    query.query({
        sqlString: 'update Users set LoggedIn = 0 where UserId = ?',
        values: [id.toString()]
    });
}

async function doToken(query: Query, data: any): Promise<any> {
    const generatedToken = crypto.randomBytes(32).toString('hex');
    const res = await query.query({
        sqlString: 'insert into Tokens (UserId, Token) values (?, ?)',
        values: [data[0]['UserId'], generatedToken]
    });
    return query.query({
        sqlString: 'select Token from Tokens where UserId = ?',
        values: [data[0]['UserId']]
    });
}