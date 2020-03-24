import { Repository, FindManyOptions, FindConditions } from "typeorm";
import { Budget } from "../src/data/entities/budget";
import { BudgetLogic } from '../src/logic/budgets';
import logger from '../src/util/logger';

describe('BudgetLogic', () => {
    let logic: BudgetLogic;
    let repo: Repository<Budget>;

    beforeEach(() => {
        repo = new Repository<Budget>();
        logic = new BudgetLogic(repo);
    });

    it('should be instantiated', () => {
        expect(logic).toBeDefined();
    });

    it('should return budgets in frontend format', done => {
        const serverBudgets = [
            {
                id: 1,
                total: 10,
                name: 'First Budget',
                ownerId: 1
            } as Budget,
            {
                id: 2,
                total: 20,
                name: 'Second Budget',
                ownerId: 1
            } as Budget
        ];

        jest.spyOn(repo, 'find')
            .mockImplementation((options: FindConditions<Budget> | undefined) => Promise.resolve(serverBudgets));
        jest.spyOn(logger, 'info');

        logic.getFrontendBudgets({} as FindManyOptions).then(budgets => {
            expect(budgets[0].id).toBe(serverBudgets[0].id);
            expect(budgets[0].total).toBe(serverBudgets[0].total);
            expect(budgets[0].name).toBe(serverBudgets[0].name);
            expect(budgets[0].ownerId).toBe(serverBudgets[0].ownerId);
            expect(budgets[1].id).toBe(serverBudgets[1].id);
            expect(budgets[1].total).toBe(serverBudgets[1].total);
            expect(budgets[1].name).toBe(serverBudgets[1].name);
            expect(budgets[1].ownerId).toBe(serverBudgets[1].ownerId);
            expect(logger.info).toHaveBeenCalledWith('returning 2 budgets');
            done();
        });
    });
});