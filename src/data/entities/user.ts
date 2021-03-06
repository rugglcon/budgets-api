import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { Budget } from './budget';

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
        cascade: true,
        eager: true
    })
    budgets: Budget[];

    @Column({
        default: false
    })
    loggedIn: boolean;

    @Column({
        type: 'datetime'
    })
    signUpDate: Date;
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
    signUpDate: Date;
}

export interface LoginSuccess {
    token: string;
    id: number;
    userName: string;
    email: string;
}
