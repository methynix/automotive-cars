import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino/file',
    options: { destination: 1 }
  } : undefined,
  redact: ['req.headers.authorization'],
  serializers: {
    req: (req) => ({ method: req.method, url: req.url }),
    err: pino.stdSerializers.err
  }
});

export default logger;
