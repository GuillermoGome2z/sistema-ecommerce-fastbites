import { Router } from 'express';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todos los endpoints de carrito requieren autenticación
router.use(authenticate);

router.get('/',           getCart);
router.post('/items',     addItem);
router.patch('/items/:id', updateItem);
router.delete('/items/:id', removeItem);
router.delete('/',        clearCart);

export default router;
