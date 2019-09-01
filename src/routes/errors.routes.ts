import { Router } from 'express';
import { ErrorLogic } from '../logic/errors';
import { JSError } from '../data/entities/error';
import logger from '../util/logger';
import { User } from '../data/entities/user';

export const errorRoutes = (errorLogic: ErrorLogic): Router => {
    const errorRouter = Router();

    errorRouter.post('/log-js-error', async (req, res) => {
        const user = req.user as User;
        if (user == null) {
            // not authorized/logged in
            res.sendStatus(401);
            return;
        }
        const err = new JSError();
        err.stackTrace = req.body.stackTrace;
        err.userAgent = req.useragent.source;
        err.ipAddress = req.connection.remoteAddress;
        err.timestamp = new Date();
        err.userId = user.id;
        await errorLogic.create(err);
        logger.info('logged new js error', err);
        res.send(204);
    });

    return errorRouter;
};
