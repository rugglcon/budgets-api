import * as winston from 'winston';

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.File({ filename: 'budgets_api.log' }),
        new winston.transports.File({ filename: 'budgets_api.error.log', level: 'error' })
    ]
});

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            logger.format
        )
    }));
}

export default logger;
