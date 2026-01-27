import { Router } from 'express';
import productRoutes from './product';
import orderRoutes from './order';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    message: 'Weblarek Backend API',
    version: '1.0.0',
    endpoints: {
      products: '/product',
      orders: '/order',
    },
  });
});

router.use('/product', productRoutes);
router.use('/order', orderRoutes);

export default router;
