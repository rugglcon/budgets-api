import { Budget, NewBudget, Expense } from './entities/budget';
import { Query } from './util/query';
import * as auth from './logic/auth';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as budgets from './logic/budgets';
import * as expenses from './logic/expenses';
import { Credentials, NewUser } from './entities/user';
import * as typeorm from 'typeorm';

class App {
    public app: express.Application;
    query: Query;
    dbConnection: typeorm.Connection;
    budgetLogic: budgets.BudgetLogic;
    expenseLogic: expenses.ExpenseLogic;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    config(): void {
        this.app.use(bodyParser.json());
        // this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
    }

    routes(): void {
        const router = express.Router();

        // validates that id is a number
        router.param('id', (req, res, next, id) => {
            let _id = Number(id);
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
        router.get('/budgets', (req, res) => {
            // should validate user then return that user's budgets
            /**
             * decided not to make actual accounts, just need to sign up
             * without a password; just username and email
             * decided on not even that, just create budgets with unique titles
             */
            this.budgetLogic.getAll()
            .then(data => {
                console.log('all budgets', data);
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send({message: 'Something went wrong.', err: err});
            });
            // auth.authenticate(this.dbConnection, req.body.username, req.body.email)
            // .then(data => {
            //     budgets.getAll(this.dbConnection, data[0].id)
            //     .then(b => {
            //         console.log(b);
            //         res.send(b);
            //     });
            // })
            // .catch(err => {
            //     res.status(500).send({message: 'Something went wrong.', err: err});
            // });
        });

        // gets a specific budget
        router.get('/budgets/:id(\d+)', (req, res) => {
            // should validate user then return the budget if user owns it
            budgets.getBudgetById(this.dbConnection, req.params.id)
            .then(data => {
                if (data == null) {
                    res.status(404).send({message: 'That budget wasn\'t found'});
                } else {
                    res.status(200).send(data);
                }
            })
            .catch(err => {
                res.status(400).send({message: 'Something went wrong.', err: err});
            });
        });

        // updates a budget
        router.patch('/budgets/:id(\d+)', (req, res) => {
            // should validate user then update the budget
            const budg = req.body.budget;
            this.budgetLogic.update(budg)
            .then(data => {
                console.log(data);
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send({message: 'Something went wrong.', err: err});
            });
        });

        // creates a budget
        router.post('/budgets', (req, res) => {
            // should validate user then create the budget
            // the body comes in as a NewBudget object
            const budget = {
                name: req.body.name,
                owner: req.body.owner
            } as Budget;

            this.budgetLogic.create(budget)
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                if (err == null) {
                    res.status(400).send({message: 'That budget name already exists.', err: err});
                } else {
                    res.status(500).send({message: 'Something went wrong.', err: err});
                }
            });
        });

        // deletes a budget
        router.delete('/budgets/:id(\d+)', (req, res) => {
            // validate user then delete the budget
            this.budgetLogic.delete(Number(req.params.id))
            .then(data => {
                console.log(data);
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({message: 'Something went wrong.', err: err});
            });
        });

        /**
         * EXPENSE ROUTES
         */
        // creates an expense
        router.post('/expense', (req, res) => {
            const expense = {
                title: req.body.title,
                cost: +(req.body.cost),
                budgetId: +(req.body.budgetId)
            } as Expense;
            this.expenseLogic.create(expense)
            .then(reS => {
                console.log(reS);
                res.send(reS);
            })
            .catch(err => {
                res.status(500).send({message: 'Something went wrong.', err: err});
            });
        });

        router.delete('/expense/:id(\d+)', (req, res) => {
            this.expenseLogic.delete(Number(req.params.id))
            .then(success => {
                let status = 204;
                let content = null;
                if (success) {
                    status = 204;
                } else {
                    status = 500;
                    content = 'Something went wrong trying to delete the expense.';
                }

                res.status(status).send(content);
            })
            .catch(err => {
                res.status(500).send({message: 'Something went wrong.', err: err});
            });
        });

        /**
         * USER ROUTES
         *
         * returns a response in the form of:
         * {error: 0, username: string, token: string, userID: number}
         */

        // logs a user in
        router.post('/user', async (req, res) => {
            // logs the user in
            const creds: Credentials = {
                username: req.body.username,
                password: req.body.password
            };
            const data = await auth.login(this.dbConnection, creds);
            res.send(data);
        });

        // creates a user
        router.post('/user/create', async (req, res) => {
            // creates user and logs them in
            const newUser: NewUser = {
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName
            };
            const data = await auth.signup(this.dbConnection, newUser);
            console.log(data);
            if (!data.result) {
                console.error(data.err);
                res.status(500).send({message: 'Something went wrong.', err: data.err});
            }
            res.send(data.result);
        });

        this.app.use('/', router);
    }
}
export default new App();