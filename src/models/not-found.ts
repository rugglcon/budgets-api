import { BaseError } from "./base-error";

export class NotFoundError extends BaseError {
    constructor(message: string, status = 404, err?: Error) {
        super(message, status, err);
    }
}