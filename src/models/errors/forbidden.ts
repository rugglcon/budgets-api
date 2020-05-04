import { BaseError } from './base-error';

export class ForbiddenError extends BaseError {
    constructor(message: string, status = 403, err?: Error) {
        super(message, status, err);
    }
}
