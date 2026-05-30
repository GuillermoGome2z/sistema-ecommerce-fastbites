import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';

export async function adminGetAllProducts(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        p.ProductoId         AS id,
        p.Nombre             AS nombre,
        ISNULL(p.Descripcion, '') AS descripcion,
        CAST(p.PrecioBase AS FLOAT) AS precioBase,
        c.Nombre             AS categoria,
        p.CategoriaId        AS categoriaId,
        p.RestauranteId      AS restauranteId,
        r.Nombre             AS restaurante,
        ISNULL(
          (SELECT TOP 1 UrlImagen FROM ImagenesProducto
           WHERE ProductoId = p.ProductoId AND Activo = 1
           ORDER BY EsPrincipal DESC, Orden ASC),
          ''
        )                    AS imagen,
        p.Activo             AS activo,
        p.EsDestacado        AS esDestacado,
        ISNULL(p.Calorias, 0)          AS calorias,
        ISNULL(p.TiempoPreparacion, 0) AS tiempoPreparacion
      FROM Productos p
      INNER JOIN Categorias   c ON c.CategoriaId   = p.CategoriaId
      INNER JOIN Restaurantes r ON r.RestauranteId = p.RestauranteId
      ORDER BY p.Nombre ASC
    `);

    res.json({ success: true, total: result.recordset.length, data: result.recordset });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

export async function adminGetCategories(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT CategoriaId AS id, Nombre AS nombre
      FROM Categorias WHERE Activo = 1 ORDER BY Orden ASC, Nombre ASC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener categorías', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}

export async function adminCreateProduct(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, precioBase, categoria, restauranteId, esDestacado, activo, calorias, tiempoPreparacion, imagen } = req.body as {
    nombre: string; descripcion?: string; precioBase: number; categoria: string;
    restauranteId: number; esDestacado?: boolean; activo?: boolean;
    calorias?: number; tiempoPreparacion?: number; imagen?: string;
  };

  if (!nombre || !precioBase || !categoria || !restauranteId) {
    res.status(400).json({ success: false, message: 'nombre, precioBase, categoria y restauranteId son requeridos' });
    return;
  }

  try {
    const pool = await getPool();

    const catResult = await pool.request()
      .input('nombre', sql.NVarChar(80), categoria)
      .query<{ CategoriaId: number }>(`SELECT CategoriaId FROM Categorias WHERE Nombre = @nombre AND Activo = 1`);

    if (!catResult.recordset[0]) {
      res.status(400).json({ success: false, message: `Categoría "${categoria}" no encontrada` });
      return;
    }
    const categoriaId = catResult.recordset[0].CategoriaId;

    const insertResult = await pool.request()
      .input('restauranteId',      sql.Int,          Number(restauranteId))
      .input('categoriaId',        sql.Int,          categoriaId)
      .input('nombre',             sql.NVarChar(150), nombre)
      .input('descripcion',        sql.NVarChar(500), descripcion ?? null)
      .input('precioBase',         sql.Decimal(10,2), Number(precioBase))
      .input('calorias',           sql.Int,           calorias ? Number(calorias) : null)
      .input('tiempoPreparacion',  sql.Int,           tiempoPreparacion ? Number(tiempoPreparacion) : null)
      .input('esDestacado',        sql.Bit,           esDestacado ? 1 : 0)
      .input('activo',             sql.Bit,           activo !== false ? 1 : 0)
      .query<{ ProductoId: number }>(`
        INSERT INTO Productos (RestauranteId, CategoriaId, Nombre, Descripcion, PrecioBase, Calorias, TiempoPreparacion, EsDestacado, Activo)
        OUTPUT INSERTED.ProductoId
        VALUES (@restauranteId, @categoriaId, @nombre, @descripcion, @precioBase, @calorias, @tiempoPreparacion, @esDestacado, @activo)
      `);

    const newId = insertResult.recordset[0].ProductoId;

    if (imagen?.trim()) {
      await pool.request()
        .input('productoId', sql.Int, newId)
        .input('urlImagen',  sql.NVarChar(500), imagen.trim())
        .query(`
          INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
          VALUES (@productoId, @urlImagen, 1, 1, 1)
        `);
    }

    res.status(201).json({ success: true, data: { id: newId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear producto', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}

export async function adminUpdateProduct(req: Request, res: Response): Promise<void> {
  const productoId = parseInt(req.params.id, 10);
  if (isNaN(productoId)) { res.status(400).json({ success: false, message: 'ID inválido' }); return; }

  const { nombre, descripcion, precioBase, categoria, restauranteId, esDestacado, activo, calorias, tiempoPreparacion, imagen } = req.body as {
    nombre: string; descripcion?: string; precioBase: number; categoria: string;
    restauranteId: number; esDestacado?: boolean; activo?: boolean;
    calorias?: number; tiempoPreparacion?: number; imagen?: string;
  };

  try {
    const pool = await getPool();

    const catResult = await pool.request()
      .input('nombre', sql.NVarChar(80), categoria)
      .query<{ CategoriaId: number }>(`SELECT CategoriaId FROM Categorias WHERE Nombre = @nombre AND Activo = 1`);

    if (!catResult.recordset[0]) {
      res.status(400).json({ success: false, message: `Categoría "${categoria}" no encontrada` });
      return;
    }
    const categoriaId = catResult.recordset[0].CategoriaId;

    await pool.request()
      .input('productoId',         sql.Int,           productoId)
      .input('restauranteId',      sql.Int,           Number(restauranteId))
      .input('categoriaId',        sql.Int,           categoriaId)
      .input('nombre',             sql.NVarChar(150), nombre)
      .input('descripcion',        sql.NVarChar(500), descripcion ?? null)
      .input('precioBase',         sql.Decimal(10,2), Number(precioBase))
      .input('calorias',           sql.Int,           calorias ? Number(calorias) : null)
      .input('tiempoPreparacion',  sql.Int,           tiempoPreparacion ? Number(tiempoPreparacion) : null)
      .input('esDestacado',        sql.Bit,           esDestacado ? 1 : 0)
      .input('activo',             sql.Bit,           activo !== false ? 1 : 0)
      .query(`
        UPDATE Productos
        SET RestauranteId = @restauranteId, CategoriaId = @categoriaId, Nombre = @nombre,
            Descripcion = @descripcion, PrecioBase = @precioBase, Calorias = @calorias,
            TiempoPreparacion = @tiempoPreparacion, EsDestacado = @esDestacado,
            Activo = @activo, FechaActualizacion = SYSDATETIME()
        WHERE ProductoId = @productoId
      `);

    if (imagen?.trim()) {
      await pool.request()
        .input('productoId', sql.Int, productoId)
        .input('urlImagen',  sql.NVarChar(500), imagen.trim())
        .query(`
          IF EXISTS (
            SELECT 1 FROM ImagenesProducto
            WHERE ProductoId = @productoId AND EsPrincipal = 1 AND Activo = 1
          )
            BEGIN
              UPDATE ImagenesProducto
              SET UrlImagen = @urlImagen
              WHERE ProductoId = @productoId AND EsPrincipal = 1 AND Activo = 1
            END
          ELSE
            BEGIN
              INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
              VALUES (@productoId, @urlImagen, 1, 1, 1)
            END
        `);
    }

    res.json({ success: true, message: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar producto', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}

export async function adminToggleProduct(req: Request, res: Response): Promise<void> {
  const productoId = parseInt(req.params.id, 10);
  if (isNaN(productoId)) { res.status(400).json({ success: false, message: 'ID inválido' }); return; }

  try {
    const pool = await getPool();
    await pool.request()
      .input('productoId', sql.Int, productoId)
      .query(`
        UPDATE Productos
        SET Activo = CASE WHEN Activo = 1 THEN 0 ELSE 1 END,
            FechaActualizacion = SYSDATETIME()
        WHERE ProductoId = @productoId
      `);
    res.json({ success: true, message: 'Estado del producto actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cambiar estado', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}
