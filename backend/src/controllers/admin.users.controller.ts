import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';

// ─── GET /api/admin/users ──────────────────────────────────────
export async function adminGetUsers(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();
    const result = await pool.request().query<{
      id: number;
      nombre: string;
      email: string;
      rol: string;
      activo: boolean;
      ultimoAcceso: Date | null;
      fechaCreacion: Date;
    }>(`
      SELECT 
        u.UsuarioId         AS id,
        u.NombreCompleto    AS nombre,
        u.Email             AS email,
        COALESCE(r.Nombre, 'Cliente') AS rol,
        u.Activo            AS activo,
        u.UltimoIntentoLogin AS ultimoAcceso,
        u.FechaCreacion     AS fechaCreacion
      FROM Usuarios u
      LEFT JOIN UsuarioRoles ur ON ur.UsuarioId = u.UsuarioId AND ur.Activo = 1
      LEFT JOIN Roles r ON r.RolId = ur.RolId AND r.Activo = 1
      ORDER BY u.FechaCreacion DESC
    `);

    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los usuarios del sistema',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

// ─── PATCH /api/admin/users/:id/toggle ─────────────────────────
export async function adminToggleUserActive(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = Number(id);

  if (isNaN(userId)) {
    res.status(400).json({ success: false, message: 'ID de usuario inválido' });
    return;
  }

  try {
    const pool = await getPool();
    
    // Obtener estado actual
    const check = await pool
      .request()
      .input('id', sql.Int, userId)
      .query<{ Activo: boolean }>('SELECT Activo FROM Usuarios WHERE UsuarioId = @id');

    const usuario = check.recordset[0];
    if (!usuario) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    const nuevoActivo = !usuario.Activo;

    // Actualizar estado activo en tabla Usuarios
    await pool
      .request()
      .input('id', sql.Int, userId)
      .input('activo', sql.Bit, nuevoActivo ? 1 : 0)
      .query('UPDATE Usuarios SET Activo = @activo WHERE UsuarioId = @id');

    res.json({
      success: true,
      message: `Usuario ${nuevoActivo ? 'activado' : 'desactivado'} con éxito`,
      data: { id: userId, activo: nuevoActivo }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al alternar estado del usuario',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
