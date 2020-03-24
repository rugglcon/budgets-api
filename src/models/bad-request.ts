import { BaseError } from "./base-error";

export class BadRequestError extends BaseError {
    constructor(message: string, status = 400, err?: Error) {
        super(message, status, err);
    }
}