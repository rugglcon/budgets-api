export interface User {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    loggedIn: string;
}

export interface Credentials {
    username: string,
    password: string
}

export interface NewUser {
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
}

export interface Token {
    id: number;
    token: string;
}