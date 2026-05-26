import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';
import type { EstadoPedido } from '../types/api.types';
import { ESTADOS_PEDIDO } from '../types/api.types';

// ─── GET /api/admin/orders ─────────────────────────────────────
// Lista todos los pedidos. Filtra opcionalmente por estado y restauranteId.
export async function adminGetOrders(req: Request, res: Response): Promise<void> {
  const { estado, restauranteId } = req.query as { estado?: string; restauranteId?: string };

  if (estado && !ESTADOS_PEDIDO.includes(estado as EstadoPedido)) {
    res.status(400).json({
      success: false,
      message: `Estado inválido. Valores permitidos: ${ESTADOS_PEDIDO.join(', ')}`,
    });
    return;
  }

  try {
    const pool = await getPool();

    const dbReq  = pool.request();
    const wheres = ["p.Activo = 1"];

    if (estado) {
      dbReq.input('estado', sql.NVarChar(30), estado);
      wheres.push('p.Estado = @estado');
    }
    if (restauranteId && !isNaN(Number(restauranteId))) {
      dbReq.input('restauranteId', sql.Int, Number(restauranteId));
      wheres.push('p.RestauranteId = @restauranteId');
    }

    const whereClause = wheres.join(' AND ');

    const result = await dbReq.query<{
      PedidoId: number;
      ClienteId: number;
      NombreCliente: string;
      Estado: string;
      TipoEntrega: string;
      FechaPedido: Date;
      Total: number;
      NombreRestaurante: string;
      TotalItems: number;
    }>(`
      SELECT
        p.PedidoId,
        p.ClienteId,
        c.Nombre + ' ' + c.Apellido       AS NombreCliente,
        p.Estado,
        p.TipoEntrega,
        p.FechaPedido,
        p.Total,
        r.Nombre                           AS NombreRestaurante,
        COUNT(pd.PedidoDetalleId)          AS TotalItems
      FROM       Pedidos        p
      INNER JOIN Restaurantes   r  ON r.RestauranteId = p.RestauranteId
      INNER JOIN Clientes       c  ON c.ClienteId     = p.ClienteId
      LEFT  JOIN PedidoDetalle  pd ON pd.PedidoId     = p.PedidoId
      WHERE ${whereClause}
      GROUP BY p.PedidoId, p.ClienteId, c.Nombre, c.Apellido,
               p.Estado, p.TipoEntrega, p.FechaPedido, p.Total, r.Nombre
      ORDER BY p.FechaPedido DESC
    `);

    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset.map(p => ({
        pedidoId:          p.PedidoId,
        clienteId:         p.ClienteId,
        nombreCliente:     p.NombreCliente,
        estado:            p.Estado,
        tipoEntrega:       p.TipoEntrega,
        fechaPedido:       p.FechaPedido,
        total:             Number(p.Total),
        nombreRestaurante: p.NombreRestaurante,
        totalItems:        p.TotalItems,
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

// ─── GET /api/admin/orders/:id ─────────────────────────────────
// Detalle completo de cualquier pedido (sin restricción de cliente).
export async function adminGetOrderById(req: Request, res: Response): Promise<void> {
  const pedidoId = parseInt(req.params.id, 10);
  if (isNaN(pedidoId)) {
    res.status(400).json({ success: false, message: 'ID de pedido inválido' });
    return;
  }

  try {
    const pool = await getPool();

    const pedidoResult = await pool
      .request()
      .input('pedidoId', sql.Int, pedidoId)
      .query<{
        PedidoId: number; ClienteId: number; NombreCliente: string;
        Estado: string; TipoEntrega: string; FechaPedido: Date; Notas: string | null;
        Subtotal: number; Descuento: number; CostoEnvio: number; Total: number;
        RestauranteId: number; NombreRestaurante: string;
        DireccionId: number | null; DireccionCalle: string | null;
        DireccionCiudad: string | null; DireccionCP: string | null;
        PagoId: number | null; MontoPago: number | null;
        EstadoPago: string | null; NombreTipoPago: string | null;
      }>(`
        SELECT
          p.PedidoId,    p.ClienteId,
          c.Nombre + ' ' + c.Apellido  AS NombreCliente,
          p.Estado,      p.TipoEntrega, p.FechaPedido, p.Notas,
          p.Subtotal,    p.Descuento,   p.CostoEnvio,  p.Total,
          r.RestauranteId, r.Nombre                   AS NombreRestaurante,
          d.DireccionId,   d.Calle                    AS DireccionCalle,
          d.Ciudad                                    AS DireccionCiudad,
          d.CodigoPostal                              AS DireccionCP,
          pg.PagoId,       pg.Monto                  AS MontoPago,
          pg.Estado                                   AS EstadoPago,
          tp.Nombre                                   AS NombreTipoPago
        FROM       Pedidos           p
        INNER JOIN Clientes          c  ON c.ClienteId     = p.ClienteId
        INNER JOIN Restaurantes      r  ON r.RestauranteId = p.RestauranteId
        LEFT  JOIN DireccionesCliente d  ON d.DireccionId   = p.DireccionId
        LEFT  JOIN Pagos              pg ON pg.PedidoId      = p.PedidoId
        LEFT  JOIN TiposPago          tp ON tp.TipoPagoId    = pg.TipoPagoId
        WHERE p.PedidoId = @pedidoId AND p.Activo = 1
      `);

    const pedido = pedidoResult.recordset[0];
    if (!pedido) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      return;
    }

    const itemsResult = await pool
      .request()
      .input('pedidoId', sql.Int, pedidoId)
      .query<{
        PedidoDetalleId: number; ProductoId: number; NombreProducto: string;
        TamanioId: number | null; NombreTamanio: string | null;
        Cantidad: number; PrecioUnitario: number; SubtotalItem: number; Notas: string | null;
      }>(`
        SELECT
          pd.PedidoDetalleId, pd.ProductoId,
          pr.Nombre           AS NombreProducto,
          pd.TamanioId,
          t.Nombre            AS NombreTamanio,
          pd.Cantidad,        pd.PrecioUnitario,
          pd.Subtotal         AS SubtotalItem,
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
        pedidoId:      pedido.PedidoId,
        clienteId:     pedido.ClienteId,
        nombreCliente: pedido.NombreCliente,
        estado:        pedido.Estado,
        tipoEntrega:   pedido.TipoEntrega,
        fechaPedido:   pedido.FechaPedido,
        notas:         pedido.Notas,
        restaurante: {
          restauranteId: pedido.RestauranteId,
          nombre:        pedido.NombreRestaurante,
        },
        direccion: pedido.DireccionId ? {
          direccionId: pedido.DireccionId,
          calle:       pedido.DireccionCalle,
          ciudad:      pedido.DireccionCiudad,
          codigoPostal: pedido.DireccionCP,
        } : null,
        totales: {
          subtotal:   Number(pedido.Subtotal),
          descuento:  Number(pedido.Descuento),
          costoEnvio: Number(pedido.CostoEnvio),
          total:      Number(pedido.Total),
        },
        pago: pedido.PagoId ? {
          pagoId:    pedido.PagoId,
          tipoPago:  pedido.NombreTipoPago,
          estado:    pedido.EstadoPago,
          monto:     Number(pedido.MontoPago),
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

// ─── PATCH /api/admin/orders/:id/status ───────────────────────
// Actualiza el estado de cualquier pedido. Solo estados válidos del CHECK.
export async function adminUpdateOrderStatus(req: Request, res: Response): Promise<void> {
  const pedidoId = parseInt(req.params.id, 10);
  if (isNaN(pedidoId)) {
    res.status(400).json({ success: false, message: 'ID de pedido inválido' });
    return;
  }

  const { estado } = req.body as { estado?: string };

  if (!estado || !ESTADOS_PEDIDO.includes(estado as EstadoPedido)) {
    res.status(400).json({
      success: false,
      message: `Estado inválido. Valores permitidos: ${ESTADOS_PEDIDO.join(', ')}`,
    });
    return;
  }

  try {
    const pool = await getPool();

    // Verificar que el pedido existe
    const verify = await pool
      .request()
      .input('pedidoId', sql.Int, pedidoId)
      .query<{ PedidoId: number; Estado: string }>(`
        SELECT PedidoId, Estado FROM Pedidos WHERE PedidoId = @pedidoId AND Activo = 1
      `);

    if (!verify.recordset[0]) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      return;
    }

    const estadoActual = verify.recordset[0].Estado;
    if (estadoActual === 'Cancelado' || estadoActual === 'Entregado') {
      res.status(409).json({
        success: false,
        message: `No se puede modificar un pedido en estado "${estadoActual}"`,
      });
      return;
    }

    await pool
      .request()
      .input('pedidoId', sql.Int,          pedidoId)
      .input('estado',   sql.NVarChar(30), estado)
      .query(`
        UPDATE Pedidos
        SET    Estado = @estado, FechaActualizacion = SYSDATETIME()
        WHERE  PedidoId = @pedidoId
      `);

    // Sincronizar pago si aplica
    if (estado === 'Entregado') {
      await pool
        .request()
        .input('pedidoId', sql.Int, pedidoId)
        .query(`
          UPDATE Pagos
          SET    Estado = 'Aprobado', FechaActualizacion = SYSDATETIME()
          WHERE  PedidoId = @pedidoId AND Estado = 'Pendiente'
        `);
    } else if (estado === 'Cancelado') {
      await pool
        .request()
        .input('pedidoId', sql.Int, pedidoId)
        .query(`
          UPDATE Pagos
          SET    Estado = 'Reembolsado', FechaActualizacion = SYSDATETIME()
          WHERE  PedidoId = @pedidoId AND Estado = 'Pendiente'
        `);
    }

    res.json({
      success: true,
      message: `Pedido actualizado a "${estado}" correctamente`,
      data: { pedidoId, estadoAnterior: estadoActual, estadoNuevo: estado },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
