import { Router } from 'express';
import productsController from '../controllers/products';
import { validateCreateProduct, validateProductId, validateUpdateProduct } from '../middlewares/validation';

const router = Router();

router.get('/', productsController.getAllProducts);
router.post('/', validateCreateProduct, productsController.createProduct);
router.get('/:id', validateProductId, productsController.getProductById);
router.patch('/:id', validateProductId, validateUpdateProduct, productsController.updateProduct);

export default router;
