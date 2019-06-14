import app from './app';
import * as path from 'path';
import * as fs from 'fs';
import { homedir } from 'os';
import { createConnection } from 'typeorm';
import { BudgetLogic } from './logic/budgets';
import { Budget } from './entities/budget';
import { ExpenseLogic } from './logic/expenses';
import { UserLogic } from './logic/users';
import { User } from './entities/user';
import { AuthLogic } from './logic/auth';
import * as winston from 'winston';
import { Expense } from './entities/expense';
import { TokenLogic } from './logic/tokens';
import { Token } from './entities/token';

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

createConnection().then(async conn => {
    app.dbConnection = conn;
    app.log = log;
    app.budgetLogic = new BudgetLogic(conn.getRepository<Budget>(Budget), log);
    app.expenseLogic = new ExpenseLogic(conn.getRepository<Expense>(Expense), log);
    app.userLogic = new UserLogic(conn.getRepository<User>(User), log);
    app.tokenLogic = new TokenLogic(conn.getRepository<Token>(Token), log);
    app.authLogic = new AuthLogic(app.userLogic, app.tokenLogic, log);
    app.app.listen(port, () => {
        log.info(`listening on port ${port}`);
    });
}).catch(err => log.error(`TypeORM connection error: ${err.toString()}`));
