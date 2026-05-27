import { Router } from 'express';
import {
  adminGetOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
} from '../controllers/admin.orders.controller';
import {
  adminGetUsers,
  adminToggleUserActive,
} from '../controllers/admin.users.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Requiere autenticación + rol de staff
const adminGuard = [
  authenticate,
  requireRole('Administrador', 'EmpleadoBackoffice', 'Supervisor'),
];

// Pedidos
router.get('/orders',               ...adminGuard, adminGetOrders);
router.get('/orders/:id',           ...adminGuard, adminGetOrderById);
router.patch('/orders/:id/status',  ...adminGuard, adminUpdateOrderStatus);

// Usuarios
router.get('/users',                ...adminGuard, adminGetUsers);
router.patch('/users/:id/toggle',   ...adminGuard, adminToggleUserActive);

export default router;
