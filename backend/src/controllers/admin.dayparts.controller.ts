import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';

export async function adminGetAllDayparts(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        d.DaypartId                                    AS id,
        d.Nombre                                       AS nombre,
        LEFT(CONVERT(VARCHAR(8), d.HoraInicio, 108), 5) AS horaInicio,
        LEFT(CONVERT(VARCHAR(8), d.HoraFin,    108), 5) AS horaFin,
        d.Activo                                       AS activo,
        COUNT(pd.ProductoDaypartId)                    AS productosCount
      FROM Dayparts d
      LEFT JOIN ProductoDaypart pd ON pd.DaypartId = d.DaypartId AND pd.Activo = 1
      GROUP BY d.DaypartId, d.Nombre, d.HoraInicio, d.HoraFin, d.Activo
      ORDER BY d.DaypartId ASC
    `);

    res.json({ success: true, total: result.recordset.length, data: result.recordset });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener dayparts',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

export async function adminToggleDaypart(req: Request, res: Response): Promise<void> {
  const daypartId = parseInt(req.params.id, 10);
  if (isNaN(daypartId)) { res.status(400).json({ success: false, message: 'ID inválido' }); return; }

  try {
    const pool = await getPool();
    await pool.request()
      .input('daypartId', sql.Int, daypartId)
      .query(`
        UPDATE Dayparts
        SET Activo = CASE WHEN Activo = 1 THEN 0 ELSE 1 END
        WHERE DaypartId = @daypartId
      `);
    res.json({ success: true, message: 'Estado del daypart actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cambiar estado', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}
