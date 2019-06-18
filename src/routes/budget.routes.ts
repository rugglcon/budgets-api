import { RequestHandler, Router } from 'express';
import { logger } from '../util/logger';
import { BudgetLogic } from '../logic/budgets';
import { Budget, NewBudget } from '../entities/budget';

export const budgetRoutes = (cors: () => RequestHandler, budgetLogic: BudgetLogic): Router => {
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
    budgetsRouter.get('/budgets', async (req, res) => {
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
            const data = await budgetLogic.getMany({where: {ownerId: user.id}});
            logger.info('all budgets', data);
            res.status(200).send(data);
        } catch (err) {
            console.log('error', err);
            logger.error(err);
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    // gets a specific budget
    budgetsRouter.get('/budgets/:id', async (req, res) => {
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
                res.status(200).send(data);
            }
        } catch (err) {
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    // updates a budget
    budgetsRouter.patch('/budgets/:id', async (req, res) => {
        // should validate user then update the budget
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                res.status(401).send();
                return;
            }
            const budg = (<Budget>req.body);
            if (budg.ownerId !== user.id) {
                res.status(403).send();
                return;
            }
            const data = await budgetLogic.update(budg);
            logger.info(data);
            res.status(200).send(data);
        } catch (err) {
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    // creates a budget
    budgetsRouter.post('/budgets', async (req, res) => {
        // should validate user then create the budget
        // the body comes in as a NewBudget object
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                res.status(401).send();
                return;
            }
            const newBudget = (<NewBudget>req.body);
            const budget = new Budget();
            budget.ownerId = newBudget.ownerId;
            budget.name = newBudget.name;

            const data = await budgetLogic.create(budget);
            res.status(200).send(data);
        } catch (err) {
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    // deletes a budget
    budgetsRouter.delete('/budgets/:id', async (req, res) => {
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
