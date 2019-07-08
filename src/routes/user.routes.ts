import { NewUser } from 'data/entities/user';
import { Router, RequestHandler } from 'express';
import { PassportStatic } from 'passport';
import { UserLogic } from 'logic/users';
import { AuthLogic } from 'logic/auth';
import { logger } from '../util/logger';

/**
 * Creates the user routes
 */
export const userRoutes = (cors: () => RequestHandler, passport: PassportStatic,
                            userLogic: UserLogic, authLogic: AuthLogic): Router => {
    const userRouter = Router();

    // validates that id is a number
    userRouter.param('id', (_req, res, next, id) => {
        const _id = Number(id);
        if (!isNaN(_id)) {
            next();
        } else {
            res.status(400).send({ message: 'Id must be a number.', id: id });
        }
    });

    userRouter.options('*', cors());

    // logs a user in
    userRouter.post(
        '/login', (req, res, next) => {
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    console.log('yikes', err);
                    return next(err);
                }

                if (!user) {
                    console.log('null user');
                    return res.redirect('/api/user/login');
                }

                console.log('user', user);
                req.logIn(user, error => {
                    if (error) {
                        console.log('double yikes', error);
                        return next(error);
                    }
                    console.log('hi', user);
                    if (req.user) {
                        const token = userLogic.generateJWT(req.user);
                        console.log('sending back', token);
                        return res.status(200).send({token});
                    } else {
                        res.status(401).send();
                    }
                    next();
                });
            })(req, res, next);
        }
    );

    // logs a user out
    userRouter.post('/logout', passport.authenticate('jwt', {
        session: true
    }), async (req, res) => {
        try {
            if (req.user == null) {
                res.status(400).send({message: 'User does not exist.'});
            }
            req.logout();
            await authLogic.logout(req.user);
            res.status(204).send();
        } catch (e) {
            logger.error(e);
            res.status(500).send({message: 'Something went wrong.', err: e});
        }
    });

    // creates a user
    userRouter.post('/', async (req, res) => {
        // creates user and logs them in
        const newUser: NewUser = {
            userName: req.body.userName,
            password: req.body.password,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        };
        const user = await authLogic.signup(newUser);
        logger.info(`registered new user with username ${user.userName}`);
        const token = userLogic.generateJWT(user);
        logger.info('generated token for new user');
        logger.info(token);
        res.status(200).send({token});
    });

    return userRouter;
};
