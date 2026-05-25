import { Request, Response } from 'express';

export async function login(_req: Request, res: Response): Promise<void> {
  // Login real pendiente de implementar (Módulo 1 — Autenticación)
  res.status(501).json({
    success: false,
    message: 'Login pendiente de implementar',
  });
}
