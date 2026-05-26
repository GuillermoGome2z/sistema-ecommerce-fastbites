import { Router } from 'express';
import { getPaymentTypes } from '../controllers/payment-types.controller';

const router = Router();

router.get('/', getPaymentTypes);

export default router;
