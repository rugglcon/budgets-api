import { Credentials, NewUser, Token } from '../models/user';
import { Query } from '../util/query';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from 'models/user';
import { Result } from 'models/result';

const PASSWORD_SALT_ROUNDS = 10;

/**
 * This could eventually be written to use JWT's, but for now it returns true
 * if you get logged in, otherwise false with an error message.
 * @param query query object that is used to connect to the mysql server and
 * make queries
 * @param creds credentials being used to log in
 */
export async function login(query: Query, creds: Credentials): Promise<Result<string, boolean>> {
    let retVal: Result<string, boolean> = {
        result: false,
        err: 'Something went wrong trying to log you in. Please try again later.'
    };
    const data = await query.query<User>({
        sqlString: 'select * from Users where Username = ?',
        values: [creds.username]
    });
    if (data.err) {
        console.error('there was an error:', data.err);
        retVal.err = data.err.message;
        return retVal;
    }
    if (!data.result) {
        return retVal;
    }
    if (await bcrypt.compare(creds.password, data.result[0]['Password'])) {
        retVal.err = null;
        retVal.result = true;
        return retVal;
        // return doToken(query, data);
    } else {
        retVal.err = 'Your username and password do not match.';
    }
    return retVal;
}

/**
 * Creates a new user with the given credentials if a user with the same
 * username doesn't already exist
 * @param query query object that is used to connect to the mysql server and
 * make queries
 * @param creds credentials to use to create the new user
 */
export async function signup(query: Query, creds: NewUser): Promise<Result<string, boolean>> {
    let retVal: Result<string, boolean> = {
        result: false,
        err: 'Something went wrong trying to create your account. Please try again later.'
    };
    const duplicates = await query.query<User>({
        sqlString: 'select * from Users where Username = ?',
        values: [creds.username]
    });
    if (duplicates.err) {
        retVal.err = duplicates.err.message;
        return retVal;
    }
    if (!duplicates.result) {
        return retVal;
    }
    if (duplicates.result.length !== 0) {
        retVal.err = 'A user already exists with that username. Please choose a different username.';
        return retVal;
    }
    const createSuccess = await query.query<string>({
        sqlString: 'insert into Users (FirstName, LastName, Username, Email, Password) values (?, ?, ?, ?, ?)',
        values: [
            creds.firstName, creds.lastName,
            creds.username, creds.email,
            await bcrypt.hash(creds.password, PASSWORD_SALT_ROUNDS)
        ]
    });
    console.log('got signup values', createSuccess);

    return retVal;
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