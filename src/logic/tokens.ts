import { BaseLogic } from './base-logic';
import { Token, TOKEN_LENGTH, TOKEN_CHARACTERS } from '../entities/token';
import { Repository } from 'typeorm';
import { Logger } from 'winston';
import * as cryptoRandomString from 'crypto-random-string';

export class TokenLogic extends BaseLogic<Token> {
    constructor(repo: Repository<Token>, log: Logger) {
        super(repo, log);
    }

    async create(item: Token): Promise<Token> {
        const tokenString = cryptoRandomString({
            length: TOKEN_LENGTH,
            characters: TOKEN_CHARACTERS
        });
        item.tokenString = tokenString;

        return await super.create(item);
    }
}
