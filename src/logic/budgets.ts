import { Budget, NewBudget, Expense } from '../entities/budget';
import * as auth from './auth';
import { Repository } from 'typeorm';
import { BaseLogic } from './base-logic';
import { Logger } from 'winston';

export class BudgetLogic extends BaseLogic<Budget> {
    constructor(repo: Repository<Budget>, log: Logger) {
        super(repo, log);
    }
}
