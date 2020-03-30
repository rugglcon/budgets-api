import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import logger from '../util/logger';
import { NotFoundError } from '../models/errors/not-found';
import { BaseError } from '../models/errors/base-error';

export class BaseLogic<T> {
    protected _repo: Repository<T>;

    constructor(repo: Repository<T>) {
        this._repo = repo;
    }

    /**
     * Deletes the entity with the given id in the database
     * @param id id of the entity to be deleted
     */
    async delete(id: number): Promise<boolean> {
        const item = await this._repo.findOne(id);
        if (!item) {
            throw new NotFoundError('Item not found.');
        }

        try {
            await this._repo.remove(item);
        } catch (e) {
            logger.error('error deleting:', e);
            return false;
        }
        return true;
    }

    /**
     * Gets an entity from the database with the given id
     * @param id id of the entity to retrieve
     */
    async getById(id: number): Promise<T | undefined> {
        try {
            const item = await this._repo.findOne(id);
            logger.info(`got item with id: ${id}`);
            return item;
        } catch (e) {
            logger.error(e);
            throw new BaseError(e.message, 500, e);
        }
    }

    /**
     * Retrieves all entries of `T` in the database
     */
    async getAll(): Promise<T[]> {
        try {
            return await this._repo.find();
        } catch (e) {
            logger.error(e);
            throw new BaseError(e.message, 500, e);
        }
    }

    /**
     * Updates the given item in the database
     * @param item item to be updated
     */
    async update(item: T): Promise<T> {
        try {
            return await this._repo.save(item);
        } catch (e) {
            logger.error(e);
            throw new BaseError(e.message, 500, e);
        }
    }

    /**
     * Creates a new entity of the given type
     * @param item base entity to be created
     */
    async create(item: T): Promise<T> {
        try {
            const created = this._repo.create(item);
            await this._repo.save(created);
            return created;
        } catch (e) {
            logger.error(e);
            throw new BaseError(e.message, 500, e);
        }
    }

    async get(options: FindOneOptions): Promise<T | undefined> {
        try {
            return await this._repo.findOne(options);
        } catch (e) {
            logger.error(e);
            throw new BaseError(e.message, 500, e);
        }
    }

    async getMany(options: FindManyOptions): Promise<T[]> {
        try {
            return await this._repo.find(options);
        } catch (e) {
            logger.error(e);
            throw new BaseError(e.message, 500, e);
        }
    }
}
