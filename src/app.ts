import * as auth from './logic/auth';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as budgets from './logic/budgets';
import * as users from './logic/users';
import * as expenses from './logic/expenses';
import { User } from './entities/user';
import * as typeorm from 'typeorm';
import * as winston from 'winston';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import * as passportJwt from 'passport-jwt';
import * as cors from 'cors';
import { userRoutes } from './routes/user.routes';
import { budgetRoutes } from './routes/budget.routes';
import { expenseRoutes } from './routes/expense.routes';

class App {
    public app: express.Application;
    dbConnection: typeorm.Connection;
    budgetLogic: budgets.BudgetLogic;
    expenseLogic: expenses.ExpenseLogic;
    userLogic: users.UserLogic;
    authLogic: auth.AuthLogic;

    constructor() {
        this.app = express();
    }

    config(): void {
        this.app.use(cors());
        this.app.use((_req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            next();
        });
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        passport.use(
            new passportLocal.Strategy({
                usernameField: 'userName', passwordField: 'password'
            }, async (userName, password, done) => {
                try {
                    const user = await this.authLogic.login({ userName, password });
                    if (user) {
                        console.log('got user in local strategy', user);
                        return done(null, user);
                    } else {
                        console.log('User not found');
                        return done('User not found', null);
                    }
                } catch (err) {
                    console.log('oh no!', err);
                    return done(err, null);
                }
            })
        );

        passport.use(
            new passportJwt.Strategy({
                jwtFromRequest:  passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: 'secret'
            }, async (jwt_payload, done) => {
                console.log('jwt_payload', jwt_payload);
                try {
                    const user = await this.userLogic.getById(jwt_payload.id);
                    if (user) {
                        console.log('got user inside jwt_payload callback', user);
                        return done(null, user);
                    } else {
                        console.log('unable to get user inside jwt_payload callback');
                        return done('User not found', null);
                    }
                } catch (err) {
                    console.log('oh noes', err);
                    return done(err, null);
                }
            })
        );

        passport.serializeUser((user: User, done) => {
            console.log('serializing');
            return done(null, user.id);
        });

        passport.deserializeUser((id: number, done) => {
            console.log('deserializing');
            this.userLogic.getById(id)
                            .then(user => { console.log('got user in deserializer', user); done(null, user); })
                            .catch(err => { console.log('yikes', err); done(err, null); });
        });
    }

    routes(): void {
        /**
         * BUDGET ROUTES
         */
        this.app.use('/api', passport.authenticate('jwt', {
            session: true
        }), budgetRoutes(cors, this.budgetLogic));

        /**
         * EXPENSE ROUTES
         */
        this.app.use('/api', passport.authenticate('jwt', {
            session: true
        }), expenseRoutes(cors, this.budgetLogic, this.expenseLogic));

        /**
         * USER ROUTES
         */
        this.app.use('/api', userRoutes(cors, passport, this.userLogic, this.authLogic));
    }
}
export default new App();
