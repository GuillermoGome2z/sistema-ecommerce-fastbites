import { Request, Response } from 'express';
import sql from 'mssql';
import { getPool } from '../config/db';
import type { Producto } from '../types/api.types';

export async function getProducts(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();
    const result = await pool.request().query<Producto>(`
      SELECT
        p.ProductoId,
        p.Nombre,
        p.Descripcion,
        p.PrecioBase,
        c.Nombre     AS Categoria,
        r.Nombre     AS Restaurante,
        p.EsDestacado,
        p.Activo,
        img.UrlImagen AS Imagen
      FROM Productos p
      INNER JOIN Categorias   c ON c.CategoriaId   = p.CategoriaId
      INNER JOIN Restaurantes r ON r.RestauranteId = p.RestauranteId
      OUTER APPLY (
        SELECT TOP 1 UrlImagen
        FROM ImagenesProducto
        WHERE ProductoId = p.ProductoId AND EsPrincipal = 1 AND Activo = 1
      ) img
      WHERE p.Activo = 1
      ORDER BY p.EsDestacado DESC, p.Nombre ASC
    `);

    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ success: false, message: 'ID de producto inválido' });
    return;
  }

  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          p.ProductoId,
          p.Nombre,
          p.Descripcion,
          p.PrecioBase,
          c.Nombre                          AS Categoria,
          p.CategoriaId,
          p.RestauranteId,
          r.Nombre                          AS Restaurante,
          p.EsDestacado,
          ISNULL(p.Calorias, 0)             AS Calorias,
          ISNULL(p.TiempoPreparacion, 0)    AS TiempoPreparacion,
          p.Activo,
          img.UrlImagen                     AS Imagen
        FROM  Productos    p
        INNER JOIN Categorias   c ON c.CategoriaId   = p.CategoriaId
        INNER JOIN Restaurantes r ON r.RestauranteId = p.RestauranteId
        OUTER APPLY (
          SELECT TOP 1 UrlImagen
          FROM ImagenesProducto
          WHERE ProductoId = p.ProductoId AND EsPrincipal = 1 AND Activo = 1
        ) img
        WHERE p.ProductoId = @id
          AND p.Activo = 1
      `);

    if (result.recordset.length === 0) {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
      return;
    }

    const producto = result.recordset[0];

    const relResult = await pool.request()
      .input('catId',  sql.Int, producto.CategoriaId)
      .input('excId',  sql.Int, id)
      .query(`
        SELECT TOP 3
          p.ProductoId,
          p.Nombre,
          p.Descripcion,
          p.PrecioBase,
          c.Nombre      AS Categoria,
          p.EsDestacado,
          img.UrlImagen AS Imagen
        FROM  Productos    p
        INNER JOIN Categorias c ON c.CategoriaId = p.CategoriaId
        OUTER APPLY (
          SELECT TOP 1 UrlImagen
          FROM ImagenesProducto
          WHERE ProductoId = p.ProductoId AND EsPrincipal = 1 AND Activo = 1
        ) img
        WHERE p.CategoriaId = @catId
          AND p.ProductoId <> @excId
          AND p.Activo = 1
        ORDER BY p.EsDestacado DESC, p.Nombre ASC
      `);

    res.json({
      success: true,
      data: {
        ...producto,
        relacionados: relResult.recordset,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
