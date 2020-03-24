import { NewUser, User } from 'data/entities/user';
import { Router } from 'express';
import { PassportStatic } from 'passport';
import { UserLogic } from '../logic/users';
import { AuthLogic } from '../logic/auth';
import logger from '../util/logger';
import { BadRequestError } from '../models/bad-request';

/**
 * Creates the user routes
 */
export const userRoutes = (passport: PassportStatic,
                            userLogic: UserLogic, authLogic: AuthLogic): Router => {
    const userRouter = Router();

    // validates that id is a number
    userRouter.param('id', (_req, res, next, id) => {
        const _id = Number(id);
        if (isNaN(_id)) {
            return next(new BadRequestError(`Id must be a number, but received ${id}.`));
        }
        next();
    });

    // logs a user in
    userRouter.post(
        '/login', (req, res, next) => {
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    logger.error(err);
                    return next(err);
                }

                if (!user) {
                    logger.warn('null user');
                    return res.redirect('/user/login');
                }

                req.logIn(user, error => {
                    if (error) {
                        logger.error(error);
                        return next(error);
                    }
                    if (req.user) {
                        const token = userLogic.generateJWT(req.user as User);
                        logger.info('sending back token ' + token);
                        return res.status(200).send({token});
                    } else {
                        res.sendStatus(401);
                    }
                    next();
                });
            })(req, res, next);
        }
    );

    // logs a user out
    userRouter.post('/logout', passport.authenticate('jwt', {
        session: true
    }), async (req, res, next) => {
        try {
            if (req.user == null) {
                return next(new BadRequestError('User does not exist.'));
            }
            logger.info(`logging out user [${(req.user as User).id}]`);
            await authLogic.logout(req.user as User);
            req.logout();
            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    });

    // creates a user
    userRouter.post('/', async (req, res, next) => {
        // creates user and logs them in
        const newUser: NewUser = {
            userName: req.body.userName,
            password: req.body.password,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            signUpDate: new Date()
        };
        try {
            const user = await authLogic.signup(newUser);
            logger.debug(`registered new user with username ${user.userName}`);
            const token = userLogic.generateJWT(user);
            logger.info('generated token for new user: ' + token);
            res.status(200).send({token});
        } catch (err) {
            next(err);
        }
    });

    return userRouter;
};
