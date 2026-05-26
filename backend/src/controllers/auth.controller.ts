import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/db';
import type { JwtPayload, UsuarioRow } from '../types/api.types';

const JWT_SECRET     = process.env.JWT_SECRET     ?? 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

const MAX_INTENTOS = 5;
const BLOQUEO_MIN  = 30;

// ─── POST /api/auth/login ──────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  const ip        = (req.headers['x-forwarded-for'] as string) ?? req.socket.remoteAddress ?? 'unknown';
  const userAgent = (req.headers['user-agent'] as string) ?? null;

  // Validación de inputs
  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400).json({ success: false, message: 'El email es requerido' });
    return;
  }
  if (!password || typeof password !== 'string') {
    res.status(400).json({ success: false, message: 'La contraseña es requerida' });
    return;
  }

  const emailClean = email.trim().toLowerCase();

  try {
    const pool = await getPool();

    // 1. Buscar usuario por email
    const userResult = await pool
      .request()
      .input('email', sql.NVarChar(150), emailClean)
      .query<UsuarioRow>(`
        SELECT UsuarioId, Email, PasswordHash, NombreCompleto,
               Activo, IntentosFallidosLogin, BloqueadoHasta
        FROM   Usuarios
        WHERE  Email = @email
      `);

    const usuario = userResult.recordset[0];

    // 2. Usuario no encontrado — no revelar si el email existe o no
    if (!usuario) {
      await pool
        .request()
        .input('email',     sql.NVarChar(150), emailClean)
        .input('ip',        sql.NVarChar(45),  ip)
        .input('userAgent', sql.NVarChar(500), userAgent)
        .input('motivo',    sql.NVarChar(200), 'Email no registrado')
        .query(`
          INSERT INTO IntentosLogin (UsuarioId, EmailIngresado, DireccionIP, UserAgent, Exitoso, Motivo)
          VALUES (NULL, @email, @ip, @userAgent, 0, @motivo)
        `);

      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
      return;
    }

    // 3. Cuenta inactiva
    if (!usuario.Activo) {
      await registrarIntento(pool, usuario.UsuarioId, emailClean, ip, userAgent, false, 'Usuario inactivo');
      res.status(401).json({
        success: false,
        message: 'Cuenta inactiva. Contacte al administrador.',
      });
      return;
    }

    // 4. Bloqueo temporal vigente
    if (usuario.BloqueadoHasta && new Date(usuario.BloqueadoHasta) > new Date()) {
      await registrarIntento(pool, usuario.UsuarioId, emailClean, ip, userAgent, false, 'Cuenta bloqueada');
      res.status(429).json({
        success: false,
        message: `Cuenta bloqueada temporalmente por ${BLOQUEO_MIN} minutos debido a múltiples intentos fallidos. Intente nuevamente más tarde.`,
      });
      return;
    }

    // 5. Verificar contraseña
    const passwordOk = await bcrypt.compare(password, usuario.PasswordHash);

    if (!passwordOk) {
      const nuevosIntentos = usuario.IntentosFallidosLogin + 1;
      const debeBloquear   = nuevosIntentos >= MAX_INTENTOS;

      if (debeBloquear) {
        await pool
          .request()
          .input('id',            sql.Int,       usuario.UsuarioId)
          .input('intentos',      sql.Int,        nuevosIntentos)
          .input('bloquearHasta', sql.DateTime2,  addMinutes(new Date(), BLOQUEO_MIN))
          .query(`
            UPDATE Usuarios
            SET    IntentosFallidosLogin = @intentos,
                   BloqueadoHasta       = @bloquearHasta,
                   UltimoIntentoLogin   = SYSDATETIME()
            WHERE  UsuarioId = @id
          `);
      } else {
        await pool
          .request()
          .input('id',       sql.Int, usuario.UsuarioId)
          .input('intentos', sql.Int, nuevosIntentos)
          .query(`
            UPDATE Usuarios
            SET    IntentosFallidosLogin = @intentos,
                   UltimoIntentoLogin   = SYSDATETIME()
            WHERE  UsuarioId = @id
          `);
      }

      await registrarIntento(pool, usuario.UsuarioId, emailClean, ip, userAgent, false, 'Contraseña incorrecta');

      const mensaje = debeBloquear
        ? `Demasiados intentos fallidos. Cuenta bloqueada por ${BLOQUEO_MIN} minutos.`
        : `Credenciales incorrectas. Intentos restantes: ${MAX_INTENTOS - nuevosIntentos}`;

      res.status(401).json({ success: false, message: mensaje });
      return;
    }

    // 6. Login exitoso — limpiar bloqueo e intentos fallidos
    await pool
      .request()
      .input('id', sql.Int, usuario.UsuarioId)
      .query(`
        UPDATE Usuarios
        SET    IntentosFallidosLogin = 0,
               BloqueadoHasta       = NULL,
               UltimoIntentoLogin   = SYSDATETIME()
        WHERE  UsuarioId = @id
      `);

    await registrarIntento(pool, usuario.UsuarioId, emailClean, ip, userAgent, true, null);

    // 7. Obtener roles activos del usuario
    const rolesResult = await pool
      .request()
      .input('id', sql.Int, usuario.UsuarioId)
      .query<{ Nombre: string }>(`
        SELECT r.Nombre
        FROM   UsuarioRoles ur
        INNER  JOIN Roles r ON r.RolId = ur.RolId
        WHERE  ur.UsuarioId = @id AND ur.Activo = 1 AND r.Activo = 1
      `);

    const roles = rolesResult.recordset.map(r => r.Nombre);

    // 8. Generar JWT
    const payload: JwtPayload = {
      usuarioId:     usuario.UsuarioId,
      email:         usuario.Email,
      nombreCompleto: usuario.NombreCompleto,
      roles,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        usuario: {
          id:             usuario.UsuarioId,
          email:          usuario.Email,
          nombreCompleto: usuario.NombreCompleto,
          roles,
        },
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── POST /api/auth/logout ─────────────────────────────────────
// JWT es stateless: el cliente descarta el token localmente.
export function logout(_req: Request, res: Response): void {
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
}

// ─── GET /api/auth/me ──────────────────────────────────────────
// Devuelve los datos del usuario autenticado (requiere token válido).
export function me(req: Request, res: Response): void {
  res.json({
    success: true,
    data: {
      id:             req.user!.usuarioId,
      email:          req.user!.email,
      nombreCompleto: req.user!.nombreCompleto,
      roles:          req.user!.roles,
    },
  });
}

// ─── Helpers internos ──────────────────────────────────────────

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

type Pool = Awaited<ReturnType<typeof getPool>>;

async function registrarIntento(
  pool: Pool,
  usuarioId: number,
  email: string,
  ip: string,
  userAgent: string | null,
  exitoso: boolean,
  motivo: string | null,
): Promise<void> {
  await pool
    .request()
    .input('usuarioId', sql.Int,        usuarioId)
    .input('email',     sql.NVarChar(150), email)
    .input('ip',        sql.NVarChar(45),  ip)
    .input('userAgent', sql.NVarChar(500), userAgent)
    .input('exitoso',   sql.Bit,           exitoso ? 1 : 0)
    .input('motivo',    sql.NVarChar(200), motivo)
    .query(`
      INSERT INTO IntentosLogin (UsuarioId, EmailIngresado, DireccionIP, UserAgent, Exitoso, Motivo)
      VALUES (@usuarioId, @email, @ip, @userAgent, @exitoso, @motivo)
    `);
}
