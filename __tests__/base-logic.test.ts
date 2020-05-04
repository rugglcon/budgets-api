import { BaseLogic } from '../src/logic/base-logic';
import { Repository } from 'typeorm';
import logger from '../src/util/logger';

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
        it('should return true if deletion went successfully', async () => {
            const item = Number(1);
            jest.spyOn(repo, 'findOne').mockImplementation(id => Promise.resolve(item));
            jest.spyOn(repo, 'remove').mockImplementation(ent => Promise.resolve(item));

            const res = await logic.delete(1);

            expect(res).toBeTruthy();
            expect(repo.findOne).toHaveBeenCalledWith(1);
            expect(repo.remove).toHaveBeenCalledWith(item);
        });

        it('should return false if there was an error', async () => {
            const item = Number(1);
            jest.spyOn(repo, 'findOne').mockImplementation(id => Promise.resolve(item));
            jest.spyOn(repo, 'remove').mockImplementation(ent => Promise.reject('err'));
            jest.spyOn(logger, 'error');

            const res = await logic.delete(1);

            expect(res).toBeFalsy();
            expect(repo.findOne).toHaveBeenCalledWith(1);
            expect(repo.remove).toHaveBeenCalledWith(item);
            expect(logger.error).toHaveBeenCalledWith('error deleting:', 'err');
        });

        it('should throw NotFoundError if the item does not exist', done => {
            jest.spyOn(repo, 'findOne').mockImplementation(id => Promise.resolve(undefined));
            jest.spyOn(repo, 'remove');

            logic.delete(1).catch(err => {
                expect(err.status).toBe(404);
                expect(err.message).toBe('Item not found.');
                expect(repo.findOne).toHaveBeenCalledWith(1);
                expect(repo.remove).not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe('getById', () => {
        it('should return the item if it exists', async () => {
            const item = Number(1);
            jest.spyOn(repo, 'findOne').mockImplementation(id => Promise.resolve(item));
            jest.spyOn(logger, 'info');

            const res = await logic.getById(1);

            expect(res).toBe(item);
            expect(logger.info).toHaveBeenCalledWith('got item with id: 1');
            expect(repo.findOne).toHaveBeenCalledWith(1);
        });

        it('should throw BaseError if something went wrong', done => {
            jest.spyOn(repo, 'findOne').mockImplementation(id => Promise.reject('no'));
            jest.spyOn(logger, 'info');
            jest.spyOn(logger, 'error');

            logic.getById(2).catch(err => {
                expect(err.status).toBe(500);
                expect(err.message).toBe('');
                expect(logger.info).not.toHaveBeenCalledWith('got item with id: 2');
                expect(logger.error).toHaveBeenCalledWith('no');
                done();
            });
        });
    });

    describe('getAll', () => {
        it('should return all items that exist', async () => {
            const arr = [Number(1)];
            jest.spyOn(repo, 'find').mockImplementation(() => Promise.resolve(arr));

            const ret = await logic.getAll();

            expect(repo.find).toHaveBeenCalledTimes(1);
            expect(ret).toBe(arr);
        });

        it('should throw BaseError if something went wrong', async () => {
            jest.spyOn(repo, 'find').mockImplementation(() => Promise.reject('err'));
            jest.spyOn(logger, 'error');

            try {
                await logic.getAll();
            } catch (e) {
                expect(e.message).toBe('');
                expect(e.status).toBe(500);
                expect(logger.error).toHaveBeenCalled();
            }
        });
    });

    describe('update', () => {
        it('should return updated item', async () => {
            jest.spyOn(repo, 'save').mockImplementation(() => Promise.resolve(Number(1)));

            const ret = await logic.update(Number(1));

            expect(ret).toBe(Number(1));
            expect(repo.save).toHaveBeenCalledWith(Number(1));
        });

        it('should throw BaseError if something went wrong', async () => {
            jest.spyOn(repo, 'save').mockImplementation(() => Promise.reject('err'));
            jest.spyOn(logger, 'error');

            try {
                await logic.update(Number(1));
            } catch (e) {
                expect(e.message).toBe('');
                expect(e.status).toBe(500);
                expect(logger.error).toHaveBeenCalled();
            }
        });
    });

    describe('create', () => {
        it('should return new item', async () => {
            const item = Number(1);
            jest.spyOn(repo, 'create').mockImplementation(() => item);
            jest.spyOn(repo, 'save').mockImplementation(() => Promise.resolve(item));

            const ret = await logic.create(Number(1));

            expect(ret).toBe(item);
            expect(repo.save).toHaveBeenCalledTimes(1);
            expect(repo.create).toHaveBeenCalledTimes(1);
        });

        it('should throw BaseError if create fails', async () => {
            jest.spyOn(repo, 'create').mockImplementation(() => {throw new Error('err');});
            jest.spyOn(logger, 'error');

            try {
                await logic.create(Number(1));
            } catch (e) {
                expect(e.message).toBe('err');
                expect(e.status).toBe(500);
                expect(logger.error).toHaveBeenCalled();
            }
        });

        it('should throw BaseError if save fails', async () => {
            jest.spyOn(repo, 'create').mockImplementation(() => Number(1));
            jest.spyOn(repo, 'save').mockImplementation(() => Promise.reject('err'));
            jest.spyOn(logger, 'error');

            try {
                await logic.create(Number(1));
            } catch (e) {
                expect(e.message).toBe('');
                expect(e.status).toBe(500);
                expect(logger.error).toHaveBeenCalled();
            }
        });
    });

    describe('get', () => {
        it('should return item', async () => {
            const item = Number(1);
            jest.spyOn(repo, 'findOne').mockImplementation(id => Promise.resolve(item));

            const ret = await logic.get({});

            expect(repo.findOne).toHaveBeenCalledTimes(1);
            expect(ret).toBe(item);
        });

        it('should throw BaseError if something went wrong', async () => {
            jest.spyOn(repo, 'findOne').mockImplementation(id => Promise.reject('err'));

            try {
                await logic.get({});
            } catch (e) {
                expect(e.message).toBe('');
                expect(e.status).toBe(500);
                expect(logger.error).toHaveBeenCalled();
            }
        });
    });

    describe('getMany', () => {
        it('should return items', async () => {
            const item = [Number(1)];
            jest.spyOn(repo, 'find').mockImplementation(id => Promise.resolve(item));

            const ret = await logic.getMany({});

            expect(ret).toBe(item);
            expect(repo.find).toHaveBeenCalledTimes(1);
        });

        it('should throw BaseError if something went wrong', async () => {
            jest.spyOn(repo, 'find').mockImplementation(() => Promise.reject('err'));

            try {
                await logic.getMany({});
            } catch (e) {
                expect(e.message).toBe('');
                expect(e.status).toBe(500);
                expect(logger.error).toHaveBeenCalled();
            }
        });
    });
});
