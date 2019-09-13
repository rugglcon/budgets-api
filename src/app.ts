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

class App {
    public app: express.Application;
    dbConnection: typeorm.Connection;
    budgetLogic: BudgetLogic;
    expenseLogic: ExpenseLogic;
    userLogic: UserLogic;
    authLogic: AuthLogic;
    errorLogic: ErrorLogic;

    constructor() {
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
                    if (user) {
                        logger.info(`user with id [${user.id}] has logged in`);
                        return done(null, user);
                    } else {
                        logger.error('Someone tried to log in unsuccessfully');
                        return done('User not found', null);
                    }
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
            this.userLogic.getById(id)
                            .then(user => { logger.info('got user in deserializer', user.userName); done(null, user); })
                            .catch(err => { logger.error('yikes', err); done(err, null); });
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
    }
}
export default new App();
