import { Request, Response } from 'express';
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
        c.Nombre  AS Categoria,
        r.Nombre  AS Restaurante,
        p.EsDestacado,
        p.Activo
      FROM Productos p
      INNER JOIN Categorias   c ON c.CategoriaId   = p.CategoriaId
      INNER JOIN Restaurantes r ON r.RestauranteId = p.RestauranteId
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
