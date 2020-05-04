import * as http from 'http-status';

export class BaseError extends Error {
    status: number;
    message: string;

    constructor(message?: string, status = http.INTERNAL_SERVER_ERROR, err?: Error) {
        super(message);
        this.status = status;
        this.name = 'InternalServerError';

        if (err) {
            this.stack = err.stack;
        }
    }
}
