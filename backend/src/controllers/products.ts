import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

interface ProductResponse {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  description?: string;
  price: number | null;
  image: {
    fileName: string;
    originalName: string;
  };
}

// Тип для документа продукта из Mongoose
type ProductDocument = mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  description?: string | null;
  price: number | null;
  image: {
    fileName: string;
    originalName: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
};

const formatProductResponse = (product: ProductDocument): ProductResponse => ({
  _id: product._id,
  title: product.title,
  category: product.category,
  description: product.description || undefined,
  price: product.price,
  image: product.image,
});

const getAllProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }) as ProductDocument[];

    res.status(200).json({
      items: products.map(formatProductResponse),
      total: products.length,
    });
  } catch (error) {
    next(new Error('Ошибка при получении товаров'));
  }
};

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    const productData = {
      title,
      image: {
        fileName: image.fileName,
        originalName: image.originalName,
      },
      category,
      description: description || undefined,
      price,
    };

    const product = await Product.create(productData) as ProductDocument;

    res.status(201).json(formatProductResponse(product));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map(
        (errItem: mongoose.Error.ValidatorError | mongoose.Error.CastError) => errItem.message,
      );
      next(new BadRequestError(`Ошибка валидации данных: ${messages.join(', ')}`));
      return;
    }

    next(new Error('Ошибка при создании товара'));
  }
};

const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id) as ProductDocument | null;

    if (!product) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    res.status(200).json(formatProductResponse(product));
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Невалидный ID товара'));
      return;
    }
    next(new Error('Ошибка при получении товара'));
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        runValidators: true,
        new: true,
      },
    ) as ProductDocument | null;

    if (!product) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    res.status(200).json(formatProductResponse(product));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map(
        (errItem: mongoose.Error.ValidatorError | mongoose.Error.CastError) => errItem.message,
      );
      next(new BadRequestError(`Ошибка валидации данных: ${messages.join(', ')}`));
      return;
    }

    if (error instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Невалидный ID товара'));
      return;
    }

    next(new Error('Ошибка при обновлении товара'));
  }
};

const productsController = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
};

export default productsController;
