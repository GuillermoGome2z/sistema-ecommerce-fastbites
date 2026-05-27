import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';

export async function adminGetAllRestaurants(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        r.RestauranteId      AS id,
        r.Nombre             AS nombre,
        r.Direccion          AS direccion,
        r.Ciudad             AS ciudad,
        ISNULL(r.Telefono, '') AS telefono,
        r.Activo             AS activo,
        COUNT(p.ProductoId)  AS totalProductos
      FROM Restaurantes r
      LEFT JOIN Productos p ON p.RestauranteId = r.RestauranteId AND p.Activo = 1
      GROUP BY r.RestauranteId, r.Nombre, r.Direccion, r.Ciudad, r.Telefono, r.Activo
      ORDER BY r.Nombre ASC
    `);

    res.json({ success: true, total: result.recordset.length, data: result.recordset });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener restaurantes',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

export async function adminCreateRestaurant(req: Request, res: Response): Promise<void> {
  const { nombre, direccion, ciudad, telefono, activo } = req.body as {
    nombre: string; direccion: string; ciudad: string; telefono?: string; activo?: boolean;
  };

  if (!nombre || !direccion || !ciudad) {
    res.status(400).json({ success: false, message: 'nombre, direccion y ciudad son requeridos' });
    return;
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('nombre',    sql.NVarChar(100), nombre)
      .input('direccion', sql.NVarChar(300), direccion)
      .input('ciudad',    sql.NVarChar(100), ciudad)
      .input('telefono',  sql.NVarChar(20),  telefono ?? null)
      .input('activo',    sql.Bit,           activo !== false ? 1 : 0)
      .query<{ RestauranteId: number }>(`
        INSERT INTO Restaurantes (Nombre, Direccion, Ciudad, Telefono, Activo)
        OUTPUT INSERTED.RestauranteId
        VALUES (@nombre, @direccion, @ciudad, @telefono, @activo)
      `);

    res.status(201).json({ success: true, data: { id: result.recordset[0].RestauranteId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear restaurante', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}

export async function adminUpdateRestaurant(req: Request, res: Response): Promise<void> {
  const restauranteId = parseInt(req.params.id, 10);
  if (isNaN(restauranteId)) { res.status(400).json({ success: false, message: 'ID inválido' }); return; }

  const { nombre, direccion, ciudad, telefono, activo } = req.body as {
    nombre: string; direccion: string; ciudad: string; telefono?: string; activo?: boolean;
  };

  try {
    const pool = await getPool();
    await pool.request()
      .input('restauranteId', sql.Int,          restauranteId)
      .input('nombre',        sql.NVarChar(100), nombre)
      .input('direccion',     sql.NVarChar(300), direccion)
      .input('ciudad',        sql.NVarChar(100), ciudad)
      .input('telefono',      sql.NVarChar(20),  telefono ?? null)
      .input('activo',        sql.Bit,           activo !== false ? 1 : 0)
      .query(`
        UPDATE Restaurantes
        SET Nombre = @nombre, Direccion = @direccion, Ciudad = @ciudad,
            Telefono = @telefono, Activo = @activo, FechaActualizacion = SYSDATETIME()
        WHERE RestauranteId = @restauranteId
      `);

    res.json({ success: true, message: 'Restaurante actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar restaurante', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}

export async function adminToggleRestaurant(req: Request, res: Response): Promise<void> {
  const restauranteId = parseInt(req.params.id, 10);
  if (isNaN(restauranteId)) { res.status(400).json({ success: false, message: 'ID inválido' }); return; }

  try {
    const pool = await getPool();
    await pool.request()
      .input('restauranteId', sql.Int, restauranteId)
      .query(`
        UPDATE Restaurantes
        SET Activo = CASE WHEN Activo = 1 THEN 0 ELSE 1 END,
            FechaActualizacion = SYSDATETIME()
        WHERE RestauranteId = @restauranteId
      `);
    res.json({ success: true, message: 'Estado del restaurante actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cambiar estado', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}
