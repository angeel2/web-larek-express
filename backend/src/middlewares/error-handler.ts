import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { isCelebrateError } from 'celebrate';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

interface MongoErrorWithCode extends Error {
  code?: number;
}

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'На сервере произошла ошибка';

  if (isCelebrateError(err)) {
    statusCode = 400;
    const errorBody = err.details.get('body') || err.details.get('params') || err.details.get('query');
    message = errorBody ? errorBody.message : 'Ошибка валидации данных';
  } else if (err instanceof BadRequestError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ConflictError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Ошибка валидации данных';
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Невалидный ID';
  } else {
    const mongoError = err as MongoErrorWithCode;
    if (mongoError.code === 11000) {
      statusCode = 409;
      message = 'Запись с таким значением уже существует';
    } else {
      message = err.message || 'На сервере произошла ошибка';
    }
  }

  res.status(statusCode).json({
    message,
  });
};

export default errorHandler;
