import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

enum PaymentMethod {
  CARD = 'card',
  ONLINE = 'online',
}

interface IOrderRequest {
  payment: PaymentMethod;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

interface IOrderResponse {
  id: string;
  total: number;
}

async function validateOrderItems(
  itemIds: string[],
  total: number,
): Promise<{ isValid: boolean; errors?: string[] }> {
  const errors: string[] = [];

  if (itemIds.length === 0) {
    errors.push('Массив items не должен быть пустым');
    return { isValid: false, errors };
  }

  const validIds = itemIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length !== itemIds.length) {
    errors.push('Некоторые ID товаров невалидны');
    return { isValid: false, errors };
  }

  const products = await Product.find({ _id: { $in: validIds } });

  if (products.length !== validIds.length) {
    const foundIds = products.map((p) => p._id.toString());
    const missingIds = validIds.filter((id) => !foundIds.includes(id));
    errors.push(`Товары с ID не найдены: ${missingIds.join(', ')}`);
    return { isValid: false, errors };
  }

  const productsWithoutPrice = products.filter((p) => p.price === null || p.price === undefined);
  if (productsWithoutPrice.length > 0) {
    const productNames = productsWithoutPrice.map((p) => p.title);
    errors.push(`Следующие товары не имеют цены: ${productNames.join(', ')}`);
    return { isValid: false, errors };
  }

  const itemsTotal = products.reduce((sum, product) => sum + (product.price || 0), 0);

  if (itemsTotal !== total) {
    errors.push(`Сумма товаров (${itemsTotal}) не равна указанной общей сумме (${total})`);
    return { isValid: false, errors };
  }

  return { isValid: true };
}

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orderData: IOrderRequest = req.body;
    const itemsValidation = await validateOrderItems(orderData.items, orderData.total);

    if (!itemsValidation.isValid && itemsValidation.errors) {
      next(new BadRequestError(itemsValidation.errors.join(', ')));
      return;
    }

    const orderId = faker.string.uuid();

    const response: IOrderResponse = {
      id: orderId,
      total: orderData.total,
    };

    res.status(201).json(response);
  } catch (error) {
    next(new Error('Внутренняя ошибка сервера при создании заказа'));
  }
};

const orderController = {
  createOrder,
};

export default orderController;
