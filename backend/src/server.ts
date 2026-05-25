import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`FastBites API corriendo en http://localhost:${PORT}`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  GET  http://localhost:${PORT}/api/health/db`);
  console.log(`  GET  http://localhost:${PORT}/api/products`);
  console.log(`  GET  http://localhost:${PORT}/api/reports/ventas-dia`);
  console.log(`  GET  http://localhost:${PORT}/api/reports/ventas-hora`);
  console.log(`  GET  http://localhost:${PORT}/api/reports/ventas-daypart`);
  console.log(`  POST http://localhost:${PORT}/api/auth/login`);
});
