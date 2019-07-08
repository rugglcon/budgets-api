import * as winston from 'winston';

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
                winston.format.colorize()
            )
        }),
        new winston.transports.File({ filename: 'budgets_api.log' })
    ]
});
