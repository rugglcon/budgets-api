import { Entity, PrimaryGeneratedColumn, OneToMany, Column, OneToOne, JoinColumn } from 'typeorm';
import { Budget } from './budget';
import { Token } from './token';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: null
    })
    firstName: string;

    @Column({
        default: null
    })
    lastName: string;

    @Column({
        default: null
    })
    userName: string;

    @Column({
        default: null
    })
    email: string;

    @Column({
        default: null
    })
    password: string;

    @OneToMany(type => Budget, budget => budget.owner, {
        cascade: true
    })
    budgets: Budget[];

    @Column({
        default: false
    })
    loggedIn: boolean;

    /**
     * Will be defined when the user is logged in,
     * otherwise will be set to null
     */
    @Column({
        default: null
    })
    tokenId?: number;

    @OneToOne(type => Token, token => token.id, {
        cascade: true
    })
    @JoinColumn({name: 'tokenId'})
    token: Token;
}

export interface Credentials {
    userName: string;
    password: string;
}

export interface NewUser {
    userName: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface LoginSuccess {
    token: string;
    id: number;
    userName: string;
    email: string;
}
