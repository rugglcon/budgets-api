import { Query } from './../util/query';
import { Expense, NewExpense } from 'models/budget';

export function makeExpense(query: Query, expense: NewExpense): Promise<Expense> {
    return query.query({
        sqlString: 'insert into Expenses (BudgetId, Title, Cost) values (?, ?, ?)',
        values: [expense.budgetId, expense.title, expense.cost]
    })
    .then(() => {
        return query.query({
            sqlString: 'LAST_INSERT_ID()',
            values: []
        });
    })
    .then(res => {
        return res;
    });
}

export function getExpensesForBudget(query: Query, parentID: number): Promise<Expense[]> {
    return query.query({
        sqlString: 'select * from Expenses where BudgetId = ?',
        values: [parentID]
    }).then(exps => {
        let allExps: Expense[] = [];
        exps.forEach(exp => {
            allExps.push({
                id: exp.ID,
                budgetId: parentID,
                title: exp.Title,
                cost: exp.Cost
            } as Expense);
        });
        return allExps;
    });
}

export function deleteExpense(query: Query, id: number): Promise<void> {
    return query.query({
        sqlString: 'delete from Expenses where Id = ?',
        values: [id]
    });
}