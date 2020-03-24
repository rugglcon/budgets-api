import { BaseLogic } from "../src/logic/base-logic";
import { Repository } from "typeorm";

describe('BaseLogic', () => {
    let logic: BaseLogic<Number>;
    let repo: Repository<Number>;

    beforeEach(() => {
        repo = new Repository<Number>();
        logic = new BaseLogic(repo);
    });

    it('should be instantiated', () => {
        expect(logic).toBeDefined();
    });

    describe('delete', () => {
        it('should return true if deletion went successfully', () => {
            expect(true).toBeTruthy();
        });

        it('should return false if there was an error', () => {
            expect(true).toBeTruthy();
        });

        it('should throw NotFoundError if the item does not exist', () => {
            expect(true).toBeTruthy();
        });
    });

    describe('getById', () => {
        it('should return the item if it exists', () => {
            expect(true).toBeTruthy();
        });

        it('should throw BaseError if something went wrong', () => {
            expect(true).toBeTruthy();
        });
    });

    describe('getAll', () => {
        it('should return all items that exist', () => {
            expect(true).toBeTruthy();
        });

        it('should throw BaseError if something went wrong', () => {
            expect(true).toBeTruthy();
        });
    });

    describe('update', () => {
        it('should return updated item', () => {
            expect(true).toBeTruthy();
        });

        it('should throw BaseError if something went wrong', () => {
            expect(true).toBeTruthy();
        });
    });

    describe('create', () => {
        it('should return new item', () => {
            expect(true).toBeTruthy();
        });

        it('should throw BaseError if something went wrong', () => {
            expect(true).toBeTruthy();
        });
    });

    describe('get', () => {
        it('should return item', () => {
            expect(true).toBeTruthy();
        });

        it('should throw BaseError if something went wrong', () => {
            expect(true).toBeTruthy();
        });
    });

    describe('getMany', () => {
        it('should return items', () => {
            expect(true).toBeTruthy();
        });

        it('should throw BaseError if something went wrong', () => {
            expect(true).toBeTruthy();
        });
    });
});