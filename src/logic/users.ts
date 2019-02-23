import { BaseLogic } from "./base-logic";
import { User } from "entities/user";
import { Repository } from "typeorm";
import { Logger } from "winston";

export class UserLogic extends BaseLogic<User> {
    constructor(repo: Repository<User>, log: Logger) {
        super(repo, log);
    }
}