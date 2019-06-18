import { Expense } from '../entities/expense';
import { Repository } from 'typeorm';
import { BaseLogic } from './base-logic';

export class ExpenseLogic extends BaseLogic<Expense> {
    constructor(repo: Repository<Expense>) {
        super(repo);
    }

    async getExpensesForBudget(budgetId: number): Promise<Expense[]> {
        return await this._repo.find({where: {budgetId: budgetId}});
    }
}
