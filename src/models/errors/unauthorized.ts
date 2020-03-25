import { BaseError } from './base-error';

export class UnauthorizedError extends BaseError {
    constructor(message: string, status = 401, err?: Error) {
        super(message, status, err);
    }
}
