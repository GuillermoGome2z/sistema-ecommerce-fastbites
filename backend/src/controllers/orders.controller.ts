import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';
import type { ClienteRow, EstadoPedido, TipoEntrega } from '../types/api.types';
import { ESTADOS_PEDIDO } from '../types/api.types';

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

// ─── POST /api/orders ──────────────────────────────────────────
// Crea un pedido a partir del carrito activo. Usa transacción SQL.
export async function createOrder(req: Request, res: Response): Promise<void> {
  const {
    direccionId,
    tipoPagoId,
    metodoPagoId,
    notas,
    tipoEntrega: tipoEntregaBody,
  } = req.body as {
    direccionId?:  number;
    tipoPagoId?:   number;
    metodoPagoId?: number;
    notas?:        string;
    tipoEntrega?:  TipoEntrega;
  };

  // Validación básica
  if (!tipoPagoId || !Number.isInteger(Number(tipoPagoId))) {
    res.status(400).json({ success: false, message: 'El tipoPagoId es requerido' });
    return;
  }

  const tipoEntrega: TipoEntrega = tipoEntregaBody ?? (direccionId ? 'Domicilio' : 'Recoger');
  if (tipoEntrega === 'Domicilio' && !direccionId) {
    res.status(400).json({ success: false, message: 'Se requiere direccionId para entrega a domicilio' });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    // 1. Obtener carrito activo (más reciente)
    const carritoResult = await pool
      .request()
      .input('clienteId', sql.Int, cliente.ClienteId)
      .query<{ CarritoId: number; RestauranteId: number }>(`
        SELECT TOP 1 CarritoId, RestauranteId
        FROM   Carritos
        WHERE  ClienteId = @clienteId
        ORDER  BY COALESCE(FechaActualizacion, FechaCreacion) DESC
      `);

    const carrito = carritoResult.recordset[0];
    if (!carrito) {
      res.status(400).json({ success: false, message: 'No tienes un carrito activo' });
      return;
    }

    // 2. Obtener items del carrito con validación de productos activos
    const itemsResult = await pool
      .request()
      .input('carritoId', sql.Int, carrito.CarritoId)
      .query<{
        CarritoDetalleId: number;
        ProductoId: number;
        NombreProducto: string;
        TamanioId: number | null;
        Cantidad: number;
        PrecioUnitario: number;
        Notas: string | null;
        ProductoActivo: boolean;
      }>(`
        SELECT
          cd.CarritoDetalleId,
          cd.ProductoId,
          p.Nombre  AS NombreProducto,
          cd.TamanioId,
          cd.Cantidad,
          cd.PrecioUnitario,
          cd.Notas,
          p.Activo  AS ProductoActivo
        FROM  CarritoDetalle cd
        INNER JOIN Productos p ON p.ProductoId = cd.ProductoId
        WHERE cd.CarritoId = @carritoId
      `);

    const items = itemsResult.recordset;

    if (items.length === 0) {
      res.status(400).json({ success: false, message: 'El carrito está vacío' });
      return;
    }

    const inactivos = items.filter(i => !i.ProductoActivo);
    if (inactivos.length > 0) {
      res.status(400).json({
        success: false,
        message: `Los siguientes productos ya no están disponibles: ${inactivos.map(i => i.NombreProducto).join(', ')}`,
      });
      return;
    }

    // 3. Validar dirección
    if (direccionId) {
      const dirResult = await pool
        .request()
        .input('direccionId', sql.Int, direccionId)
        .input('clienteId',   sql.Int, cliente.ClienteId)
        .query(`
          SELECT DireccionId FROM DireccionesCliente
          WHERE  DireccionId = @direccionId AND ClienteId = @clienteId AND Activo = 1
        `);

      if (!dirResult.recordset[0]) {
        res.status(404).json({ success: false, message: 'Dirección no encontrada o no pertenece a tu cuenta' });
        return;
      }
    }

    // 4. Validar tipo de pago
    const tipoPagoResult = await pool
      .request()
      .input('tipoPagoId', sql.Int, Number(tipoPagoId))
      .query<{ TipoPagoId: number; Nombre: string }>(`
        SELECT TipoPagoId, Nombre FROM TiposPago WHERE TipoPagoId = @tipoPagoId AND Activo = 1
      `);

    if (!tipoPagoResult.recordset[0]) {
      res.status(400).json({ success: false, message: 'Tipo de pago inválido o no disponible' });
      return;
    }

    // 5. Validar método de pago (opcional)
    if (metodoPagoId) {
      const metodoResult = await pool
        .request()
        .input('metodoPagoId', sql.Int, Number(metodoPagoId))
        .input('clienteId',    sql.Int, cliente.ClienteId)
        .query(`
          SELECT MetodoPagoId FROM MetodosPagoCliente
          WHERE  MetodoPagoId = @metodoPagoId AND ClienteId = @clienteId AND Activo = 1
        `);

      if (!metodoResult.recordset[0]) {
        res.status(400).json({ success: false, message: 'Método de pago inválido o no pertenece a tu cuenta' });
        return;
      }
    }

    // 6. Calcular totales
    const subtotal   = items.reduce((acc, i) => acc + Number(i.PrecioUnitario) * i.Cantidad, 0);
    const costoEnvio = 0;   // tarifa plana — puede extenderse
    const descuento  = 0;   // sin ofertas en esta fase
    const total      = Number((subtotal + costoEnvio - descuento).toFixed(2));

    // 7. Todo validado — ejecutar transacción
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 7a. Insertar Pedido
      const pedidoResult = await new sql.Request(transaction)
        .input('clienteId',     sql.Int,          cliente.ClienteId)
        .input('restauranteId', sql.Int,           carrito.RestauranteId)
        .input('direccionId',   sql.Int,           direccionId ?? null)
        .input('subtotal',      sql.Decimal(10,2), subtotal)
        .input('descuento',     sql.Decimal(10,2), descuento)
        .input('costoEnvio',    sql.Decimal(10,2), costoEnvio)
        .input('total',         sql.Decimal(10,2), total)
        .input('tipoEntrega',   sql.NVarChar(20),  tipoEntrega)
        .input('notas',         sql.NVarChar(500), notas ?? null)
        .query<{ PedidoId: number }>(`
          INSERT INTO Pedidos
            (ClienteId, RestauranteId, DireccionId, Subtotal, Descuento, CostoEnvio, Total, Estado, TipoEntrega, Notas)
          OUTPUT INSERTED.PedidoId
          VALUES
            (@clienteId, @restauranteId, @direccionId, @subtotal, @descuento, @costoEnvio, @total, 'Pendiente', @tipoEntrega, @notas)
        `);

      const pedidoId = pedidoResult.recordset[0].PedidoId;

      // 7b. Insertar PedidoDetalle por cada item del carrito
      for (const item of items) {
        const subtotalItem = Number((Number(item.PrecioUnitario) * item.Cantidad).toFixed(2));
        await new sql.Request(transaction)
          .input('pedidoId',      sql.Int,          pedidoId)
          .input('productoId',    sql.Int,           item.ProductoId)
          .input('tamanioId',     sql.Int,           item.TamanioId)
          .input('cantidad',      sql.Int,           item.Cantidad)
          .input('precioUnit',    sql.Decimal(10,2), Number(item.PrecioUnitario))
          .input('subtotalItem',  sql.Decimal(10,2), subtotalItem)
          .input('notas',         sql.NVarChar(300), item.Notas)
          .query(`
            INSERT INTO PedidoDetalle (PedidoId, ProductoId, TamanioId, Cantidad, PrecioUnitario, Subtotal, Notas)
            VALUES (@pedidoId, @productoId, @tamanioId, @cantidad, @precioUnit, @subtotalItem, @notas)
          `);
      }

      // 7c. Insertar Pago
      const pagoResult = await new sql.Request(transaction)
        .input('pedidoId',     sql.Int,          pedidoId)
        .input('tipoPagoId',   sql.Int,           Number(tipoPagoId))
        .input('metodoPagoId', sql.Int,           metodoPagoId ?? null)
        .input('monto',        sql.Decimal(10,2), total)
        .query<{ PagoId: number }>(`
          INSERT INTO Pagos (PedidoId, TipoPagoId, MetodoPagoId, Monto, Estado)
          OUTPUT INSERTED.PagoId
          VALUES (@pedidoId, @tipoPagoId, @metodoPagoId, @monto, 'Pendiente')
        `);

      const pagoId = pagoResult.recordset[0].PagoId;

      // 7d. Limpiar carrito
      await new sql.Request(transaction)
        .input('carritoId', sql.Int, carrito.CarritoId)
        .query('DELETE FROM CarritoDetalle WHERE CarritoId = @carritoId');

      await new sql.Request(transaction)
        .input('carritoId', sql.Int, carrito.CarritoId)
        .query('DELETE FROM Carritos WHERE CarritoId = @carritoId');

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Pedido creado correctamente',
        data: {
          pedidoId,
          pagoId,
          estado: 'Pendiente' as EstadoPedido,
          estadoPago: 'Pendiente',
          subtotal:   Number(subtotal.toFixed(2)),
          costoEnvio,
          descuento,
          total,
          totalItems: items.reduce((acc, i) => acc + i.Cantidad, 0),
        },
      });

    } catch (txError) {
      await transaction.rollback();
      throw txError;
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── GET /api/orders ───────────────────────────────────────────
// Historial de pedidos del cliente autenticado.
export async function getOrders(req: Request, res: Response): Promise<void> {
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
        PedidoId: number;
        Estado: EstadoPedido;
        TipoEntrega: TipoEntrega;
        FechaPedido: Date;
        Subtotal: number;
        Descuento: number;
        CostoEnvio: number;
        Total: number;
        NombreRestaurante: string;
        TotalItems: number;
      }>(`
        SELECT
          p.PedidoId,
          p.Estado,
          p.TipoEntrega,
          p.FechaPedido,
          p.Subtotal,
          p.Descuento,
          p.CostoEnvio,
          p.Total,
          r.Nombre                         AS NombreRestaurante,
          COUNT(pd.PedidoDetalleId)        AS TotalItems
        FROM      Pedidos        p
        INNER JOIN Restaurantes  r  ON r.RestauranteId = p.RestauranteId
        LEFT  JOIN PedidoDetalle pd ON pd.PedidoId     = p.PedidoId
        WHERE p.ClienteId = @clienteId AND p.Activo = 1
        GROUP BY p.PedidoId, p.Estado, p.TipoEntrega, p.FechaPedido,
                 p.Subtotal, p.Descuento, p.CostoEnvio, p.Total, r.Nombre
        ORDER BY p.FechaPedido DESC
      `);

    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset.map(p => ({
        pedidoId:          p.PedidoId,
        estado:            p.Estado,
        tipoEntrega:       p.TipoEntrega,
        fechaPedido:       p.FechaPedido,
        nombreRestaurante: p.NombreRestaurante,
        totalItems:        p.TotalItems,
        subtotal:          Number(p.Subtotal),
        descuento:         Number(p.Descuento),
        costoEnvio:        Number(p.CostoEnvio),
        total:             Number(p.Total),
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── GET /api/orders/:id ───────────────────────────────────────
// Detalle completo de un pedido del cliente autenticado.
export async function getOrderById(req: Request, res: Response): Promise<void> {
  const pedidoId = parseInt(req.params.id, 10);
  if (isNaN(pedidoId)) {
    res.status(400).json({ success: false, message: 'ID de pedido inválido' });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    // Cabecera del pedido + restaurante + dirección + pago
    const pedidoResult = await pool
      .request()
      .input('pedidoId',  sql.Int, pedidoId)
      .input('clienteId', sql.Int, cliente.ClienteId)
      .query<{
        PedidoId: number; Estado: string; TipoEntrega: string;
        FechaPedido: Date; Notas: string | null;
        Subtotal: number; Descuento: number; CostoEnvio: number; Total: number;
        RestauranteId: number; NombreRestaurante: string;
        DireccionId: number | null; DireccionAlias: string | null;
        DireccionCalle: string | null; DireccionNumExt: string | null;
        DireccionColonia: string | null; DireccionCiudad: string | null;
        DireccionEstado: string | null; DireccionCP: string | null;
        PagoId: number | null; MontoPago: number | null;
        EstadoPago: string | null; FechaPago: Date | null;
        NombreTipoPago: string | null;
      }>(`
        SELECT
          p.PedidoId, p.Estado, p.TipoEntrega, p.FechaPedido, p.Notas,
          p.Subtotal, p.Descuento, p.CostoEnvio, p.Total,
          r.RestauranteId,  r.Nombre          AS NombreRestaurante,
          d.DireccionId,    d.Alias           AS DireccionAlias,
          d.Calle           AS DireccionCalle, d.NumeroExterior AS DireccionNumExt,
          d.Colonia         AS DireccionColonia,
          d.Ciudad          AS DireccionCiudad, d.Estado         AS DireccionEstado,
          d.CodigoPostal    AS DireccionCP,
          pg.PagoId,        pg.Monto          AS MontoPago,
          pg.Estado         AS EstadoPago,     pg.FechaPago,
          tp.Nombre         AS NombreTipoPago
        FROM       Pedidos           p
        INNER JOIN Restaurantes      r  ON r.RestauranteId = p.RestauranteId
        LEFT  JOIN DireccionesCliente d  ON d.DireccionId   = p.DireccionId
        LEFT  JOIN Pagos              pg ON pg.PedidoId      = p.PedidoId
        LEFT  JOIN TiposPago          tp ON tp.TipoPagoId    = pg.TipoPagoId
        WHERE p.PedidoId = @pedidoId AND p.ClienteId = @clienteId AND p.Activo = 1
      `);

    const pedido = pedidoResult.recordset[0];
    if (!pedido) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      return;
    }

    // Items del pedido
    const itemsResult = await pool
      .request()
      .input('pedidoId', sql.Int, pedidoId)
      .query<{
        PedidoDetalleId: number; ProductoId: number; NombreProducto: string;
        TamanioId: number | null; NombreTamanio: string | null;
        Cantidad: number; PrecioUnitario: number; SubtotalItem: number; Notas: string | null;
      }>(`
        SELECT
          pd.PedidoDetalleId,
          pd.ProductoId,
          pr.Nombre                AS NombreProducto,
          pd.TamanioId,
          t.Nombre                 AS NombreTamanio,
          pd.Cantidad,
          pd.PrecioUnitario,
          pd.Subtotal              AS SubtotalItem,
          pd.Notas
        FROM  PedidoDetalle      pd
        INNER JOIN Productos         pr ON pr.ProductoId = pd.ProductoId
        LEFT  JOIN TamaniosProducto  t  ON t.TamanioId   = pd.TamanioId
        WHERE pd.PedidoId = @pedidoId
        ORDER BY pd.PedidoDetalleId ASC
      `);

    res.json({
      success: true,
      data: {
        pedidoId:    pedido.PedidoId,
        estado:      pedido.Estado,
        tipoEntrega: pedido.TipoEntrega,
        fechaPedido: pedido.FechaPedido,
        notas:       pedido.Notas,
        restaurante: {
          restauranteId: pedido.RestauranteId,
          nombre:        pedido.NombreRestaurante,
        },
        direccion: pedido.DireccionId ? {
          direccionId: pedido.DireccionId,
          alias:       pedido.DireccionAlias,
          calle:       pedido.DireccionCalle,
          numeroExt:   pedido.DireccionNumExt,
          colonia:     pedido.DireccionColonia,
          ciudad:      pedido.DireccionCiudad,
          estado:      pedido.DireccionEstado,
          codigoPostal: pedido.DireccionCP,
        } : null,
        totales: {
          subtotal:   Number(pedido.Subtotal),
          descuento:  Number(pedido.Descuento),
          costoEnvio: Number(pedido.CostoEnvio),
          total:      Number(pedido.Total),
        },
        pago: pedido.PagoId ? {
          pagoId:      pedido.PagoId,
          tipoPago:    pedido.NombreTipoPago,
          estado:      pedido.EstadoPago,
          monto:       Number(pedido.MontoPago),
          fechaPago:   pedido.FechaPago,
        } : null,
        items: itemsResult.recordset.map(i => ({
          pedidoDetalleId: i.PedidoDetalleId,
          productoId:      i.ProductoId,
          nombreProducto:  i.NombreProducto,
          tamanioId:       i.TamanioId,
          nombreTamanio:   i.NombreTamanio,
          cantidad:        i.Cantidad,
          precioUnitario:  Number(i.PrecioUnitario),
          subtotalItem:    Number(i.SubtotalItem),
          notas:           i.Notas,
        })),
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

// ─── PATCH /api/orders/:id/cancel ─────────────────────────────
// Cancela un pedido solo si está en estado Pendiente o Confirmado.
export async function cancelOrder(req: Request, res: Response): Promise<void> {
  const pedidoId = parseInt(req.params.id, 10);
  if (isNaN(pedidoId)) {
    res.status(400).json({ success: false, message: 'ID de pedido inválido' });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    // Obtener el pedido para verificar estado actual
    const pedidoResult = await pool
      .request()
      .input('pedidoId',  sql.Int, pedidoId)
      .input('clienteId', sql.Int, cliente.ClienteId)
      .query<{ PedidoId: number; Estado: EstadoPedido }>(`
        SELECT PedidoId, Estado FROM Pedidos
        WHERE  PedidoId = @pedidoId AND ClienteId = @clienteId AND Activo = 1
      `);

    const pedido = pedidoResult.recordset[0];

    if (!pedido) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      return;
    }

    const cancelables: EstadoPedido[] = ['Pendiente', 'Confirmado'];
    if (!cancelables.includes(pedido.Estado)) {
      res.status(409).json({
        success: false,
        message: `No es posible cancelar un pedido en estado "${pedido.Estado}". Solo se pueden cancelar pedidos Pendientes o Confirmados.`,
      });
      return;
    }

    await pool
      .request()
      .input('pedidoId', sql.Int, pedidoId)
      .query(`
        UPDATE Pedidos
        SET    Estado = 'Cancelado', FechaActualizacion = SYSDATETIME()
        WHERE  PedidoId = @pedidoId
      `);

    // Marcar el pago como Reembolsado si estaba Pendiente
    await pool
      .request()
      .input('pedidoId', sql.Int, pedidoId)
      .query(`
        UPDATE Pagos
        SET    Estado = 'Reembolsado', FechaActualizacion = SYSDATETIME()
        WHERE  PedidoId = @pedidoId AND Estado = 'Pendiente'
      `);

    res.json({ success: true, message: 'Pedido cancelado correctamente' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── Validar que los estados del pedido son válidos ────────────
// Re-exportado para uso en admin controller
export { ESTADOS_PEDIDO };
