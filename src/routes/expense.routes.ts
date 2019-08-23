import { Router, RequestHandler } from 'express';
import { BudgetLogic } from '../logic/budgets';
import { NewExpense, SimpleExpense } from '../data/entities/expense';
import { Expense } from '../data/entities/expense';
import { ExpenseLogic } from '../logic/expenses';
import logger from '../util/logger';
import { User } from 'data/entities/user';

export const expenseRoutes = (cors: () => RequestHandler,
                            budgetLogic: BudgetLogic,
                            expenseLogic: ExpenseLogic): Router => {
    const expensesRouter = Router();

    // validates that id is a number
    expensesRouter.param('id', (_req, res, next, id) => {
        const _id = Number(id);
        if (!isNaN(_id)) {
            next();
        } else {
            logger.error(`id was not a number: [${id}]`);
            res.status(400).send({ message: 'Id must be a number.', id: id });
        }
    });

    // expensesRouter.all('*', cors());

    // creates an expense
    expensesRouter.post('/', async (req, res) => {
        try {
            const user = req.user as User;
            if (user == null) {
                // not authorized/logged in
                res.status(401).send();
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
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    expensesRouter.patch('/:id', async (req, res) => {
        try {
            const user = req.user as User;
            if (!user) {
                res.status(401).send();
                return;
            }
            const newValues = (<SimpleExpense>req.body);
            const expense = await expenseLogic.getById(newValues.id);
            if (!expense) {
                res.status(404).send();
                return;
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
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    expensesRouter.delete('/:id', async (req, res) => {
        try {
            const user = req.user;
            if (user == null) {
                // not authorized/logged in
                res.status(401).send();
                return;
            }
            const exp = await expenseLogic.getById(Number(req.params.id));
            const budget = await budgetLogic.getById(exp.budgetId);
            if (budget.ownerId !== user.id) {
                res.status(403).send();
                return;
            }
            const success = await expenseLogic.delete(exp.id);
            res.send(success);
        } catch (err) {
            res.status(500).send({message: 'Something went wrong.', err: err});
        }
    });

    return expensesRouter;
};
