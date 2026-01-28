import { Router } from 'express';
import orderController from '../controllers/order';
import { validateCreateOrder } from '../middlewares/validation';

const router = Router();

router.post('/', validateCreateOrder, orderController.createOrder);

export default router;
