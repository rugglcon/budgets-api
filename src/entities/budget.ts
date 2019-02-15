import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./user";

export interface NewBudget {
    name: string;
    ownerId: number;
}

@Entity()
export class Budget {
    /**
     * ID of the budget
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * ID of the owner of this budget
     */
    @Column({
        default: null
    })
    ownerId: number;

    /**
     * The User object for this budget
     */
    @ManyToOne(type => User, user => user.budgets, {
        eager: true
    })
    @JoinColumn({name: 'ownerId'})
    owner: User;

    /**
     * title the owner gives the budget
     */
    @Column({
        default: null
    })
    name: string;

    /**
     * list of expenses in this budget
     */
    @OneToMany(type => Expense, expense => expense.budget, {
        cascade: true, eager: true
    })
    expenses: Expense[];

    /**
     * "budget" of the budget
     */
    @Column({
        default: 0,
        precision: 2,
        type: 'decimal'
    })
    total: number;
}

export interface NewExpense {
    title: string;
    cost: number;
    budgetId: number;
}

@Entity()
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * ID of the budget this Expense belongs to
     */
    @Column()
    budgetId: number;

    @ManyToOne(type => Budget, budget => budget.expenses)
    @JoinColumn({name: 'budgetId'})
    budget: Budget;

    @Column({
        default: null
    })
    title: string;

    @Column({
        default: 0,
        type: 'decimal',
        precision: 2
    })
    cost: number;
}