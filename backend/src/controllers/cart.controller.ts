import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';
import type { ClienteRow } from '../types/api.types';

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

// ─── GET /api/cart ─────────────────────────────────────────────
// Devuelve el carrito más reciente del cliente (con items).
export async function getCart(req: Request, res: Response): Promise<void> {
  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    // Buscar el carrito más reciente del cliente
    const carritoResult = await pool
      .request()
      .input('clienteId', sql.Int, cliente.ClienteId)
      .query<{ CarritoId: number; ClienteId: number; RestauranteId: number; NombreRestaurante: string }>(`
        SELECT TOP 1
          c.CarritoId, c.ClienteId, c.RestauranteId,
          r.Nombre AS NombreRestaurante
        FROM   Carritos c
        INNER  JOIN Restaurantes r ON r.RestauranteId = c.RestauranteId
        WHERE  c.ClienteId = @clienteId
        ORDER  BY COALESCE(c.FechaActualizacion, c.FechaCreacion) DESC
      `);

    const carrito = carritoResult.recordset[0];

    // Sin carrito activo — respuesta vacía válida
    if (!carrito) {
      res.json({
        success: true,
        data: {
          carritoId:    null,
          clienteId:    cliente.ClienteId,
          restauranteId: null,
          nombreRestaurante: null,
          items:       [],
          subtotal:    0,
          totalItems:  0,
        },
      });
      return;
    }

    // Obtener items del carrito
    const itemsResult = await pool
      .request()
      .input('carritoId', sql.Int, carrito.CarritoId)
      .query<{
        CarritoDetalleId: number;
        ProductoId: number;
        NombreProducto: string;
        TamanioId: number | null;
        NombreTamanio: string | null;
        Cantidad: number;
        PrecioUnitario: number;
        SubtotalItem: number;
        Notas: string | null;
      }>(`
        SELECT
          cd.CarritoDetalleId,
          cd.ProductoId,
          p.Nombre                                           AS NombreProducto,
          cd.TamanioId,
          t.Nombre                                           AS NombreTamanio,
          cd.Cantidad,
          cd.PrecioUnitario,
          CAST(cd.Cantidad * cd.PrecioUnitario AS DECIMAL(10,2)) AS SubtotalItem,
          cd.Notas
        FROM  CarritoDetalle cd
        INNER JOIN Productos         p ON p.ProductoId = cd.ProductoId
        LEFT  JOIN TamaniosProducto  t ON t.TamanioId  = cd.TamanioId
        WHERE cd.CarritoId = @carritoId
        ORDER BY cd.CarritoDetalleId ASC
      `);

    const items       = itemsResult.recordset;
    const subtotal    = items.reduce((acc, i) => acc + Number(i.SubtotalItem), 0);
    const totalItems  = items.reduce((acc, i) => acc + i.Cantidad, 0);

    res.json({
      success: true,
      data: {
        carritoId:         carrito.CarritoId,
        clienteId:         carrito.ClienteId,
        restauranteId:     carrito.RestauranteId,
        nombreRestaurante: carrito.NombreRestaurante,
        items: items.map(i => ({
          carritoDetalleId: i.CarritoDetalleId,
          productoId:       i.ProductoId,
          nombreProducto:   i.NombreProducto,
          tamanioId:        i.TamanioId,
          nombreTamanio:    i.NombreTamanio,
          cantidad:         i.Cantidad,
          precioUnitario:   Number(i.PrecioUnitario),
          subtotalItem:     Number(i.SubtotalItem),
          notas:            i.Notas,
        })),
        subtotal:   Number(subtotal.toFixed(2)),
        totalItems,
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

// ─── POST /api/cart/items ──────────────────────────────────────
// Agrega un producto al carrito. Crea el carrito si no existe.
// El restaurante se determina automáticamente desde el producto.
export async function addItem(req: Request, res: Response): Promise<void> {
  const productoId = Number(req.body.productoId);
  const cantidad   = Number(req.body.cantidad);
  const tamanioId  = req.body.tamanioId != null ? Number(req.body.tamanioId) : null;
  const notas      = req.body.notas      != null ? String(req.body.notas)    : null;

  if (!Number.isInteger(productoId) || productoId < 1) {
    res.status(400).json({ success: false, message: 'El productoId es requerido y debe ser un entero positivo' });
    return;
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    res.status(400).json({ success: false, message: 'La cantidad debe ser un entero mayor a 0' });
    return;
  }
  if (tamanioId !== null && (!Number.isInteger(tamanioId) || tamanioId < 1)) {
    res.status(400).json({ success: false, message: 'El tamanioId debe ser un entero positivo' });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    // 1. Validar que el producto exista y esté activo
    const productoResult = await pool
      .request()
      .input('productoId', sql.Int, productoId)
      .query<{ ProductoId: number; Nombre: string; PrecioBase: number; RestauranteId: number }>(`
        SELECT ProductoId, Nombre, PrecioBase, RestauranteId
        FROM   Productos
        WHERE  ProductoId = @productoId AND Activo = 1
      `);

    const producto = productoResult.recordset[0];
    if (!producto) {
      res.status(404).json({ success: false, message: 'Producto no encontrado o no disponible' });
      return;
    }

    // 2. Calcular precio unitario (base + adicional por tamaño)
    let precioUnitario = Number(producto.PrecioBase);

    if (tamanioId !== null) {
      const tamanioResult = await pool
        .request()
        .input('productoId', sql.Int, productoId)
        .input('tamanioId',  sql.Int, tamanioId)
        .query<{ PrecioAdicional: number }>(`
          SELECT PrecioAdicional
          FROM   ProductoTamanio
          WHERE  ProductoId = @productoId AND TamanioId = @tamanioId AND Activo = 1
        `);

      if (!tamanioResult.recordset[0]) {
        res.status(400).json({ success: false, message: 'El tamaño seleccionado no está disponible para este producto' });
        return;
      }

      precioUnitario += Number(tamanioResult.recordset[0].PrecioAdicional);
    }

    // 3. Buscar el carrito más reciente de este cliente
    const carritoResult = await pool
      .request()
      .input('clienteId', sql.Int, cliente.ClienteId)
      .query<{ CarritoId: number; RestauranteId: number }>(`
        SELECT TOP 1 CarritoId, RestauranteId
        FROM   Carritos
        WHERE  ClienteId = @clienteId
        ORDER  BY COALESCE(FechaActualizacion, FechaCreacion) DESC
      `);

    let carritoId: number;
    const carritoActual = carritoResult.recordset[0];

    if (carritoActual) {
      // El carrito es de otro restaurante — conflicto
      if (carritoActual.RestauranteId !== producto.RestauranteId) {
        res.status(409).json({
          success: false,
          message: 'Ya tienes un carrito activo de otro restaurante. Vacía el carrito antes de agregar productos de un restaurante diferente.',
        });
        return;
      }
      carritoId = carritoActual.CarritoId;
    } else {
      // Crear nuevo carrito para este cliente y restaurante
      const nuevoCarrito = await pool
        .request()
        .input('clienteId',     sql.Int, cliente.ClienteId)
        .input('restauranteId', sql.Int, producto.RestauranteId)
        .query<{ CarritoId: number }>(`
          INSERT INTO Carritos (ClienteId, RestauranteId)
          OUTPUT INSERTED.CarritoId
          VALUES (@clienteId, @restauranteId)
        `);

      carritoId = nuevoCarrito.recordset[0].CarritoId;
    }

    // 4. Insertar ítem en CarritoDetalle
    const detalleResult = await pool
      .request()
      .input('carritoId',      sql.Int,           carritoId)
      .input('productoId',     sql.Int,           productoId)
      .input('tamanioId',      sql.Int,           tamanioId)
      .input('cantidad',       sql.Int,           cantidad)
      .input('precioUnitario', sql.Decimal(10, 2), precioUnitario)
      .input('notas',          sql.NVarChar(300), notas)
      .query<{ CarritoDetalleId: number }>(`
        INSERT INTO CarritoDetalle (CarritoId, ProductoId, TamanioId, Cantidad, PrecioUnitario, Notas)
        OUTPUT INSERTED.CarritoDetalleId
        VALUES (@carritoId, @productoId, @tamanioId, @cantidad, @precioUnitario, @notas)
      `);

    // Actualizar timestamp del carrito
    await pool
      .request()
      .input('carritoId', sql.Int, carritoId)
      .query('UPDATE Carritos SET FechaActualizacion = SYSDATETIME() WHERE CarritoId = @carritoId');

    res.status(201).json({
      success: true,
      message: 'Producto agregado al carrito',
      data: {
        carritoDetalleId: detalleResult.recordset[0].CarritoDetalleId,
        carritoId,
        productoId,
        cantidad,
        precioUnitario:   Number(precioUnitario.toFixed(2)),
        subtotalItem:     Number((precioUnitario * cantidad).toFixed(2)),
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

// ─── PATCH /api/cart/items/:id ─────────────────────────────────
// Actualiza cantidad y/o notas de un ítem del carrito.
export async function updateItem(req: Request, res: Response): Promise<void> {
  const detalleId = parseInt(req.params.id, 10);
  if (isNaN(detalleId)) {
    res.status(400).json({ success: false, message: 'ID de ítem inválido' });
    return;
  }

  const hasCantidad = Object.prototype.hasOwnProperty.call(req.body, 'cantidad');
  const hasNotas    = Object.prototype.hasOwnProperty.call(req.body, 'notas');

  if (!hasCantidad && !hasNotas) {
    res.status(400).json({ success: false, message: 'Debe enviar al menos: cantidad o notas' });
    return;
  }

  const cantidad = hasCantidad ? Number(req.body.cantidad) : undefined;
  if (cantidad !== undefined && (!Number.isInteger(cantidad) || cantidad < 1)) {
    res.status(400).json({ success: false, message: 'La cantidad debe ser un entero mayor a 0' });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    // Verificar que el ítem pertenece al carrito de este cliente
    const verify = await pool
      .request()
      .input('detalleId', sql.Int, detalleId)
      .input('clienteId', sql.Int, cliente.ClienteId)
      .query<{ CarritoDetalleId: number; CarritoId: number }>(`
        SELECT cd.CarritoDetalleId, cd.CarritoId
        FROM   CarritoDetalle cd
        INNER  JOIN Carritos c ON c.CarritoId = cd.CarritoId
        WHERE  cd.CarritoDetalleId = @detalleId AND c.ClienteId = @clienteId
      `);

    if (!verify.recordset[0]) {
      res.status(404).json({ success: false, message: 'Ítem no encontrado' });
      return;
    }

    // Construir UPDATE dinámico solo con los campos enviados
    const dbReq    = pool.request().input('detalleId', sql.Int, detalleId);
    const setParts: string[] = [];

    if (cantidad !== undefined) {
      dbReq.input('cantidad', sql.Int, cantidad);
      setParts.push('Cantidad = @cantidad');
    }
    if (hasNotas) {
      dbReq.input('notas', sql.NVarChar(300), req.body.notas != null ? String(req.body.notas) : null);
      setParts.push('Notas = @notas');
    }

    await dbReq.query(`UPDATE CarritoDetalle SET ${setParts.join(', ')} WHERE CarritoDetalleId = @detalleId`);

    // Actualizar timestamp del carrito
    const carritoId = verify.recordset[0].CarritoId;
    await pool
      .request()
      .input('carritoId', sql.Int, carritoId)
      .query('UPDATE Carritos SET FechaActualizacion = SYSDATETIME() WHERE CarritoId = @carritoId');

    res.json({ success: true, message: 'Ítem actualizado correctamente' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── DELETE /api/cart/items/:id ────────────────────────────────
// Elimina un ítem específico del carrito.
export async function removeItem(req: Request, res: Response): Promise<void> {
  const detalleId = parseInt(req.params.id, 10);
  if (isNaN(detalleId)) {
    res.status(400).json({ success: false, message: 'ID de ítem inválido' });
    return;
  }

  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    // Verificar propiedad del ítem
    const verify = await pool
      .request()
      .input('detalleId', sql.Int, detalleId)
      .input('clienteId', sql.Int, cliente.ClienteId)
      .query<{ CarritoDetalleId: number; CarritoId: number }>(`
        SELECT cd.CarritoDetalleId, cd.CarritoId
        FROM   CarritoDetalle cd
        INNER  JOIN Carritos c ON c.CarritoId = cd.CarritoId
        WHERE  cd.CarritoDetalleId = @detalleId AND c.ClienteId = @clienteId
      `);

    if (!verify.recordset[0]) {
      res.status(404).json({ success: false, message: 'Ítem no encontrado' });
      return;
    }

    await pool
      .request()
      .input('detalleId', sql.Int, detalleId)
      .query('DELETE FROM CarritoDetalle WHERE CarritoDetalleId = @detalleId');

    // Actualizar timestamp del carrito
    const carritoId = verify.recordset[0].CarritoId;
    await pool
      .request()
      .input('carritoId', sql.Int, carritoId)
      .query('UPDATE Carritos SET FechaActualizacion = SYSDATETIME() WHERE CarritoId = @carritoId');

    res.json({ success: true, message: 'Ítem eliminado del carrito' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── DELETE /api/cart ──────────────────────────────────────────
// Vacía completamente el carrito activo del cliente.
export async function clearCart(req: Request, res: Response): Promise<void> {
  try {
    const pool    = await getPool();
    const cliente = await getClienteByUsuarioId(pool, req.user!.usuarioId);

    if (!cliente) {
      res.status(404).json({ success: false, message: 'Perfil de cliente no encontrado' });
      return;
    }

    // Buscar el carrito más reciente
    const carritoResult = await pool
      .request()
      .input('clienteId', sql.Int, cliente.ClienteId)
      .query<{ CarritoId: number }>(`
        SELECT TOP 1 CarritoId
        FROM   Carritos
        WHERE  ClienteId = @clienteId
        ORDER  BY COALESCE(FechaActualizacion, FechaCreacion) DESC
      `);

    const carrito = carritoResult.recordset[0];

    if (!carrito) {
      res.status(404).json({ success: false, message: 'No hay carrito activo para vaciar' });
      return;
    }

    // Eliminar items primero (no hay CASCADE en el esquema)
    await pool
      .request()
      .input('carritoId', sql.Int, carrito.CarritoId)
      .query('DELETE FROM CarritoDetalle WHERE CarritoId = @carritoId');

    // Eliminar el carrito
    await pool
      .request()
      .input('carritoId', sql.Int, carrito.CarritoId)
      .query('DELETE FROM Carritos WHERE CarritoId = @carritoId');

    res.json({ success: true, message: 'Carrito vaciado correctamente' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
