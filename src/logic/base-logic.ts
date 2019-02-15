import { Repository, FindManyOptions, FindOneOptions } from "typeorm";

export class BaseLogic<T> {
    protected _repo: Repository<T>;

    constructor(repo: Repository<T>) { this._repo = repo; }

    /**
     * Deletes the entity with the given id in the database
     * @param id id of the entity to be deleted
     */
    async delete(id: number): Promise<boolean> {
        const item = await this._repo.findOne(id);
        try {
            await this._repo.remove(item);
        } catch (e) {
            console.error('error deleting:', e);
            return false;
        }
        return true;
    }

    /**
     * Gets an entity from the database with the given id
     * @param id id of the entity to retrieve
     */
    async getById(id: number): Promise<T> {
        let item = null;
        try {
            item = await this._repo
                                .findOne(id);
        } catch (e) {
            console.error(e);
            throw e;
        }
        console.log('item by id:', item);
        return item;
    }

    /**
     * Retrieves all entries of `T` in the database
     */
    async getAll(): Promise<T[]> {
        let items = null;
        try {
            items = await this._repo.find();
        } catch(e) {
            console.log(e);
            throw e;
        }
        return items;
    }

    /**
     * Updates the given item in the database
     * @param item item to be updated
     */
    async update(item: T): Promise<T> {
        let newItem = null;
        try {
            newItem = await this._repo.save(item);
        } catch (e) {
            console.error(e);
            throw e;
        }
        return newItem;
    }

    /**
     * Creates a new entity of the given type
     * @param item base entity to be created
     */
    async create(item: T): Promise<T> {
        let created = null;
        try {
            created = await this._repo.create(item);
            await this._repo.save(created);
        } catch (e) {
            console.error(e);
            throw e;
        }
        return created;
    }

    async get(options: FindOneOptions): Promise<T> {
        let item = null;
        try {
            item = await this._repo.findOne(options);
        } catch (e) {
            console.error(e);
            throw e;
        }
        return item;
    }

    async getMany(options: FindManyOptions): Promise<T[]> {
        let items = null;
        try {
            items = await this._repo.find(options);
        } catch (e) {
            console.error(e);
            throw e;
        }
        return items;
    }
}