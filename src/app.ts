import express from 'express';

import { errorHandler } from '@/middlewares/errorHandler.js';
import { routes } from '@/routes/index.js';

const app = express();

app.use(express.json());

app.get('/ping', (_req, res) => {
  res.json({ status: 'pong' });
});

app.use(routes);

app.use(errorHandler);

export default app;
