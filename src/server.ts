import app from './app';
import * as path from 'path';
import * as fs from 'fs';
import { homedir } from 'os';
import { Query } from './util/query';

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
app.app.listen(port, () => {
    console.log('listening on port', port);
});