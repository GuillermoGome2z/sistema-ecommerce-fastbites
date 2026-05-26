import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`FastBites API corriendo en http://localhost:${PORT}`);

  console.log('');
  console.log('  Salud');
  console.log('    GET  /api/health');
  console.log('    GET  /api/health/db');

  console.log('');
  console.log('  Autenticación');
  console.log('    POST /api/auth/login');
  console.log('    POST /api/auth/logout');
  console.log('    GET  /api/auth/me                           (🔒 token)');

  console.log('');
  console.log('  Clientes');
  console.log('    GET  /api/customers/me                      (🔒 token)');
  console.log('    GET  /api/customers/me/addresses            (🔒 token)');
  console.log('    POST /api/customers/me/addresses            (🔒 token)');
  console.log('    PUT  /api/customers/me/addresses/:id        (🔒 token)');
  console.log('    DEL  /api/customers/me/addresses/:id        (🔒 token)');
  console.log('    GET  /api/customers/me/payment-methods      (🔒 token)');
  console.log('    POST /api/customers/me/payment-methods      (🔒 token)');
  console.log('    DEL  /api/customers/me/payment-methods/:id  (🔒 token)');

  console.log('');
  console.log('  Carrito');
  console.log('    GET   /api/cart                  (🔒 token)');
  console.log('    POST  /api/cart/items            (🔒 token)');
  console.log('    PATCH /api/cart/items/:id        (🔒 token)');
  console.log('    DEL   /api/cart/items/:id        (🔒 token)');
  console.log('    DEL   /api/cart                  (🔒 token)');

  console.log('');
  console.log('  Pedidos');
  console.log('    POST  /api/orders                (🔒 token)');
  console.log('    GET   /api/orders                (🔒 token)');
  console.log('    GET   /api/orders/:id            (🔒 token)');
  console.log('    PATCH /api/orders/:id/cancel     (🔒 token)');

  console.log('');
  console.log('  Tipos de pago');
  console.log('    GET   /api/payment-types');

  console.log('');
  console.log('  Admin — Pedidos');
  console.log('    GET   /api/admin/orders                     (🔒 Administrador | EmpleadoBackoffice | Supervisor)');
  console.log('    GET   /api/admin/orders/:id                 (🔒 Administrador | EmpleadoBackoffice | Supervisor)');
  console.log('    PATCH /api/admin/orders/:id/status          (🔒 Administrador | EmpleadoBackoffice | Supervisor)');

  console.log('');
  console.log('  Productos');
  console.log('    GET  /api/products');

  console.log('');
  console.log('  Reportes');
  console.log('    GET  /api/reports/ventas-dia');
  console.log('    GET  /api/reports/ventas-hora');
  console.log('    GET  /api/reports/ventas-daypart');
});
