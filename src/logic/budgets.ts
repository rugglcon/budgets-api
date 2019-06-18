import { Budget } from '../entities/budget';
import { Repository } from 'typeorm';
import { BaseLogic } from './base-logic';
import { Logger } from 'winston';

export class BudgetLogic extends BaseLogic<Budget> {
    constructor(repo: Repository<Budget>) {
        super(repo);
    }
}
