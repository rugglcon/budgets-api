import { Budget, NewBudget, NewExpense } from './entities/budget';
import * as auth from './logic/auth';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as budgets from './logic/budgets';
import * as users from './logic/users';
import * as expenses from './logic/expenses';
import * as tokens from './logic/tokens';
import { Credentials, NewUser, LoginSuccess } from './entities/user';
import * as typeorm from 'typeorm';
import * as winston from 'winston';
import { Expense } from './entities/expense';

class App {
    public app: express.Application;
    log: winston.Logger;
    dbConnection: typeorm.Connection;
    budgetLogic: budgets.BudgetLogic;
    expenseLogic: expenses.ExpenseLogic;
    userLogic: users.UserLogic;
    authLogic: auth.AuthLogic;
    tokenLogic: tokens.TokenLogic;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    config(): void {
        this.app.use((_req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
        this.app.use(bodyParser.json());
        // this.app.use(bodyParser.urlencoded({extended: false}));
    }

    routes(): void {
        const router = express.Router();

        // validates that id is a number
        router.param('id', (_req, res, next, id) => {
            const _id = Number(id);
            if (!isNaN(_id)) {
                next();
            } else {
                res.status(400).send({ message: 'Budget Id must be a number.', id: id });
            }
        });

        /**
         * BUDGET ROUTES
         */

        // gets all budgets
        router.get('/budgets', async (req, res) => {
            // should validate user then return that user's budgets
            this.log.info(`hostname: ${req.hostname}`);
            try {
                this.log.info(`current session id: ${req.session.id}`);
                const user = await this.authLogic.authenticate(req.session.id);
                if (user == null) {
                    // not authorized/logged in
                    res.status(401).send();
                    return;
                }
                const data = await this.budgetLogic.getMany({where: {ownerId: user.id}});
                this.log.info('all budgets', data);
                res.status(200).send(data);
            } catch (err) {
                this.log.error(err);
                res.status(500).send({message: 'Something went wrong.', err: err});
            }
        });

        // gets a specific budget
        router.get('/budgets/:id', async (req, res) => {
            // should validate user then return the budget if user owns it
            try {
                const user = await this.authLogic.authenticate(req.session.id);
                if (user == null) {
                    // not authorized/logged in
                    res.status(401).send();
                    return;
                }
                const data = await this.budgetLogic.getById(+(req.params.id));
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
        router.patch('/budgets/:id', async (req, res) => {
            // should validate user then update the budget
            try {
                const user = await this.authLogic.authenticate(req.session.id);
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
                const data = await this.budgetLogic.update(budg);
                this.log.info(data);
                res.status(200).send(data);
            } catch (err) {
                res.status(500).send({message: 'Something went wrong.', err: err});
            }
        });

        // creates a budget
        router.post('/budgets', async (req, res) => {
            // should validate user then create the budget
            // the body comes in as a NewBudget object
            try {
                const user = await this.authLogic.authenticate(req.session.id);
                if (user == null) {
                    // not authorized/logged in
                    res.status(401).send();
                    return;
                }
                const newBudget = (<NewBudget>req.body);
                const budget = new Budget();
                budget.ownerId = newBudget.ownerId;
                budget.name = newBudget.name;

                const data = await this.budgetLogic.create(budget);
                res.status(200).send(data);
            } catch (err) {
                res.status(500).send({message: 'Something went wrong.', err: err});
            }
        });

        // deletes a budget
        router.delete('/budgets/:id', async (req, res) => {
            // validate user then delete the budget
            try {
                const user = await this.authLogic.authenticate(req.session.id);
                if (user == null) {
                    // not authorized/logged in
                    res.status(401).send();
                    return;
                }
                const budget = await this.budgetLogic.getById(Number(req.params.id));
                if (budget.ownerId !== user.id) {
                    res.status(403).send();
                    return;
                }
                const data = await this.budgetLogic.delete(budget.id);
                this.log.info(`delete successful: ${data}`);
                res.send(data);
            } catch (err) {
                res.status(500).send({message: 'Something went wrong.', err: err});
            }
        });

        /**
         * EXPENSE ROUTES
         */
        // creates an expense
        router.post('/expense', async (req, res) => {
            try {
                const user = await this.authLogic.authenticate(req.session.id);
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
                const reS = await this.expenseLogic.create(expense);
                this.log.info(reS);
                res.status(200).send(reS);
            } catch (err) {
                res.status(500).send({message: 'Something went wrong.', err: err});
            }
        });

        router.delete('/expense/:id', async (req, res) => {
            try {
                const user = await this.authLogic.authenticate(req.session.id);
                if (user == null) {
                    // not authorized/logged in
                    res.status(401).send();
                    return;
                }
                const exp = await this.expenseLogic.getById(Number(req.params.id));
                const budget = await this.budgetLogic.getById(exp.budgetId);
                if (budget.ownerId !== user.id) {
                    res.status(403).send();
                    return;
                }
                const success = await this.expenseLogic.delete(exp.id);
                res.send(success);
            } catch (err) {
                res.status(500).send({message: 'Something went wrong.', err: err});
            }
        });

        /**
         * USER ROUTES
         */

        // logs a user in
        router.post('/user/login', async (req, res) => {
            // logs the user in
            const creds: Credentials = {
                userName: req.body.userName,
                password: req.body.password
            };
            try {
                const data = await this.authLogic.login(creds);
                console.log('yoooooo', data);
                if (data != null) {
                    res.status(200).send(data);
                } else {
                    res.status(401).send({message: 'Your username and password combo did not match.'});
                }
            } catch (e) {
                res.status(500).send({message: 'Something went wrong.', err: e});
            }
        });

        // logs a user out
        router.post('/user/logout', async (req, res) => {
            try {
                const data = req.body as LoginSuccess;
                const token = await this.tokenLogic.get({where: {tokenString: data.token}});
                if (token == null) {
                    res.status(400).send({message: 'The given token does not exist.'});
                }

                const user = await this.userLogic.get({
                    where: {
                        tokenId: token.id,
                        id: data.id,
                        email: data.email,
                        userName: data.userName
                    }
                });
                if (user == null) {
                    res.status(400).send({message: 'User does not exist.'});
                }

                await this.authLogic.logout(user);
                res.status(204).send();
            } catch (e) {
                this.log.error(e);
                res.status(500).send({message: 'Something went wrong.', err: e});
            }
        });

        // creates a user
        router.post('/user', async (req, res) => {
            // creates user and logs them in
            const newUser: NewUser = {
                userName: req.body.userName,
                password: req.body.password,
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName
            };
            const data = await this.authLogic.signup(newUser);
            this.log.info(data);
            res.status(200).send(data);
        });

        this.app.use('/', router);
    }
}
export default new App();
