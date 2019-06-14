import * as mysql from 'mysql';
import { MysqlParams } from '../entities/mysql';
import { Result } from './result';

export class Query {
    connection: mysql.Pool;
    constructor(config: mysql.ConnectionConfig) {
        this.setup(config);
    }

    query<T>(params: MysqlParams): Promise<Result<mysql.MysqlError, T[]>> {
        return new Promise((resolve) => {
            this.connection.getConnection((err, conn) => {
                if (err) {
                    resolve({
                        err: err,
                        result: null
                    });
                }
                conn.query(params.sqlString, params.values, (err, res: T[], fields) => {
                    conn.release();
                    if (err) {
                        console.log('error:', err);
                        resolve({
                            err: err,
                            result: null
                        });
                    }
                    resolve({
                        err: null,
                        result: res
                    });
                });
            });
        });
    }

    setup(config: mysql.ConnectionConfig): void {
        this.connection = mysql.createPool(config);
    }
}
