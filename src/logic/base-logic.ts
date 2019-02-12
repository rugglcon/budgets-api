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
        const item = await this._repo
                                .findOne(id);
        console.log('item by id:', item);
        return item;
    }

    /**
     * Retrieves all entries of `T` in the database
     */
    async getAll(): Promise<T[]> {
        return this._repo.find();
    }

    /**
     * Updates the given item in the database
     * @param item item to be updated
     */
    async update(item: T): Promise<T> {
        return await this._repo.save(item);
    }

    /**
     * Creates a new entity of the given type
     * @param item base entity to be created
     */
    async create(item: T): Promise<T> {
        const created = await this._repo.create(item);
        return await this._repo.save(item);
    }

    async get(options: FindOneOptions): Promise<T> {
        return await this._repo.findOne(options);
    }

    async getMany(options: FindManyOptions): Promise<T[]> {
        return await this._repo.find(options);
    }
}