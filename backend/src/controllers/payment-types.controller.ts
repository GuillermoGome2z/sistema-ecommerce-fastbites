import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';

// ─── GET /api/payment-types ────────────────────────────────────
// Catálogo público de tipos de pago disponibles.
export async function getPaymentTypes(_req: Request, res: Response): Promise<void> {
  try {
    const pool   = await getPool();
    const result = await pool
      .request()
      .query<{ TipoPagoId: number; Nombre: string; Descripcion: string | null }>(`
        SELECT TipoPagoId, Nombre, Descripcion
        FROM   TiposPago
        WHERE  Activo = 1
        ORDER  BY TipoPagoId ASC
      `);

    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
