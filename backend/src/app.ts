import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import healthRoutes       from './routes/health.routes';
import productsRoutes     from './routes/products.routes';
import reportsRoutes      from './routes/reports.routes';
import authRoutes         from './routes/auth.routes';
import customersRoutes    from './routes/customers.routes';
import cartRoutes         from './routes/cart.routes';
import ordersRoutes       from './routes/orders.routes';
import paymentTypesRoutes from './routes/payment-types.routes';
import adminRoutes        from './routes/admin.routes';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/health',         healthRoutes);
app.use('/api/products',       productsRoutes);
app.use('/api/reports',        reportsRoutes);
app.use('/api/auth',           authRoutes);
app.use('/api/customers',      customersRoutes);
app.use('/api/cart',           cartRoutes);
app.use('/api/orders',         ordersRoutes);
app.use('/api/payment-types',  paymentTypesRoutes);
app.use('/api/admin',          adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

export default app;
