import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from "typeorm";
import { Budget } from "./budget";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    userName: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @OneToMany(type => Budget, budget => budget.owner, {
        cascade: true
    })
    budgets: Budget[];

    @Column()
    loggedIn: boolean;
}

export interface Credentials {
    userName: string,
    password: string
}

export interface NewUser {
    userName: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
}

@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;
}