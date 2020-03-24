import { Expense, SimpleExpense } from '../data/entities/expense';
import { Repository } from 'typeorm';
import { BaseLogic } from './base-logic';
import logger from '../util/logger';

export class ExpenseLogic extends BaseLogic<Expense> {
    constructor(repo: Repository<Expense>) {
        super(repo);
    }

    async getExpensesForBudget(budgetId: number): Promise<Expense[]> {
        return await this._repo.find({where: {budgetId: budgetId}});
    }

    async getFrontendExpensesForBudget(budgetId: number): Promise<SimpleExpense[]> {
        const expenses = await this.getExpensesForBudget(budgetId);
        const ret = expenses.map(e => {
            return {
                id: e.id,
                cost: e.cost,
                title: e.title,
                budgetId: e.budgetId
            };
        });

        logger.info(`returning ${ret.length} expenses`);
        return ret;
    }
}
