import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/api.types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';

// ─── authenticate ──────────────────────────────────────────────
// Valida el Bearer token y adjunta el payload al request.
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token de autenticación requerido' });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
}

// ─── requireRole ──────────────────────────────────────────────
// Middleware factory: requiere que el usuario tenga al menos uno de los roles indicados.
// Debe usarse después de authenticate.
//
// Ejemplo:
//   router.get('/admin', authenticate, requireRole('Administrador'), handler)
//   router.get('/staff', authenticate, requireRole('Administrador', 'EmpleadoBackoffice'), handler)
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
