import { Budget, NewBudget, Expense } from '../entities/budget';
import * as auth from './auth';
import { Repository } from 'typeorm';
import { BaseLogic } from './base-logic';

export class BudgetLogic extends BaseLogic<Budget> {
    constructor(repo: Repository<Budget>) {
        super(repo);
    }

    async getById(id: number): Promise<Budget> {
        const budget = await this._repo
                                .findOne(id, { relations: ['expenses', 'subBudget']});
        console.log('budget by id:', budget);
        return budget;
    }

    async getAll(): Promise<Budget[]> {
        return await this._repo.find({relations: ['expenses', 'subBudget']});
    }
}
