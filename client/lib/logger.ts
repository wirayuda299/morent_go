import pino, { Logger } from 'pino';

export const logger: Logger =
  process.env['NODE_ENV'] === 'production'
    ? // JSON in production
      pino({ level: 'warn' })
    : // Pretty print in development
      pino({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
        level: 'debug',
      });
