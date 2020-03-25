import { AuthLogic } from '../src/logic/auth';
import { UserLogic } from '../src/logic/users';
import { Repository } from 'typeorm';
import { User, NewUser } from '../src/data/entities/user';
import logger from '../src/util/logger';

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

    describe('login', () => {
        it('should return a user with loggedIn to true on successful login', async () => {
            jest.spyOn(repo, 'findOne').mockImplementation(options => Promise.resolve(user));
            jest.spyOn(repo, 'save').mockImplementation(item => Promise.resolve(user));
            jest.spyOn(userLogic, 'get');
            jest.spyOn(userLogic, 'update');

            const res = await logic.login({userName: 'user', password: 'password'});

            expect(res.loggedIn).toBeTruthy();
            expect(res.password).toBe(user.password);
            expect(res.userName).toBe(user.userName);
            expect(userLogic.get).toHaveBeenCalledWith({where: {userName: user.userName}});
            expect(userLogic.update).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundError if user does not exist on login', done => {
            jest.spyOn(repo, 'findOne').mockImplementation(options => Promise.resolve(undefined));
            jest.spyOn(userLogic, 'get');
            jest.spyOn(userLogic, 'update');
            jest.spyOn(logger, 'error');

            logic.login({userName: 'user', password: 'pass'}).catch(err => {
                expect(logger.error).toHaveBeenCalledWith('Got a null user');
                expect(err.message).toBe('User with username user not found.');
                expect(err.status).toBe(404);
                expect(userLogic.get).toHaveBeenCalledWith({where: {userName: user.userName}});
                expect(userLogic.update).not.toHaveBeenCalled();
                done();
            });
        });

        it('should throw UnauthorizedError if incorrect password given to login', done => {
            jest.spyOn(repo, 'findOne').mockImplementation(options => Promise.resolve(user));
            jest.spyOn(userLogic, 'get');
            jest.spyOn(userLogic, 'update');

            logic.login({userName: 'user', password: 'porsword'}).catch(err => {
                expect(err.message).toBe('Username and password do not match.');
                expect(err.status).toBe(401);
                expect(userLogic.get).toHaveBeenCalledWith({where: {userName: user.userName}});
                expect(userLogic.update).not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe('logout', () => {
        it('should set loggedIn to false on logout', async () => {
            jest.spyOn(userLogic, 'update');
            jest.spyOn(repo, 'save').mockImplementation(item => Promise.resolve(user));

            await logic.logout(user);

            expect(user.loggedIn).toBeFalsy();
            expect(userLogic.update).toHaveBeenCalled();
        });
    });

    describe('signup', () => {
        it('should create new loggedIn user on signup', async () => {
            jest.spyOn(repo, 'findOne').mockImplementationOnce(options => Promise.resolve(undefined));
            jest.spyOn(repo, 'create').mockImplementation(item => user);
            jest.spyOn(repo, 'save').mockImplementation(item => Promise.resolve(user));
            jest.spyOn(repo, 'findOne').mockImplementationOnce(options => Promise.resolve(user));
            jest.spyOn(userLogic, 'create');
            jest.spyOn(userLogic, 'get');
            jest.spyOn(logic, 'login');

            const loggedInUser = await logic.signup({userName: 'user', password: 'password'} as NewUser);
            expect(userLogic.create).toHaveBeenCalledTimes(1);
            expect(userLogic.get).toHaveBeenCalledTimes(2);
            expect(userLogic.get).toHaveBeenCalledWith({where: {userName: 'user'}});
            expect(logic.login).toHaveBeenCalledWith({userName: 'user', password: 'password'});
            expect(loggedInUser.userName).toEqual(user.userName);
            expect(loggedInUser.password).toEqual(user.password);
            expect(user.loggedIn).toBeTruthy();
        });

        it('should throw BadRequestError if duplicate username on signup', done => {
            jest.spyOn(repo, 'findOne').mockImplementation(options => Promise.resolve(user));
            jest.spyOn(logger, 'error');
            jest.spyOn(userLogic, 'get');

            logic.signup({userName: 'user', password: 'password'} as NewUser).catch(err => {
                expect(logger.error).toHaveBeenCalledWith('user with username [user] already exists');
                expect(repo.findOne).toHaveBeenCalledTimes(1);
                expect(err.message).toBe('User with username user already exists.');
                expect(err.status).toBe(400);
                expect(userLogic.get).toHaveBeenCalledWith({where: {userName: 'user'}});
                done();
            });
        });
    });

    describe('authenticate', () => {
        it('should return valid user when trying to authenticate', async () => {
            jest.spyOn(repo, 'findOne').mockImplementationOnce(options => Promise.resolve(user));
            jest.spyOn(userLogic, 'get');

            const ret = await logic.authenticate('user');

            expect(userLogic.get).toHaveBeenCalledTimes(1);
            expect(repo.findOne).toHaveBeenCalledTimes(1);
            expect(ret.userName).toBe(user.userName);
            expect(ret.password).toBe(user.password);
        });

        it('should throw NotFoundError if trying to authenticate for a user that does not exist', done => {
            jest.spyOn(repo, 'findOne').mockImplementation(options => Promise.resolve(undefined));
            jest.spyOn(userLogic, 'get');

            logic.authenticate('user').catch(err => {
                expect(err.message).toBe('User with username user not found as being logged in.');
                expect(err.status).toBe(404);
                expect(userLogic.get).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });
});