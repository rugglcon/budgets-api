import app from './app';
import * as path from 'path';
import * as fs from 'fs';
import { homedir } from 'os';
import { createConnection } from 'typeorm';
import { BudgetLogic } from './logic/budgets';
import { Budget, Expense } from './entities/budget';
import { ExpenseLogic } from './logic/expenses';
import { UserLogic } from './logic/users';
import { User } from './entities/user';
import { AuthLogic } from './logic/auth';
import * as winston from 'winston';

const port = 4000;
const log = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'budgets_api.log' })
    ]
});

const configs = JSON.parse(
    fs.readFileSync(
        path.join(homedir(), '.config/budgets/config.json')
    ).toString()
);

createConnection({
    host: 'localhost',
    database: 'budget_tracker',
    username: configs.username,
    password: configs.password,
    type: 'mysql',
    port: 3306,
    entities: [
        Budget,
        Expense,
        User
    ],
    synchronize: true,
    migrations: [
        './migrations/*.ts'
    ]
}).then(async conn => {
    app.dbConnection = conn;
    app.log = log;
    app.budgetLogic = new BudgetLogic(conn.getRepository<Budget>(Budget), log);
    app.expenseLogic = new ExpenseLogic(conn.getRepository<Expense>(Expense), log);
    app.userLogic = new UserLogic(conn.getRepository<User>(User), log);
    app.authLogic = new AuthLogic(app.userLogic, log);
    app.app.listen(port, () => {
        log.info(`listening on port ${port}`);
    });
}).catch(err => log.error(`TypeORM connection error: ${err.toString()}`));
