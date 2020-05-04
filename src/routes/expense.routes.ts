import { Router } from 'express';
import { BudgetLogic } from '../logic/budgets';
import { NewExpense, SimpleExpense } from '../data/entities/expense';
import { Expense } from '../data/entities/expense';
import { ExpenseLogic } from '../logic/expenses';
import logger from '../util/logger';
import { User } from '../data/entities/user';
import { BadRequestError } from '../models/errors/bad-request';
import { ForbiddenError } from '../models/errors/forbidden';
import { NotFoundError } from '../models/errors/not-found';

export const expenseRoutes = (budgetLogic: BudgetLogic,
                            expenseLogic: ExpenseLogic): Router => {
    const expensesRouter = Router();

    // validates that id is a number
    expensesRouter.param('id', (_req, res, next, id) => {
        const _id = Number(id);
        if (isNaN(_id)) {
            logger.error(`id was not a number: [${id}]`);
            return next(new BadRequestError(`Id must be a number, but received ${id}.`));
        }
        next();
    });

    // creates an expense
    expensesRouter.post('/', async (req, res, next) => {
        try {
            const user = req.user as User;
            if (user == null) {
                // not authorized/logged in
                res.sendStatus(401);
                return;
            }
            const newExpense = (<NewExpense>req.body);
            const expense = new Expense();
            expense.title = newExpense.title;
            expense.cost = +(newExpense.cost);
            expense.budgetId = +(newExpense.budgetId);
            const reS = await expenseLogic.create(expense);
            logger.info(`user with id [${user.id}] created expense [${reS.id}] under budget [${expense.budgetId}]`);
            res.status(200).send({
                id: reS.id,
                budgetId: reS.budgetId,
                cost: reS.cost,
                title: reS.title
            } as SimpleExpense);
        } catch (err) {
            next(err);
        }
    });

    expensesRouter.patch('/:id', async (req, res, next) => {
        try {
            const user = req.user as User;
            if (user == null) {
                res.sendStatus(401);
                return;
            }
            const newValues = (<SimpleExpense>req.body);
            const expense = await expenseLogic.getById(newValues.id);
            if (!expense) {
                throw new NotFoundError('Expense not found.');
            }

            expense.title = newValues.title;
            expense.cost = newValues.cost;
            expense.budgetId = newValues.budgetId;
            const updated = await expenseLogic.update(expense);
            logger.info(`user with id [${user.id}] updated expense with id [${expense.id}]`);
            res.status(200).send({
                cost: updated.cost,
                title: updated.title,
                budgetId: updated.budgetId,
                id: updated.id
            } as SimpleExpense);
            return;
        } catch (err) {
            next(err);
        }
    });

    expensesRouter.delete('/:id', async (req, res, next) => {
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                res.sendStatus(401);
                return;
            }
            const exp = await expenseLogic.getById(Number(req.params.id));
            if (!exp) {
                throw new NotFoundError('Expense not found.');
            }

            const budget = await budgetLogic.getById(exp.budgetId);
            if (!budget) {
                throw new NotFoundError('Budget not found.');
            }
            if (budget.ownerId !== (user as User).id) {
                throw new ForbiddenError('You don\'t have access to do this operation.');
            }
            const success = await expenseLogic.delete(exp.id);
            res.send(success);
        } catch (err) {
            next(err);
        }
    });

    return expensesRouter;
};
