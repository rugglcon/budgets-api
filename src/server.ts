import app from './app';
import { createConnection } from 'typeorm';
import { BudgetLogic } from './logic/budgets';
import { Budget } from './data/entities/budget';
import { ExpenseLogic } from './logic/expenses';
import { UserLogic } from './logic/users';
import { User } from './data/entities/user';
import { AuthLogic } from './logic/auth';
import { Expense } from './data/entities/expense';
import logger from './util/logger';
import { ErrorLogic } from './logic/errors';
import { JSError } from './data/entities/error';

const port = 4000;

// const configs = JSON.parse(
//     fs.readFileSync(
//         path.join(homedir(), '.config/budgets/config.json')
//     ).toString()
// );

createConnection().then(async conn => {
    app.dbConnection = conn;
    app.budgetLogic = new BudgetLogic(conn.getRepository<Budget>(Budget));
    app.expenseLogic = new ExpenseLogic(conn.getRepository<Expense>(Expense));
    app.userLogic = new UserLogic(conn.getRepository<User>(User));
    app.authLogic = new AuthLogic(app.userLogic);
    app.errorLogic = new ErrorLogic(conn.getRepository<JSError>(JSError));
    // need to call these after the logic is instantiated
    // otherwise they will be undefined when passed to the route
    // functions
    app.config();
    app.routes();
    app.app.listen(port, () => {
        logger.info(`listening on port ${port}`);
    });
}).catch(err => logger.error(`TypeORM connection error: ${err.toString()}`));
