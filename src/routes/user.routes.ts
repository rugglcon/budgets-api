import { NewUser } from 'data/entities/user';
import { Router, RequestHandler } from 'express';
import { PassportStatic } from 'passport';
import { UserLogic } from 'logic/users';
import { AuthLogic } from 'logic/auth';
import logger from '../util/logger';
import cors = require('cors');

/**
 * Creates the user routes
 */
export const userRoutes = (appCors: (options?: cors.CorsOptions | cors.CorsOptionsDelegate) => RequestHandler, passport: PassportStatic,
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

    // userRouter.all('*', appCors({ origin: true, credentials: true }));

    // logs a user in
    userRouter.post(
        '/login', (req, res, next) => {
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    console.log('yikes', err);
                    logger.error(err);
                    return next(err);
                }

                if (!user) {
                    logger.warn('null user');
                    return res.redirect('/api/user/login');
                }

                console.log('user', user);
                req.logIn(user, error => {
                    if (error) {
                        logger.error(error);
                        console.log('double yikes', error);
                        return next(error);
                    }
                    if (req.user) {
                        const token = userLogic.generateJWT(req.user);
                        logger.info('sending back token ' + token);
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
                return res.status(400).send({message: 'User does not exist.'});
            }
            logger.info(`logging out user [${req.user.id}]`);
            await authLogic.logout(req.user);
            req.logout();
            res.status(204).send();
        } catch (e) {
            console.log(e);
            logger.error(e.toString());
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
        logger.debug(`registered new user with username ${user.userName}`);
        const token = userLogic.generateJWT(user);
        logger.info('generated token for new user: ' + token);
        res.status(200).send({token});
    });

    return userRouter;
};
