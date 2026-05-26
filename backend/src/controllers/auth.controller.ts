import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/db';
import type { JwtPayload, UsuarioRow } from '../types/api.types';

const JWT_SECRET     = process.env.JWT_SECRET     ?? 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

const MAX_INTENTOS = 5;
const BLOQUEO_MIN  = 30;

// ─── AUXILIARES DE CONSOLA (SIMULACIÓN DE CORREO LLAMATIVO) ────────────
function imprimirCorreoSimulado(destinatario: string, asunto: string, titulo: string, contenido: string, codigo: string) {
  const azul = '\x1b[36m';
  const amarillo = '\x1b[33m';
  const naranja = '\x1b[38;5;208m';
  const reset = '\x1b[0m';
  const negrita = '\x1b[1m';

  console.log(`\n${naranja}┌────────────────────────────────────────────────────────────────────────┐${reset}`);
  console.log(`${naranja}│                  📩  FASTBITES — NOTIFICACIÓN DE SISTEMA              │${reset}`);
  console.log(`${naranja}├────────────────────────────────────────────────────────────────────────┤${reset}`);
  console.log(`${naranja}│${reset}  ${negrita}Para:${reset} ${destinatario.padEnd(58)} ${naranja}│${reset}`);
  console.log(`${naranja}│${reset}  ${negrita}Asunto:${reset} ${asunto.padEnd(56)} ${naranja}│${reset}`);
  console.log(`${naranja}├────────────────────────────────────────────────────────────────────────┤${reset}`);
  console.log(`${naranja}│${reset}                                                                        ${naranja}│${reset}`);
  console.log(`${naranja}│${reset}  ${negrita}${titulo}${reset}`.padEnd(80) + `${naranja}│${reset}`);
  console.log(`${naranja}│${reset}                                                                        ${naranja}│${reset}`);
  
  // Dividir y formatear el contenido
  const lineas = contenido.split('\n');
  for (const linea of lineas) {
    console.log(`${naranja}│${reset}  ${linea.padEnd(68)} ${naranja}│${reset}`);
  }
  
  console.log(`${naranja}│${reset}                                                                        ${naranja}│${reset}`);
  console.log(`${naranja}│${reset}  ${amarillo}┌────────────────────────────────────────────────────────┐${reset}            ${naranja}│${reset}`);
  console.log(`${naranja}│${reset}  ${amarillo}│${reset} ${negrita}CÓDIGO DE VERIFICACIÓN:${reset}              ${azul}${codigo}${reset}            ${amarillo}│${reset}            ${naranja}│${reset}`);
  console.log(`${naranja}│${reset}  ${amarillo}└────────────────────────────────────────────────────────┘${reset}            ${naranja}│${reset}`);
  console.log(`${naranja}│${reset}                                                                        ${naranja}│${reset}`);
  console.log(`${naranja}│${reset}  Este código tiene una validez de 5 minutos.                           ${naranja}│${reset}`);
  console.log(`${naranja}│${reset}  Por motivos de seguridad, no compartas este PIN con nadie.            ${naranja}│${reset}`);
  console.log(`${naranja}│${reset}                                                                        ${naranja}│${reset}`);
  console.log(`${naranja}└────────────────────────────────────────────────────────────────────────┘\n`);
}

