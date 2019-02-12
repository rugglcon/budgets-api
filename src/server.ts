import app from './app';
import * as path from 'path';
import * as fs from 'fs';
import { homedir } from 'os';
import { Query } from './util/query';
import { createConnection } from 'typeorm';
import { BudgetLogic } from 'logic/budgets';
import { Budget } from 'entities/budget';

const port = 4000;
const configs = JSON.parse(
    fs.readFileSync(
        path.join(homedir(), '.config/budgets/config.json')
    ).toString()
);
app.query = new Query({
    host: 'localhost',
    database: 'budget_tracker',
    user: configs.username,
    password: configs.password
});

createConnection({
    host: 'localhost',
    database: 'budget_tracker',
    username: configs.username,
    password: configs.password,
    type: 'mysql'
}).then(async conn => {
    app.dbConnection = conn;
    app.budgetLogic = new BudgetLogic(conn.getRepository<Budget>(Budget));
    app.app.listen(port, () => {
        console.log('listening on port', port);
    });
}).catch(err => console.error('TypeORM connection error:', err));
