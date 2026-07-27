import express from 'express';
import { errorHandler } from '@/middlewares/errorHandler.js';
const app = express();

app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({ status: 'pong' });
});

app.use(errorHandler);

export default app;