// ─── POST /api/auth/register ────────────────────────────────────
export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, nombreCompleto, telefono } = req.body as {
    email?: string;
    password?: string;
    nombreCompleto?: string;
    telefono?: string;
  };

  if (!email || !password || !nombreCompleto) {
    res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    return;
  }

  const emailClean = email.trim().toLowerCase();

  try {
    const pool = await getPool();

    // Validar si el email ya existe
    const existCheck = await pool
      .request()
      .input('email', sql.NVarChar(150), emailClean)
      .query('SELECT UsuarioId FROM Usuarios WHERE Email = @email');

    if (existCheck.recordset.length > 0) {
      res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
      return;
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Iniciar transacción implícita
    // 1. Insertar Usuario
    const userInsert = await pool
      .request()
      .input('email', sql.NVarChar(150), emailClean)
      .input('passwordHash', sql.NVarChar(500), passwordHash)
      .input('nombreCompleto', sql.NVarChar(150), nombreCompleto)
      .input('telefono', sql.NVarChar(20), telefono ?? null)
      .query<{ UsuarioId: number }>(`
        INSERT INTO Usuarios (Email, PasswordHash, NombreCompleto, Telefono, Activo, EmailVerificado)
        OUTPUT INSERTED.UsuarioId
        VALUES (@email, @passwordHash, @nombreCompleto, @telefono, 1, 0)
      `);

    const usuarioId = userInsert.recordset[0].UsuarioId;

    // 2. Buscar Rol Cliente
    const rolResult = await pool
      .request()
      .query<{ RolId: number }>('SELECT RolId FROM Roles WHERE Nombre = \'Cliente\'');
    const rolId = rolResult.recordset[0]?.RolId ?? 1;

    // 3. Asignar Rol Cliente
    await pool
      .request()
      .input('usuarioId', sql.Int, usuarioId)
      .input('rolId', sql.Int, rolId)
      .query('INSERT INTO UsuarioRoles (UsuarioId, RolId, Activo) VALUES (@usuarioId, @rolId, 1)');

    // 4. Crear registro en tabla Clientes
    const nombres = nombreCompleto.split(' ');
    const nombre = nombres[0] || 'Cliente';
    const apellido = nombres.slice(1).join(' ') || 'FastBites';

    await pool
      .request()
      .input('usuarioId', sql.Int, usuarioId)
      .input('nombre', sql.NVarChar(100), nombre)
      .input('apellido', sql.NVarChar(100), apellido)
      .input('telefono', sql.NVarChar(20), telefono ?? null)
      .query('INSERT INTO Clientes (UsuarioId, Nombre, Apellido, Telefono) VALUES (@usuarioId, @nombre, @apellido, @telefono)');

    // 5. Generar PIN de 6 dígitos
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinHash = await bcrypt.hash(pin, 10);
    const expiracion = addMinutes(new Date(), 5);

    await pool
      .request()
      .input('usuarioId', sql.Int, usuarioId)
      .input('codigoHash', sql.NVarChar(500), pinHash)
      .input('expiracion', sql.DateTime2, expiracion)
      .query(`
        INSERT INTO PinesVerificacionLogin (UsuarioId, CodigoHash, FechaExpiracion, Usado)
        VALUES (@usuarioId, @codigoHash, @expiracion, 0)
      `);

    // 6. Simular envío de correo por consola con diseño llamativo
    imprimirCorreoSimulado(
      emailClean,
      '¡Verifica tu cuenta en FastBites! 🍔',
      `¡Hola ${nombreCompleto}! Bienvenido a FastBites.`,
      'Nos alegra mucho que te unas a nuestra comunidad de amantes del buen sabor.\nPara activar tu cuenta y poder realizar tus compras, ingresa el código\nde verificación en el portal web.',
      pin
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado con éxito. Se requiere verificación.',
      require_verification: true,
      userId: usuarioId,
      email: emailClean,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar el usuario',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── POST /api/auth/login ──────────────────────────────────────
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  const ip        = (req.headers['x-forwarded-for'] as string) ?? req.socket.remoteAddress ?? 'unknown';
  const userAgent = (req.headers['user-agent'] as string) ?? null;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
    return;
  }

  const emailClean = email.trim().toLowerCase();

  try {
    const pool = await getPool();

    // 1. Buscar usuario
    const userResult = await pool
      .request()
      .input('email', sql.NVarChar(150), emailClean)
      .query<UsuarioRow>(`
        SELECT UsuarioId, Email, PasswordHash, NombreCompleto,
               Activo, IntentosFallidosLogin, BloqueadoHasta, EmailVerificado
        FROM   Usuarios
        WHERE  Email = @email
      `);

    const usuario = userResult.recordset[0];

    if (!usuario) {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
      return;
    }

    // 2. Cuenta inactiva
    if (!usuario.Activo) {
      res.status(401).json({ success: false, message: 'Cuenta inactiva. Contacte soporte.' });
      return;
    }

    // 3. Bloqueo temporal
    if (usuario.BloqueadoHasta && new Date(usuario.BloqueadoHasta) > new Date()) {
      res.status(429).json({
        success: false,
        message: `Cuenta bloqueada por múltiples intentos. Intente nuevamente en unos minutos.`,
      });
      return;
    }

    // 4. Verificar contraseña
    const passwordOk = await bcrypt.compare(password, usuario.PasswordHash);

    if (!passwordOk) {
      const nuevosIntentos = usuario.IntentosFallidosLogin + 1;
      const debeBloquear   = nuevosIntentos >= MAX_INTENTOS;

      await pool
        .request()
        .input('id', sql.Int, usuario.UsuarioId)
        .input('intentos', sql.Int, nuevosIntentos)
        .input('bloqueo', sql.DateTime2, debeBloquear ? addMinutes(new Date(), BLOQUEO_MIN) : null)
        .query(`
          UPDATE Usuarios
          SET    IntentosFallidosLogin = @intentos,
                 BloqueadoHasta = @bloqueo,
                 UltimoIntentoLogin = SYSDATETIME()
          WHERE  UsuarioId = @id
        `);

      await registrarIntento(pool, usuario.UsuarioId, emailClean, ip, userAgent, false, 'Contraseña incorrecta');

      const msg = debeBloquear
        ? `Demasiados intentos fallidos. Cuenta bloqueada por ${BLOQUEO_MIN} minutos.`
        : `Credenciales incorrectas. Intentos restantes: ${MAX_INTENTOS - nuevosIntentos}`;

      res.status(401).json({ success: false, message: msg });
      return;
    }

    // 5. Verificar si el email no está verificado
    if (!usuario.EmailVerificado) {
      // Re-generar y enviar PIN de verificación
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const pinHash = await bcrypt.hash(pin, 10);
      const expiracion = addMinutes(new Date(), 5);

      await pool
        .request()
        .input('usuarioId', sql.Int, usuario.UsuarioId)
        .input('codigoHash', sql.NVarChar(500), pinHash)
        .input('expiracion', sql.DateTime2, expiracion)
        .query('INSERT INTO PinesVerificacionLogin (UsuarioId, CodigoHash, FechaExpiracion) VALUES (@usuarioId, @codigoHash, @expiracion)');

      imprimirCorreoSimulado(
        emailClean,
        'Verifica tu cuenta en FastBites 🍔',
        `Hola de nuevo, ${usuario.NombreCompleto}.`,
        'Vemos que aún no has verificado tu cuenta. Ingresa este código\npara activar tu cuenta y poder ingresar al sistema.',
        pin
      );

      res.status(200).json({
        success: true,
        message: 'Cuenta no verificada. Se requiere validación de PIN.',
        require_verification: true,
        userId: usuario.UsuarioId,
        email: emailClean,
      });
      return;
    }

    // 6. Login correcto con MFA habilitado
    // Generar un PIN temporal de MFA
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinHash = await bcrypt.hash(pin, 10);
    const expiracion = addMinutes(new Date(), 5);

    await pool
      .request()
      .input('usuarioId', sql.Int, usuario.UsuarioId)
      .input('codigoHash', sql.NVarChar(500), pinHash)
      .input('expiracion', sql.DateTime2, expiracion)
      .query('INSERT INTO PinesVerificacionLogin (UsuarioId, CodigoHash, FechaExpiracion) VALUES (@usuarioId, @codigoHash, @expiracion)');

    // Correo simulado
    imprimirCorreoSimulado(
      emailClean,
      'Tu código de acceso de doble factor (MFA) 🔐',
      `Seguridad de inicio de sesión de FastBites.`,
      `Se ha solicitado un inicio de sesión desde tu cuenta.\nPor favor, ingresa el siguiente código de verificación en tu navegador.`,
      pin
    );

    res.json({
      success: true,
      message: 'Credenciales correctas. Se requiere código de doble factor (MFA).',
      require_mfa: true,
      userId: usuario.UsuarioId,
      email: emailClean,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── POST /api/auth/verify-pin ──────────────────────────────────
export async function verifyPin(req: Request, res: Response): Promise<void> {
  const { userId, pin, type } = req.body as {
    userId?: number;
    pin?: string;
    type?: 'registration' | 'mfa' | 'recovery';
  };

  if (!userId || !pin || !type) {
    res.status(400).json({ success: false, message: 'Datos incompletos para verificación' });
    return;
  }

  try {
    const pool = await getPool();

    // 1. Obtener pines activos de PinesVerificacionLogin
    const pinResult = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query<{ PinId: number; CodigoHash: string; FechaExpiracion: Date; IntentosFallidos: number }>(`
        SELECT TOP 1 PinId, CodigoHash, FechaExpiracion, IntentosFallidos
        FROM PinesVerificacionLogin
        WHERE UsuarioId = @userId AND Usado = 0
        ORDER BY FechaCreacion DESC
      `);

    const activePin = pinResult.recordset[0];

    if (!activePin) {
      res.status(400).json({ success: false, message: 'No se encontró un código PIN activo o ya fue utilizado.' });
      return;
    }

    if (new Date(activePin.FechaExpiracion) < new Date()) {
      res.status(400).json({ success: false, message: 'El PIN de verificación ha expirado.' });
      return;
    }

    // 2. Comparar PIN
    const isOk = await bcrypt.compare(pin, activePin.CodigoHash);

    if (!isOk) {
      const fallos = activePin.IntentosFallidos + 1;
      await pool
        .request()
        .input('pinId', sql.Int, activePin.PinId)
        .input('fallos', sql.Int, fallos)
        .query('UPDATE PinesVerificacionLogin SET IntentosFallidos = @fallos WHERE PinId = @pinId');

      res.status(400).json({ success: false, message: `Código de verificación incorrecto. Intentos restantes: ${10 - fallos}` });
      return;
    }

    // 3. Marcar PIN como usado
    await pool
      .request()
      .input('pinId', sql.Int, activePin.PinId)
      .query('UPDATE PinesVerificacionLogin SET Usado = 1, FechaUso = SYSDATETIME() WHERE PinId = @pinId');

    // 4. Si es verificación de registro, activar usuario
    if (type === 'registration') {
      await pool
        .request()
        .input('userId', sql.Int, userId)
        .query('UPDATE Usuarios SET Activo = 1, EmailVerificado = 1, IntentosFallidosLogin = 0, BloqueadoHasta = NULL WHERE UsuarioId = @userId');
    }

    // 5. Si es de tipo login o registro exitoso, retornar JWT
    if (type === 'registration' || type === 'mfa') {
      const userResult = await pool
        .request()
        .input('id', sql.Int, userId)
        .query<UsuarioRow>(`
          SELECT UsuarioId, Email, NombreCompleto
          FROM   Usuarios
          WHERE  UsuarioId = @id
        `);

      const usuario = userResult.recordset[0];

      const rolesResult = await pool
        .request()
        .input('id', sql.Int, userId)
        .query<{ Nombre: string }>(`
          SELECT r.Nombre
          FROM   UsuarioRoles ur
          INNER  JOIN Roles r ON r.RolId = ur.RolId
          WHERE  ur.UsuarioId = @id AND ur.Activo = 1 AND r.Activo = 1
        `);

      const roles = rolesResult.recordset.map(r => r.Nombre);

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
        message: 'PIN verificado con éxito',
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
    } else {
      // Si es tipo 'recovery', responder exitoso para que puedan cambiar contraseña
      res.json({
        success: true,
        message: 'PIN de recuperación verificado correctamente.',
        verified: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar el PIN',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── POST /api/auth/forgot-password ─────────────────────────────
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };

  if (!email) {
    res.status(400).json({ success: false, message: 'El correo electrónico es requerido' });
    return;
  }

  const emailClean = email.trim().toLowerCase();

  try {
    const pool = await getPool();

    // 1. Validar que exista el usuario
    const userCheck = await pool
      .request()
      .input('email', sql.NVarChar(150), emailClean)
      .query<{ UsuarioId: number; NombreCompleto: string }>('SELECT UsuarioId, NombreCompleto FROM Usuarios WHERE Email = @email AND Activo = 1');

    const usuario = userCheck.recordset[0];

    if (!usuario) {
      // Respondemos con éxito simulado por privacidad, pero por consola avisamos que no existía
      console.log(`[PASS RECOVERY] Solicitud para correo no existente o inactivo: ${emailClean}`);
      res.json({
        success: true,
        message: 'Si el correo electrónico está registrado, recibirás un código de recuperación.',
      });
      return;
    }

    // 2. Generar PIN de recuperación
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinHash = await bcrypt.hash(pin, 10);
    const expiracion = addMinutes(new Date(), 10);

    // 3. Almacenar en TokensRecuperacionPassword
    await pool
      .request()
      .input('usuarioId', sql.Int, usuario.UsuarioId)
      .input('tokenHash', sql.NVarChar(500), pinHash)
      .input('expiracion', sql.DateTime2, expiracion)
      .query(`
        INSERT INTO TokensRecuperacionPassword (UsuarioId, TokenHash, FechaExpiracion, Usado)
        VALUES (@usuarioId, @tokenHash, @expiracion, 0)
      `);

    // 4. Imprimir correo simulado en consola
    imprimirCorreoSimulado(
      emailClean,
      'Recuperación de Contraseña — FastBites 🔑',
      `Hola ${usuario.NombreCompleto}.`,
      'Recibimos una solicitud para restablecer la contraseña de tu cuenta.\nPor favor, utiliza el siguiente código PIN de seguridad\npara verificar tu identidad e ingresar tu nueva clave.',
      pin
    );

    res.json({
      success: true,
      message: 'Si el correo electrónico está registrado, recibirás un código de recuperación.',
      userId: usuario.UsuarioId,
      email: emailClean,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al solicitar código de recuperación',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── POST /api/auth/reset-password ──────────────────────────────
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { userId, pin, newPassword } = req.body as {
    userId?: number;
    pin?: string;
    newPassword?: string;
  };

  if (!userId || !pin || !newPassword) {
    res.status(400).json({ success: false, message: 'Datos incompletos para restablecer clave' });
    return;
  }

  try {
    const pool = await getPool();

    // 1. Obtener token de TokensRecuperacionPassword
    const tokenResult = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query<{ TokenId: number; TokenHash: string; FechaExpiracion: Date }>(`
        SELECT TOP 1 TokenId, TokenHash, FechaExpiracion
        FROM TokensRecuperacionPassword
        WHERE UsuarioId = @userId AND Usado = 0
        ORDER BY FechaCreacion DESC
      `);

    const activeToken = tokenResult.recordset[0];

    if (!activeToken) {
      res.status(400).json({ success: false, message: 'Código de recuperación inválido o ya utilizado.' });
      return;
    }

    if (new Date(activeToken.FechaExpiracion) < new Date()) {
      res.status(400).json({ success: false, message: 'El código de recuperación ha expirado.' });
      return;
    }

    // 2. Verificar PIN
    const isOk = await bcrypt.compare(pin, activeToken.TokenHash);

    if (!isOk) {
      res.status(400).json({ success: false, message: 'Código de recuperación incorrecto.' });
      return;
    }

    // 3. Encriptar nueva clave
    const newHash = await bcrypt.hash(newPassword, 10);

    // 4. Actualizar tabla Usuarios
    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('newHash', sql.NVarChar(500), newHash)
      .query('UPDATE Usuarios SET PasswordHash = @newHash, IntentosFallidosLogin = 0, BloqueadoHasta = NULL, FechaActualizacion = SYSDATETIME() WHERE UsuarioId = @userId');

    // 5. Marcar token como Usado
    await pool
      .request()
      .input('tokenId', sql.Int, activeToken.TokenId)
      .query('UPDATE TokensRecuperacionPassword SET Usado = 1, FechaUso = SYSDATETIME() WHERE TokenId = @tokenId');

    res.json({
      success: true,
      message: 'Tu contraseña se ha restablecido con éxito. Ya puedes iniciar sesión.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al restablecer la contraseña',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── POST /api/auth/logout ─────────────────────────────────────
export function logout(_req: Request, res: Response): void {
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
}

// ─── GET /api/auth/me ──────────────────────────────────────────
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
