import express from 'express';
import { routes } from '@/routes/index.js';
import { makeErrorHandlerMiddleware } from './main/factories/middlewares/makeErrorHandlerMiddleware.js';
import { makeHttpLoggerMiddleware } from './main/factories/middlewares/makeHttpLoggerMiddleware.js';

const app = express();

app.use(makeHttpLoggerMiddleware());
app.use(express.json());

app.get('/ping', (_req, res) => {
  res.json({ status: 'pong' });
});

app.use(routes);

app.use(makeErrorHandlerMiddleware());

export default app;
