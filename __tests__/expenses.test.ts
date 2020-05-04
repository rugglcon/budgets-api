import { Repository, FindConditions } from 'typeorm';
import { ExpenseLogic } from '../src/logic/expenses';
import { Expense } from '../src/data/entities/expense';
import logger from '../src/util/logger';

describe('ExpenseLogic', () => {
    let logic: ExpenseLogic;
    let repo: Repository<Expense>;

    beforeEach(() => {
        repo = new Repository<Expense>();
        logic = new ExpenseLogic(repo);
    });

    it('should be instantiated', () => {
        expect(logic).toBeDefined();
    });

    it('should return expenses given a budgetId', done => {
        jest.spyOn(repo, 'find')
            .mockImplementation(
                (options?: FindConditions<Expense>) => Promise.resolve([ {id: 1} as Expense ])
            );

        logic.getExpensesForBudget(1).then(exps => {
            expect(exps.length).toBe(1);
            expect(exps[0].id).toBe(1);
            expect(repo.find).toHaveBeenCalledWith({where: {budgetId: 1}});
            done();
        });
    });

    it('should return frontend expenses given a budgetId', done => {
        const serverExp = [
            {
                id: 1,
                cost: 1,
                title: '1',
                budgetId: 1
            } as Expense,
            {
                id: 2,
                cost: 2,
                title: '2',
                budgetId: 1
            } as Expense
        ];

        jest.spyOn(repo, 'find')
            .mockImplementation(
                (options?: FindConditions<Expense>) => Promise.resolve(serverExp)
            );
        jest.spyOn(logger, 'info');

        logic.getFrontendExpensesForBudget(1).then(exp => {
            expect(exp[0].id).toBe(serverExp[0].id);
            expect(exp[0].cost).toBe(serverExp[0].cost);
            expect(exp[0].title).toBe(serverExp[0].title);
            expect(exp[0].budgetId).toBe(serverExp[0].budgetId);
            expect(exp[1].id).toBe(serverExp[1].id);
            expect(exp[1].cost).toBe(serverExp[1].cost);
            expect(exp[1].title).toBe(serverExp[1].title);
            expect(exp[1].budgetId).toBe(serverExp[1].budgetId);
            expect(logger.info).toHaveBeenCalledWith('returning 2 expenses');
            done();
        });
    });
});