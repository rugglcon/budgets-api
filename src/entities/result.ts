/**
 * This can be used for functions that either
 * return some sort of error type or result type,
 * such as the query function in util/query.ts
 * and would be used as such there:
 *
 * export function query<T>(): Promise<Result<mysql.MysqlError, T>>
 */
export interface Result<E, T> {
    err: E;
    result: T;
}