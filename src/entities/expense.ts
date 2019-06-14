import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Budget } from './budget';

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
