import { Request, Response } from 'express';
import { getPool } from '../config/db';

export async function adminGetRoles(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        r.RolId                          AS id,
        r.Nombre                         AS nombre,
        ISNULL(r.Descripcion, '')        AS descripcion,
        r.Activo                         AS activo,
        COUNT(ur.UsuarioRolId)           AS usuariosCount
      FROM Roles r
      LEFT JOIN UsuarioRoles ur ON ur.RolId = r.RolId AND ur.Activo = 1
      GROUP BY r.RolId, r.Nombre, r.Descripcion, r.Activo
      ORDER BY r.RolId ASC
    `);

    res.json({ success: true, total: result.recordset.length, data: result.recordset });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
