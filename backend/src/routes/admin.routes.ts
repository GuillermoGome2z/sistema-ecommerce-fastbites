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
import {
  adminGetAllProducts,
  adminGetCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminToggleProduct,
} from '../controllers/admin.products.controller';
import {
  adminGetAllRestaurants,
  adminCreateRestaurant,
  adminUpdateRestaurant,
  adminToggleRestaurant,
} from '../controllers/admin.restaurants.controller';
import {
  adminGetAllOffers,
  adminCreateOffer,
  adminUpdateOffer,
  adminToggleOffer,
} from '../controllers/admin.offers.controller';
import {
  adminGetAllDayparts,
  adminToggleDaypart,
} from '../controllers/admin.dayparts.controller';
import { adminGetRoles } from '../controllers/admin.roles.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

const adminGuard = [
  authenticate,
  requireRole('Administrador', 'EmpleadoBackoffice', 'Supervisor'),
];

// Pedidos
router.get('/orders',                 ...adminGuard, adminGetOrders);
router.get('/orders/:id',             ...adminGuard, adminGetOrderById);
router.patch('/orders/:id/status',    ...adminGuard, adminUpdateOrderStatus);

// Usuarios
router.get('/users',                  ...adminGuard, adminGetUsers);
router.patch('/users/:id/toggle',     ...adminGuard, adminToggleUserActive);

// Roles
router.get('/roles',                  ...adminGuard, adminGetRoles);

// Productos
router.get('/products',               ...adminGuard, adminGetAllProducts);
router.get('/categories',             ...adminGuard, adminGetCategories);
router.post('/products',              ...adminGuard, adminCreateProduct);
router.put('/products/:id',           ...adminGuard, adminUpdateProduct);
router.patch('/products/:id/toggle',  ...adminGuard, adminToggleProduct);

// Restaurantes
router.get('/restaurants',            ...adminGuard, adminGetAllRestaurants);
router.post('/restaurants',           ...adminGuard, adminCreateRestaurant);
router.put('/restaurants/:id',        ...adminGuard, adminUpdateRestaurant);
router.patch('/restaurants/:id/toggle', ...adminGuard, adminToggleRestaurant);

// Ofertas
router.get('/offers',                 ...adminGuard, adminGetAllOffers);
router.post('/offers',                ...adminGuard, adminCreateOffer);
router.put('/offers/:id',             ...adminGuard, adminUpdateOffer);
router.patch('/offers/:id/toggle',    ...adminGuard, adminToggleOffer);

// Dayparts
router.get('/dayparts',               ...adminGuard, adminGetAllDayparts);
router.patch('/dayparts/:id/toggle',  ...adminGuard, adminToggleDaypart);

export default router;
