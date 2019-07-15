import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Budget } from './budget';
import { decimal } from '../../util/decimal.transformer';

export interface NewExpense {
    title: string;
    cost: number;
    budgetId: number;
}

/**
 * Frontend expense model
 */
export interface SimpleExpense {
    id: number;
    cost: number;
    budgetId: number;
    title: string;
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
        precision: 15,
        scale: 2,
        transformer: decimal
    })
    cost: number;
}
