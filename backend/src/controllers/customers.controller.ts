import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';
import type { ClienteRow, DireccionRow } from '../types/api.types';

type Pool = Awaited<ReturnType<typeof getPool>>;

// ─── Helper interno ────────────────────────────────────────────
async function getClienteByUsuarioId(pool: Pool, usuarioId: number): Promise<ClienteRow | null> {
  const result = await pool
    .request()
    .input('usuarioId', sql.Int, usuarioId)
    .query<ClienteRow>(`
      SELECT ClienteId, UsuarioId, Nombre, Apellido, Telefono, FechaNacimiento, Activo
      FROM   Clientes
      WHERE  UsuarioId = @usuarioId AND Activo = 1
    `);
  return result.recordset[0] ?? null;
}

// ─── GET /api/customers/me ─────────────────────────────────────
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    res.json({
      success: true,
      data: {
        clienteId:       cliente.ClienteId,
        nombre:          cliente.Nombre,
        apellido:        cliente.Apellido,
        telefono:        cliente.Telefono,
        fechaNacimiento: cliente.FechaNacimiento,
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

// ─── GET /api/customers/me/addresses ──────────────────────────
export async function getAddresses(req: Request, res: Response): Promise<void> {
  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    const result = await pool
      .request()
      .input('clienteId', sql.Int, cliente.ClienteId)
      .query<DireccionRow>(`
        SELECT DireccionId, ClienteId, Alias, Calle, NumeroExterior, NumeroInterior,
               Colonia, Ciudad, Estado, CodigoPostal, Referencias,
               Latitud, Longitud, EsPrincipal
        FROM   DireccionesCliente
        WHERE  ClienteId = @clienteId AND Activo = 1
        ORDER  BY EsPrincipal DESC, FechaCreacion ASC
      `);

    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── POST /api/customers/me/addresses ─────────────────────────
export async function createAddress(req: Request, res: Response): Promise<void> {
  const {
    alias, calle, numeroExterior, numeroInterior,
    colonia, ciudad, estado, codigoPostal,
    referencias, latitud, longitud, esPrincipal,
  } = req.body as Record<string, unknown>;

  if (!alias || !calle || !ciudad || !estado || !codigoPostal) {
    res.status(400).json({
      success: false,
      message: 'Campos requeridos: alias, calle, ciudad, estado, codigoPostal',
    });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    const esPrincipalBit = Boolean(esPrincipal) ? 1 : 0;

    // Si será principal, quitar el flag de las demás
    if (esPrincipalBit) {
      await pool
        .request()
        .input('clienteId', sql.Int, cliente.ClienteId)
        .query('UPDATE DireccionesCliente SET EsPrincipal = 0 WHERE ClienteId = @clienteId');
    }

    const insertResult = await pool
      .request()
      .input('clienteId',      sql.Int,          cliente.ClienteId)
      .input('alias',          sql.NVarChar(50),  String(alias))
      .input('calle',          sql.NVarChar(200), String(calle))
      .input('numeroExterior', sql.NVarChar(20),  numeroExterior != null ? String(numeroExterior) : null)
      .input('numeroInterior', sql.NVarChar(20),  numeroInterior != null ? String(numeroInterior) : null)
      .input('colonia',        sql.NVarChar(100), colonia        != null ? String(colonia)        : null)
      .input('ciudad',         sql.NVarChar(100), String(ciudad))
      .input('estado',         sql.NVarChar(100), String(estado))
      .input('codigoPostal',   sql.NVarChar(10),  String(codigoPostal))
      .input('referencias',    sql.NVarChar(300), referencias    != null ? String(referencias)    : null)
      .input('latitud',        sql.Decimal(10, 7), latitud       != null ? Number(latitud)        : null)
      .input('longitud',       sql.Decimal(10, 7), longitud      != null ? Number(longitud)       : null)
      .input('esPrincipal',    sql.Bit,           esPrincipalBit)
      .query<{ DireccionId: number }>(`
        INSERT INTO DireccionesCliente (
          ClienteId, Alias, Calle, NumeroExterior, NumeroInterior, Colonia,
          Ciudad, Estado, CodigoPostal, Referencias, Latitud, Longitud, EsPrincipal
        )
        OUTPUT INSERTED.DireccionId
        VALUES (
          @clienteId, @alias, @calle, @numeroExterior, @numeroInterior, @colonia,
          @ciudad, @estado, @codigoPostal, @referencias, @latitud, @longitud, @esPrincipal
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Dirección agregada correctamente',
      data: { direccionId: insertResult.recordset[0].DireccionId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── PUT /api/customers/me/addresses/:id ──────────────────────
export async function updateAddress(req: Request, res: Response): Promise<void> {
  const direccionId = parseInt(req.params.id, 10);
  if (isNaN(direccionId)) {
    res.status(400).json({ success: false, message: 'ID de dirección inválido' });
    return;
  }

  const {
    alias, calle, numeroExterior, numeroInterior,
    colonia, ciudad, estado, codigoPostal,
    referencias, latitud, longitud, esPrincipal,
  } = req.body as Record<string, unknown>;

  if (!alias || !calle || !ciudad || !estado || !codigoPostal) {
    res.status(400).json({
      success: false,
      message: 'Campos requeridos: alias, calle, ciudad, estado, codigoPostal',
    });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    // Verificar que la dirección pertenece a este cliente
    const verify = await pool
      .request()
      .input('direccionId', sql.Int, direccionId)
      .input('clienteId',   sql.Int, cliente.ClienteId)
      .query(`
        SELECT DireccionId
        FROM   DireccionesCliente
        WHERE  DireccionId = @direccionId AND ClienteId = @clienteId AND Activo = 1
      `);

    if (!verify.recordset[0]) {
      res.status(404).json({ success: false, message: 'Dirección no encontrada' });
      return;
    }

    const esPrincipalBit = Boolean(esPrincipal) ? 1 : 0;

    if (esPrincipalBit) {
      await pool
        .request()
        .input('clienteId', sql.Int, cliente.ClienteId)
        .query('UPDATE DireccionesCliente SET EsPrincipal = 0 WHERE ClienteId = @clienteId');
    }

    await pool
      .request()
      .input('direccionId',    sql.Int,          direccionId)
      .input('alias',          sql.NVarChar(50),  String(alias))
      .input('calle',          sql.NVarChar(200), String(calle))
      .input('numeroExterior', sql.NVarChar(20),  numeroExterior != null ? String(numeroExterior) : null)
      .input('numeroInterior', sql.NVarChar(20),  numeroInterior != null ? String(numeroInterior) : null)
      .input('colonia',        sql.NVarChar(100), colonia        != null ? String(colonia)        : null)
      .input('ciudad',         sql.NVarChar(100), String(ciudad))
      .input('estado',         sql.NVarChar(100), String(estado))
      .input('codigoPostal',   sql.NVarChar(10),  String(codigoPostal))
      .input('referencias',    sql.NVarChar(300), referencias    != null ? String(referencias)    : null)
      .input('latitud',        sql.Decimal(10, 7), latitud       != null ? Number(latitud)        : null)
      .input('longitud',       sql.Decimal(10, 7), longitud      != null ? Number(longitud)       : null)
      .input('esPrincipal',    sql.Bit,           esPrincipalBit)
      .query(`
        UPDATE DireccionesCliente
        SET    Alias           = @alias,
               Calle           = @calle,
               NumeroExterior  = @numeroExterior,
               NumeroInterior  = @numeroInterior,
               Colonia         = @colonia,
               Ciudad          = @ciudad,
               Estado          = @estado,
               CodigoPostal    = @codigoPostal,
               Referencias     = @referencias,
               Latitud         = @latitud,
               Longitud        = @longitud,
               EsPrincipal     = @esPrincipal,
               FechaActualizacion = SYSDATETIME()
        WHERE  DireccionId = @direccionId
      `);

    res.json({ success: true, message: 'Dirección actualizada correctamente' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── GET /api/customers/me/payment-methods ────────────────────
export async function getPaymentMethods(req: Request, res: Response): Promise<void> {
  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    const result = await pool
      .request()
      .input('clienteId', sql.Int, cliente.ClienteId)
      .query<{
        MetodoPagoId: number; TipoPagoId: number; NombreTipo: string;
        Alias: string | null; Ultimos4Digitos: string | null;
        MarcaTarjeta: string | null; EsPrincipal: boolean;
      }>(`
        SELECT
          mpc.MetodoPagoId, mpc.TipoPagoId,
          tp.Nombre        AS NombreTipo,
          mpc.Alias,       mpc.Ultimos4Digitos,
          mpc.MarcaTarjeta, mpc.EsPrincipal
        FROM  MetodosPagoCliente mpc
        INNER JOIN TiposPago tp ON tp.TipoPagoId = mpc.TipoPagoId
        WHERE mpc.ClienteId = @clienteId AND mpc.Activo = 1
        ORDER BY mpc.EsPrincipal DESC, mpc.FechaCreacion ASC
      `);

    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── POST /api/customers/me/payment-methods ───────────────────
export async function createPaymentMethod(req: Request, res: Response): Promise<void> {
  const { tipoPagoId, alias, ultimos4Digitos, marcaTarjeta, esPrincipal } =
    req.body as Record<string, unknown>;

  if (!tipoPagoId || !Number.isInteger(Number(tipoPagoId))) {
    res.status(400).json({ success: false, message: 'El tipoPagoId es requerido' });
    return;
  }

  // Validar formato de últimos 4 dígitos si se envía
  if (ultimos4Digitos != null && !/^\d{4}$/.test(String(ultimos4Digitos))) {
    res.status(400).json({ success: false, message: 'ultimos4Digitos debe ser exactamente 4 dígitos numéricos' });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    // Validar que el tipo de pago exista y esté activo
    const tipoResult = await pool
      .request()
      .input('tipoPagoId', sql.Int, Number(tipoPagoId))
      .query('SELECT TipoPagoId FROM TiposPago WHERE TipoPagoId = @tipoPagoId AND Activo = 1');

    if (!tipoResult.recordset[0]) {
      res.status(400).json({ success: false, message: 'Tipo de pago inválido' });
      return;
    }

    const esPrincipalBit = Boolean(esPrincipal) ? 1 : 0;

    if (esPrincipalBit) {
      await pool
        .request()
        .input('clienteId', sql.Int, cliente.ClienteId)
        .query('UPDATE MetodosPagoCliente SET EsPrincipal = 0 WHERE ClienteId = @clienteId');
    }

    const insertResult = await pool
      .request()
      .input('clienteId',       sql.Int,         cliente.ClienteId)
      .input('tipoPagoId',      sql.Int,          Number(tipoPagoId))
      .input('alias',           sql.NVarChar(50),  alias           != null ? String(alias)           : null)
      .input('ultimos4',        sql.Char(4),       ultimos4Digitos != null ? String(ultimos4Digitos)  : null)
      .input('marcaTarjeta',    sql.NVarChar(30),  marcaTarjeta    != null ? String(marcaTarjeta)     : null)
      .input('esPrincipal',     sql.Bit,           esPrincipalBit)
      .query<{ MetodoPagoId: number }>(`
        INSERT INTO MetodosPagoCliente
          (ClienteId, TipoPagoId, Alias, Ultimos4Digitos, MarcaTarjeta, EsPrincipal)
        OUTPUT INSERTED.MetodoPagoId
        VALUES
          (@clienteId, @tipoPagoId, @alias, @ultimos4, @marcaTarjeta, @esPrincipal)
      `);

    res.status(201).json({
      success: true,
      message: 'Método de pago agregado correctamente',
      data: { metodoPagoId: insertResult.recordset[0].MetodoPagoId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── DELETE /api/customers/me/payment-methods/:id ─────────────
export async function deletePaymentMethod(req: Request, res: Response): Promise<void> {
  const metodoPagoId = parseInt(req.params.id, 10);
  if (isNaN(metodoPagoId)) {
    res.status(400).json({ success: false, message: 'ID de método de pago inválido' });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    const verify = await pool
      .request()
      .input('metodoPagoId', sql.Int, metodoPagoId)
      .input('clienteId',    sql.Int, cliente.ClienteId)
      .query(`
        SELECT MetodoPagoId FROM MetodosPagoCliente
        WHERE  MetodoPagoId = @metodoPagoId AND ClienteId = @clienteId AND Activo = 1
      `);

    if (!verify.recordset[0]) {
      res.status(404).json({ success: false, message: 'Método de pago no encontrado' });
      return;
    }

    await pool
      .request()
      .input('metodoPagoId', sql.Int, metodoPagoId)
      .query(`
        UPDATE MetodosPagoCliente
        SET    Activo = 0, FechaActualizacion = SYSDATETIME()
        WHERE  MetodoPagoId = @metodoPagoId
      `);

    res.json({ success: true, message: 'Método de pago eliminado correctamente' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── DELETE /api/customers/me/addresses/:id ───────────────────
export async function deleteAddress(req: Request, res: Response): Promise<void> {
  const direccionId = parseInt(req.params.id, 10);
  if (isNaN(direccionId)) {
    res.status(400).json({ success: false, message: 'ID de dirección inválido' });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    const verify = await pool
      .request()
      .input('direccionId', sql.Int, direccionId)
      .input('clienteId',   sql.Int, cliente.ClienteId)
      .query(`
        SELECT DireccionId
        FROM   DireccionesCliente
        WHERE  DireccionId = @direccionId AND ClienteId = @clienteId AND Activo = 1
      `);

    if (!verify.recordset[0]) {
      res.status(404).json({ success: false, message: 'Dirección no encontrada' });
      return;
    }

    await pool
      .request()
      .input('direccionId', sql.Int, direccionId)
      .query(`
        UPDATE DireccionesCliente
        SET    Activo = 0, FechaActualizacion = SYSDATETIME()
        WHERE  DireccionId = @direccionId
      `);

    res.json({ success: true, message: 'Dirección eliminada correctamente' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
