import { Budget, NewBudget, Expense } from '../models/budget';
import * as auth from './auth';
import { Query } from '../util/query';
import * as expenses from './expenses';
import { Result } from 'models/result';

export async function getBudgetById(query: Query, id: number): Promise<Result<string, Budget>> {
    let retVal: Result<string, Budget> = {
        err: 'Could not retrieve the budget. Please try again later.',
        result: null
    };
    const data = await query.query<Budget>({
        sqlString: 'select * from Budgets where Id = ?',
        values: [id]
    });
    if (!data.result) {
        if (data.err) {
            retVal.err = data.err.message;
        }
        return retVal;
    }
    if (data.result.length)
    const budget = ({
        id: data[0].ID,
        name: data[0].Name,
        total: data[0].Total,
        expenses: await expenses.getExpensesForBudget(query, id)
    } as Budget);
    const data_1 = await query.query({
        sqlString: 'select * from Budgets where ParentBudgetId = ?',
        values: [budget.id]
    });
    let subs: Budget[] = [];
    data_1.forEach(async (dat) => {
        subs.push(({
            id: dat.ID,
            name: dat.Name,
            expenses: await expenses.getExpensesForBudget(query, dat.ID),
            total: dat.Total
        } as Budget));
    });
    budget.subBudget = subs;
    return budget;
}

export async function getAll(query: Query): Promise<Budget[]> {
    let allBudgets: Budget[] = [];
    // first we want to get all the top-level budgets
    try {
        const data = await query.query({
            sqlString: 'select * from Budgets where ParentBudgetId is null',
            values: []
        });
        let clientBudgets: Promise<void>[] = [];
        // then for each top-level budget, we create a Promise
        // array to bulk-resolve and set all the top-level budgets'
        // expenses arrays, then add the budgets to the `allBudgets` array
        data.forEach(element => {
            let budget: Budget = {
                id: element.ID,
                name: element.Name,
                total: element.Total,
                expenses: []
            };
            clientBudgets.push(expenses.getExpensesForBudget(query, element.ID).then(exps => {
                budget.expenses = exps;
                allBudgets.push(budget);
            }));
        });
        await Promise.all(clientBudgets);
        let subBudgets: Promise<Budget[]>[] = [];
        // then we create another set of Promises to bulk-resolve,
        // but this time they create the sub-budgets rather than
        // the expenses
        allBudgets.forEach(budget_1 => {
            subBudgets.push(query.query({
                sqlString: 'select * from Budgets where ParentBudgetId = ?',
                values: [budget_1.id]
            }).then(async (data_1) => {
                let subs: Budget[] = [];
                data_1.forEach(async (dat) => {
                    subs.push(({
                        id: dat.ID,
                        name: dat.Name,
                        expenses: await expenses.getExpensesForBudget(query, dat.ID),
                        total: dat.Total
                    } as Budget));
                });
                return subs;
            }));
        });
        const end = await Promise.all(subBudgets);
        // once those all resolve, we give the top-level budgets
        // their child budgets and return the completed list of
        // all budgets
        end.forEach(b => {
            if (b.length > 0) {
                allBudgets.find(x => x.id === b[0].parentBudget).subBudget = b;
            }
        });
        return allBudgets;
    }
    catch (err) {
        console.log('wat', err);
        return null;
    }
}

export async function makeBudget(query: Query, budget: NewBudget): Promise<Budget> {
    const data = await query.query({
        sqlString: 'select * from Budgets b where b.Name = ?',
        values: [budget.name]
    });
    if (data.length !== 0) {
        return Promise.reject(null);
    }
    await query.query({
        sqlString: 'insert into Budgets (Name, Total) values (?, ?)',
        values: [budget.name, budget.total]
    });
    const id = await query.query({
        sqlString: 'select * from Budgets where Name = ?',
        values: [budget.name]
    });
    console.log('budgets.ts: 42', id);
    const budgetID = id[0].ID;
    let newExpenses: Promise<void>[] = [];
    budget.expenses.forEach(expense => {
        newExpenses.push(query.query({
            sqlString: 'insert into Expenses (BudgetId, Title, Cost) values (?, ?, ?)',
            values: [budgetID, expense.title, expense.cost]
        }));
    });
    const res = await Promise.all(newExpenses);
    return query.query({
        sqlString: 'select * from Budgets where Id = ?',
        values: [budgetID]
    });
}

export async function deleteBudget(query: Query, budget: number): Promise<boolean> {
    const res = await query.query({
        sqlString: 'select * from Budgets b where b.Id = ?',
        values: [budget]
    });
    if (res.length === 0) {
        return true;
    }
    const data = await query.query({
        sqlString: 'delete from Budgets where Id = ?',
        values: [budget]
    });
    return data;
}

export async function updateBudget(query: Query, budget: Budget): Promise<Budget> {
    const res = await query.query({
        sqlString: 'update Budgets b set b.Name = ?, b.Total = ?, b.LastEdited = ? where b.Id = ?',
        values: [budget.name, budget.total, /*moment.utc()*/, budget.id]
    });
    const data = await query.query({
        sqlString: 'select * from Budgets where Id = ?',
        values: [budget.id]
    });
    return data;
}