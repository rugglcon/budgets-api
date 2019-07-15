import { Budget, SimpleBudget } from '../data/entities/budget';
import { Repository, FindManyOptions } from 'typeorm';
import { BaseLogic } from './base-logic';
import { Logger } from 'winston';

export class BudgetLogic extends BaseLogic<Budget> {
    constructor(repo: Repository<Budget>) {
        super(repo);
    }

    async getFrontendBudgets(options: FindManyOptions<Budget>): Promise<SimpleBudget[]> {
        const budgets = await this.getMany(options);
        const ret: SimpleBudget[] = [];
        for (const b of budgets) {
            ret.push({
                id: b.id, total: b.total, name: b.name, ownerId: b.ownerId
            });
        }

        return ret;
    }
}
