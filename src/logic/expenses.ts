import { Expense } from '../entities/expense';
import { Repository } from 'typeorm';
import { BaseLogic } from './base-logic';
import { Logger } from 'winston';

export class ExpenseLogic extends BaseLogic<Expense> {
    constructor(repo: Repository<Expense>, log: Logger) {
        super(repo, log);
    }

    async getExpensesForBudget(budgetId: number): Promise<Expense[]> {
        return await this._repo.find({where: {budgetId: budgetId}});
    }
}
