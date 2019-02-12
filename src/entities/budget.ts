import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user";

export interface NewBudget {
    name: string;
    owner: number;
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
    @ManyToOne(type => User, user => user.budgets)
    @Column()
    owner?: number;

    /**
     * title the owner gives the budget
     */
    @Column()
    name: string;

    /**
     * list of expenses in this budget
     */
    @OneToMany(type => Expense, expense => expense.budgetId, {
        cascade: true
    })
    expenses: Expense[];

    /**
     * if this budget has sub-budgets, they go here
     */
    @OneToMany(type => Budget, budget => budget.parentBudget, {
        cascade: true
    })
    subBudget?: Budget[];

    /**
     * "budget" of the budget
     */
    @Column()
    total: number;

    /**
     * parent of this budget
     */
    @ManyToOne(type => Budget, budget => budget.subBudget)
    @Column()
    parentBudget?: number;
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
    @ManyToOne(type => Budget, budget => budget.expenses)
    @Column()
    budgetId: number;

    @Column()
    title: string;

    @Column()
    cost: number;
}