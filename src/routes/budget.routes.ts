import { Router } from 'express';
import logger from '../util/logger';
import { BudgetLogic } from '../logic/budgets';
import { Budget, NewBudget, SimpleBudget } from '../data/entities/budget';
import { User } from '../data/entities/user';
import { ExpenseLogic } from '../logic/expenses';
import { BadRequestError } from '../models/bad-request';
import { UnauthorizedError } from '../models/unauthorized';
import { ForbiddenError } from '../models/forbidden';
import { NotFoundError } from '../models/not-found';

export const budgetRoutes = (budgetLogic: BudgetLogic, expenseLogic: ExpenseLogic): Router => {
    const budgetsRouter = Router();

    // validates that id is a number
    budgetsRouter.param('id', (_req, res, next, id) => {
        const _id = Number(id);
        if (isNaN(_id)) {
            logger.error(`id was not a number: [${id}]`);
            return next(new BadRequestError(`Id must be a number, but received ${id}.`));
        }
        next();
    });

    // gets all budgets
    budgetsRouter.get('/', async (req, res, next) => {
        // should validate user then return that user's budgets
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                logger.error('user attempted to get budgets without authenticating.');
                throw new UnauthorizedError('Not authorized.');
            }
            const data = await budgetLogic.getFrontendBudgets({where: {ownerId: (user as User).id}});
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    });

    // gets a specific budget
    budgetsRouter.get('/:id', async (req, res, next) => {
        // should validate user then return the budget if user owns it
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                throw new UnauthorizedError('Not Authorized');
            }
            const data = await budgetLogic.getById(+(req.params.id));
            if (!data) {
                throw new NotFoundError('Budget not found.');
            }

            if (data.ownerId !== (user as User).id) {
                throw new ForbiddenError('You are not allowed to perform this action.');
            }
            res.status(200).send({
                id: data.id,
                name: data.name,
                total: data.total,
                ownerId: data.ownerId
            } as SimpleBudget);
        } catch (err) {
            next(err);
        }
    });

    budgetsRouter.get('/:id/expenses', async (req, res, next) => {
        try {
            const user = req.user as User;
            if (user == null) {
                throw new UnauthorizedError('Not authorized.');
            }

            const budget = await budgetLogic.getById(+(req.params.id));
            if (!budget) {
                throw new NotFoundError('Budget not found.');
            }

            if (budget.ownerId !== user.id) {
                throw new ForbiddenError('You are not authorized to perform this action.');
            }

            const data = await expenseLogic.getFrontendExpensesForBudget(+(req.params.id));
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    });

    // updates a budget
    budgetsRouter.patch('/:id', async (req, res, next) => {
        // should validate user then update the budget
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                throw new UnauthorizedError('Not authorized.');
            }
            const budg = (<SimpleBudget>req.body);
            if (budg.ownerId !== (user as User).id) {
                throw new ForbiddenError('You are not authorized to perform this action.');
            }
            const budget = await budgetLogic.getById(budg.id);
            if (!budget) {
                throw new NotFoundError('Budget not found.');
            }
            // update the updatable fields
            budget.name = budg.name;
            budget.total = budg.total;
            const data = await budgetLogic.update(budget);
            logger.info(`user with id ${(user as User).id} updated budget with id ${data.id}`);
            res.status(200).send({
                id: data.id,
                total: data.total,
                name: data.name,
                ownerId: data.ownerId
            } as SimpleBudget);
        } catch (err) {
            next(err);
        }
    });

    // creates a budget
    budgetsRouter.post('/', async (req, res, next) => {
        // should validate user then create the budget
        // the body comes in as a NewBudget object
        try {
            const user = req.user as User;
            if (user == null) {
                // not authorized/logged in
                throw new UnauthorizedError('Not Authorized.');
            }
            const newBudget = (<NewBudget>req.body);
            logger.info(`user with email: [${user.email}] attempting
                to create budget with name: [${newBudget.name}] and total: [${newBudget.total}]`);

            if (user.id !== newBudget.ownerId) {
                throw new BadRequestError('The budget\'s owner ID does not match the ID of the logged in user.');
            }

            const budget = new Budget();
            budget.ownerId = newBudget.ownerId;
            budget.name = newBudget.name;
            budget.total = newBudget.total;

            const data = await budgetLogic.create(budget);
            logger.info(`budget created with id: [${data.id}]`);
            return res.status(200).send({
                id: data.id,
                name: data.name,
                total: data.total,
                ownerId: data.ownerId
            } as SimpleBudget);
        } catch (err) {
            next(err);
        }
    });

    // deletes a budget
    budgetsRouter.delete('/:id', async (req, res, next) => {
        // validate user then delete the budget
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                throw new UnauthorizedError('Not Authorized.');
            }
            const budget = await budgetLogic.getById(Number(req.params.id));
            if (!budget) {
                throw new NotFoundError('Budget not found.');
            }
            if (budget.ownerId !== (user as User).id) {
                throw new ForbiddenError('You are not authorized to perform this action.');
            }
            logger.info(`deleting ${budget.expenses.length} expenses before deleting budget`);
            for (const expense of budget.expenses) {
                await expenseLogic.delete(expense.id);
            }
            const data = await budgetLogic.delete(budget.id);
            logger.info(`delete successful: ${data}`);
            res.send(data);
        } catch (err) {
            next(err);
        }
    });

    return budgetsRouter;
};
