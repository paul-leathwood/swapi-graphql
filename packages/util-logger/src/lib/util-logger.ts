import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty'
  },
  level: process.env.LOG_LEVEL
})

export {
  logger
};
