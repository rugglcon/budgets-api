import { RequestHandler, Router } from 'express';
import { logger } from '../util/logger';
import { BudgetLogic } from '../logic/budgets';
import { Budget, NewBudget, SimpleBudget } from '../data/entities/budget';
import { User } from 'data/entities/user';
import { ExpenseLogic } from 'logic/expenses';

export const budgetRoutes = (cors: () => RequestHandler, budgetLogic: BudgetLogic, expenseLogic: ExpenseLogic): Router => {
    const budgetsRouter = Router();

    budgetsRouter.options('*', cors());

    // validates that id is a number
    budgetsRouter.param('id', (_req, res, next, id) => {
        const _id = Number(id);
        if (!isNaN(_id)) {
            next();
        } else {
            res.status(400).send({ message: 'Id must be a number.', id: id });
        }
    });

    // gets all budgets
    budgetsRouter.get('/', async (req, res) => {
        // should validate user then return that user's budgets
        try {
            const user = req.user;
            console.log('user in budgets', req.user);
            if (user == null) {
                // not authorized/logged in
                logger.warn('user attempted to get budgets without authenticating.');
                res.status(401).send({message: 'Not authorized.'});
                return;
            }
            const data = await budgetLogic.getFrontendBudgets({where: {ownerId: user.id}});
            logger.info('all budgets', data);
            res.status(200).send(data);
        } catch (err) {
            console.log('error', err);
            logger.error(err);
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    // gets a specific budget
    budgetsRouter.get('/:id', async (req, res) => {
        // should validate user then return the budget if user owns it
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                res.status(401).send();
                return;
            }
            const data = await budgetLogic.getById(+(req.params.id));
            if (data == null) {
                res.status(404).send({message: 'That budget wasn\'t found'});
            } else {
                if (data.ownerId !== user.id) {
                    res.status(403).send();
                    return;
                }
                res.status(200).send({
                    id: data.id, name: data.name, total: Number(data.total), ownerId: data.ownerId
                } as SimpleBudget);
            }
        } catch (err) {
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    budgetsRouter.get('/:id/expenses', async (req, res) => {
        try {
            const user = req.user as User;
            if (user == null) {
                res.status(401).send();
                return;
            }

            const budget = await budgetLogic.getById(+(req.params.id));
            if (budget.ownerId !== user.id) {
                res.status(403).send();
                return;
            }

            const data = await expenseLogic.getFrontendExpensesForBudget(+(req.params.id));
            res.status(200).send(data);
        } catch (err) {
            res.status(500).send({message: 'Something went wrong', err: err});
        }
    });

    // updates a budget
    budgetsRouter.patch('/:id', async (req, res) => {
        // should validate user then update the budget
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                res.status(401).send();
                return;
            }
            const budg = (<SimpleBudget>req.body);
            if (budg.ownerId !== user.id) {
                res.status(403).send();
                return;
            }
            const budget = await budgetLogic.getById(budg.id);
            if (!budget) {
                res.status(404).send();
                return;
            }
            // update the updatable fields
            budget.name = budg.name;
            budget.total = budg.total;
            const data = await budgetLogic.update(budget);
            console.log('updated budget', data);
            logger.info(`user with id ${user.id} updated budget with id ${data.id}`);
            res.status(200).send({
                id: data.id, total: Number(data.total), name: data.name, ownerId: data.ownerId
            } as SimpleBudget);
        } catch (err) {
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    // creates a budget
    budgetsRouter.post('/', async (req, res) => {
        // should validate user then create the budget
        // the body comes in as a NewBudget object
        try {
            const user = req.user as User;
            if (user == null) {
                // not authorized/logged in
                return res.status(401).send();
            }
            const newBudget = (<NewBudget>req.body);
            logger.info(`user with email: [${user.email}] attempting
                to create budget with name: [${newBudget.name}] and total: [${newBudget.total}]`);

            if (user.id !== newBudget.ownerId) {
                logger.warn(`user with id: [${user.id}] tried to create a budget with user id: [${newBudget.ownerId}]`);
                return res.status(400).send({message: 'The budget\'s owner ID does not match the ID of the logged in user.'});
            }

            const budget = new Budget();
            budget.ownerId = newBudget.ownerId;
            budget.name = newBudget.name;
            budget.total = newBudget.total;

            const data = await budgetLogic.create(budget);
            if (data) {
                logger.info(`budget created with id: [${data.id}]`);
                return res.status(200).send({
                    id: data.id, name: data.name, total: Number(data.total), ownerId: data.ownerId
                } as SimpleBudget);
            } else {
                logger.error('something went wrong trying to create the budget');
                return res.status(500).send({message: 'Something went wrong while creating the budget. Please try again.'});
            }
        } catch (err) {
            return res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    // deletes a budget
    budgetsRouter.delete('/:id', async (req, res) => {
        // validate user then delete the budget
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                res.status(401).send();
                return;
            }
            const budget = await budgetLogic.getById(Number(req.params.id));
            if (budget.ownerId !== user.id) {
                res.status(403).send();
                return;
            }
            const data = await budgetLogic.delete(budget.id);
            logger.info(`delete successful: ${data}`);
            res.send(data);
        } catch (err) {
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    return budgetsRouter;
};