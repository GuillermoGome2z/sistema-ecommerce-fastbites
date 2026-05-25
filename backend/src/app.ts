import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import healthRoutes   from './routes/health.routes';
import productsRoutes from './routes/products.routes';
import reportsRoutes  from './routes/reports.routes';
import authRoutes     from './routes/auth.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health',   healthRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/reports',  reportsRoutes);
app.use('/api/auth',     authRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

export default app;
