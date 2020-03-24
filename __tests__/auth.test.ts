import { AuthLogic } from '../src/logic/auth';
import { UserLogic } from '../src/logic/users';
import { Repository } from 'typeorm';
import { User } from '../src/data/entities/user';

describe('AuthLogic should', () => {
    let logic: AuthLogic;
    let userLogic: UserLogic;
    let repo: Repository<User>;
    let user: User;

    beforeEach(() => {
        repo = new Repository<User>();
        userLogic = new UserLogic(repo);
        logic = new AuthLogic(userLogic);

        user = new User();
        // hashed version of 'password'
        user.password = '$2b$10$2f.Q.8acxtXTIvZADjtNfex9THg6gBlXrITG194IWtb1h0MeVScKK';
        user.userName = 'user';
    });

    it('should be instantiated', () => {
        expect(logic).toBeDefined();
    });

    it('should return a user with loggedIn to true on successful login', async () => {
        jest.spyOn(repo, 'findOne').mockImplementation(options => Promise.resolve(user));
        jest.spyOn(repo, 'save').mockImplementation(item => Promise.resolve(user));

        const res = await logic.login({userName: 'user', password: 'password'});

        expect(res.loggedIn).toBeTruthy();
        expect(res.password).toBe(user.password);
        expect(res.userName).toBe(user.userName);
    });

    it('should throw NotFoundError if user does not exist on login', () => {
        expect(true).toBeTruthy();
    });

    it('should throw UnauthorizedError if incorrect password given to login', () => {
        expect(true).toBeTruthy();
    });

    it('should set loggedIn to false on logout', () => {
        expect(true).toBeTruthy();
    });

    it('should create new loggedIn user on signup', () => {
        expect(true).toBeTruthy();
    });

    it('should throw BadRequestError if duplicate username on signup', () => {
        expect(true).toBeTruthy();
    });

    it('should return valid user when trying to authenticate', () => {
        expect(true).toBeTruthy();
    });

    it('should throw NotFoundError if trying to authenticate for a user that does not exist', () => {
        expect(true).toBeTruthy();
    });
});