import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

import config from './config';

import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';

import productRoutes from './routes/product';
import orderRoutes from './routes/order';

import NotFoundError from './errors/not-found-error';

const app = express();

const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'images');
const logsDir = path.join(__dirname, '../logs');

[publicDir, imagesDir, logsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(cors({
  origin: config.ORIGIN_ALLOW,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(publicDir));

app.use(requestLogger);

mongoose.connect(config.DB_ADDRESS)
  .catch(() => {
    process.exit(1);
  });

app.get('/', (_req, res) => {
  res.json({
    message: 'Weblarek Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  });
});

app.use('/product', productRoutes);
app.use('/order', orderRoutes);

app.use('*', (_req, _res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

app.use(errorLogger);

app.use(errorHandler);

const { PORT } = config;
app.listen(PORT);

export default app;
