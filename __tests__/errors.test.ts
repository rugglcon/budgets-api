import { Repository } from "typeorm"
import { ErrorLogic } from '../src/logic/errors';
import { JSError } from '../src/data/entities/error';

describe('ErrorLogic', () => {
    let repo: Repository<JSError>;
    let logic: ErrorLogic;

    beforeEach(() => {
        repo = new Repository<JSError>();
        logic = new ErrorLogic(repo);
    });

    it('should be instantiated', () => {
        expect(logic).toBeDefined();
    });
})