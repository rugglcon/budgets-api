import { Expense, SimpleExpense } from '../data/entities/expense';
import { Repository } from 'typeorm';
import { BaseLogic } from './base-logic';

export class ExpenseLogic extends BaseLogic<Expense> {
    constructor(repo: Repository<Expense>) {
        super(repo);
    }

    async getExpensesForBudget(budgetId: number): Promise<Expense[]> {
        return await this._repo.find({where: {budgetId: budgetId}});
    }

    async getFrontendExpensesForBudget(budgetId: number): Promise<SimpleExpense[]> {
        const expenses = await this.getExpensesForBudget(budgetId);
        const ret: SimpleExpense[] = [];
        for (const e of expenses) {
            ret.push({
                id: e.id,
                cost: e.cost,
                title: e.title,
                budgetId: e.budgetId
            });
        }
        return ret;
    }
}
