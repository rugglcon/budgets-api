export interface NewBudget {
    name: string,
    total: number,
    subBudget?: NewBudget[],
    expenses: NewExpense[]
}

export interface Budget {
    /**
     * ID of the budget
     */
    id: number,
    /**
     * ID of the owner of this budget
     */
    owner?: number,
    /**
     * title the owner gives the budget
     */
    name: string,
    /**
     * list of expenses in this budget
     */
    expenses: Expense[],
    /**
     * if this budget has sub-budgets, they go here
     */
    subBudget?: Budget[],
    /**
     * "budget" of the budget
     */
    total: number,
    /**
     * parent of this budget
     */
    parentBudget?: number
}

export interface NewExpense {
    title: string,
    cost: number,
    budgetId: number
}

export interface Expense {
    id: number,
    /**
     * ID of the budget this Expense belongs to
     */
    budgetId: number,
    title: string,
    cost: number
}