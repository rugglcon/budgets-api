import { Repository } from "typeorm";
import { User } from "../src/data/entities/user";
import { UserLogic } from '../src/logic/users';

describe('UserLogic', () => {
    let logic: UserLogic;
    let repo: Repository<User>;

    beforeEach(() => {
        repo = new Repository<User>();
        logic = new UserLogic(repo);
    });

    it('should be instantiated', () => {
        expect(logic).toBeDefined();
    });

    it('should generate a jwt', () => {
        let user = new User();
        user.id = 1;
        user.email = 'email';
        user.userName = 'user';

        const jwt = logic.generateJWT(user);

        expect(jwt.length).not.toBe(0);
    });
});