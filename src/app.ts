import { AuthLogic } from './logic/auth';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { BudgetLogic } from './logic/budgets';
import { UserLogic } from './logic/users';
import { ExpenseLogic } from './logic/expenses';
import { User } from './data/entities/user';
import * as typeorm from 'typeorm';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import * as passportJwt from 'passport-jwt';
import * as cors from 'cors';
import { userRoutes } from './routes/user.routes';
import { budgetRoutes } from './routes/budget.routes';
import { expenseRoutes } from './routes/expense.routes';
import logger from './util/logger';
import { ErrorLogic } from './logic/errors';
import { errorRoutes } from './routes/errors.routes';
import * as useragent from 'express-useragent';
import { BaseError } from './models/errors/base-error';

export class App {
    public app: express.Application;
    dbConnection: typeorm.Connection;
    budgetLogic: BudgetLogic;
    expenseLogic: ExpenseLogic;
    userLogic: UserLogic;
    authLogic: AuthLogic;
    errorLogic: ErrorLogic;

    constructor(dbConnection: typeorm.Connection, budgetLogic: BudgetLogic,
        expenseLogic: ExpenseLogic, userLogic: UserLogic,
        authLogic: AuthLogic, errorLogic: ErrorLogic) {
        this.dbConnection = dbConnection;
        this.budgetLogic = budgetLogic;
        this.expenseLogic = expenseLogic,
        this.userLogic = userLogic;
        this.authLogic = authLogic;
        this.errorLogic = errorLogic;
        this.app = express();
    }

    config(): void {
        this.app.options('*', cors());
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(useragent.express());
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        passport.use(
            new passportLocal.Strategy({
                usernameField: 'userName', passwordField: 'password'
            }, async (userName, password, done) => {
                try {
                    const user = await this.authLogic.login({ userName, password });
                    return done(null, user);
                } catch (err) {
                    logger.error('An error occurred:', err);
                    return done(err, null);
                }
            })
        );

        passport.use(
            new passportJwt.Strategy({
                jwtFromRequest:  passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: 'secret'
            }, async (jwt_payload, done) => {
                try {
                    const user = await this.userLogic.getById(jwt_payload.id);
                    if (user) {
                        logger.info(`got user [${user.id}] inside jwt_payload callback`);
                        return done(null, user);
                    } else {
                        logger.error('unable to get user inside jwt_payload callback');
                        return done('User not found', null);
                    }
                } catch (err) {
                    logger.error('oh noes', err);
                    return done(err, null);
                }
            })
        );

        passport.serializeUser((user: User, done) => {
            return done(null, user.id);
        });

        passport.deserializeUser((id: number, done) => {
            this.userLogic.getById(id).then(user => {
                if (!user) {
                    logger.error('could not retrieve user');
                    return done('User not found.');
                }
                logger.info('got user in deserializer', user.userName);
                done(null, user);
            }).catch(err => {
                logger.error('yikes', err);
                done(err, null);
            });
        });
    }

    routes(): void {
        /**
         * BUDGET ROUTES
         */
        this.app.use('/budgets', passport.authenticate('jwt', {
            session: true
        }), budgetRoutes(this.budgetLogic, this.expenseLogic));
        logger.info('instantiated budget routes');

        /**
         * EXPENSE ROUTES
         */
        this.app.use('/expense', passport.authenticate('jwt', {
            session: true
        }), expenseRoutes(this.budgetLogic, this.expenseLogic));
        logger.info('instantiated expense routes');

        /**
         * USER ROUTES
         */
        this.app.use('/user', userRoutes(passport, this.userLogic, this.authLogic));
        logger.info('instantiated user routes');

        /**
         * ERROR ROUTES
         */
        this.app.use('/', passport.authenticate('jwt', {
            session: true
        }), errorRoutes(this.errorLogic));
        logger.info('instantiated error routes');

        /**
         * ERROR HANDLER
         */
        this.app.use((err: BaseError, req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (!err) {
                next();
            }

            logger.error(`received error with status ${err.status}, message ${err.message}`);
            res.status(err.status || 500).send({message: err.message});
        });
    }
}
