import { Router } from 'express';
import {
  getMe,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getPaymentMethods,
  createPaymentMethod,
  deletePaymentMethod,
} from '../controllers/customers.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todos los endpoints de clientes requieren autenticación
router.use(authenticate);

router.get('/me',                          getMe);
router.get('/me/addresses',                getAddresses);
router.post('/me/addresses',               createAddress);
router.put('/me/addresses/:id',            updateAddress);
router.delete('/me/addresses/:id',         deleteAddress);

router.get('/me/payment-methods',          getPaymentMethods);
router.post('/me/payment-methods',         createPaymentMethod);
router.delete('/me/payment-methods/:id',   deletePaymentMethod);

export default router;
