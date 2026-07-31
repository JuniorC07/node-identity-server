import 'dotenv/config';
import { logger } from '@/main/logger/pinoLogger.js';
import app from '@/app.js';

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  logger.info('HTTP server started', {
    port,
    env: process.env.NODE_ENV,
  });
});

server.on('error', (error) => {
  logger.error('HTTP server failed', { error, port });
});
