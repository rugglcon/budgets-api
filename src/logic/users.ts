import { BaseLogic } from "./base-logic";
import { User } from "entities/user";
import { Repository } from "typeorm";

export class UserLogic extends BaseLogic<User> {
    constructor(repo: Repository<User>) {
        super(repo);
    }


}