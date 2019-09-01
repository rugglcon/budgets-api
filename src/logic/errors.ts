import { BaseLogic } from './base-logic';
import { JSError } from '../data/entities/error';
import { Repository } from 'typeorm';

export class ErrorLogic extends BaseLogic<JSError> {
    constructor(repo: Repository<JSError>) {
        super(repo);
    }
}
