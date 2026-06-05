import { LoggerService, Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class WinstonLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: process.env.NODE_ENV === 'production'
            ? winston.format.combine(winston.format.timestamp(), winston.format.json())
            : winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, context }) => {
                  return `[AURXON] ${timestamp} [${context || 'System'}] ${level}: ${message}`;
                })
              ),
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, { context: optionalParams[0] });
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, { context: optionalParams[0], trace: optionalParams[1] });
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, { context: optionalParams[0] });
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, { context: optionalParams[0] });
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message, { context: optionalParams[0] });
  }
}
