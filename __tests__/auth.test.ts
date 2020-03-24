import { AuthLogic } from '../src/logic/auth';
import { UserLogic } from '../src/logic/users';
import { Repository } from 'typeorm';
import { User } from '../src/data/entities/user';

describe('Auth Service should', () => {
    let service: AuthLogic;
    let userLogic: UserLogic;
    let repo: Repository<User>;
    let user: User;

    beforeEach(() => {
        repo = new Repository<User>();
        userLogic = new UserLogic(repo);
        service = new AuthLogic(userLogic);

        user = new User();
        // hashed version of 'password'
        user.password = '$2b$10$2f.Q.8acxtXTIvZADjtNfex9THg6gBlXrITG194IWtb1h0MeVScKK';
        user.userName = 'user';
    });

    it('should return a user with loggedIn to true on successful login', async () => {
        jest.spyOn(repo, 'findOne').mockImplementation(options => Promise.resolve(user));
        jest.spyOn(repo, 'save').mockImplementation(item => Promise.resolve(user));

        const res = await service.login({userName: 'user', password: 'password'});

        expect(res.loggedIn).toBeTruthy();
        expect(res.password).toBe(user.password);
        expect(res.userName).toBe(user.userName);
    });
});