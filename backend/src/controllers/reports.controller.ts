import { Request, Response } from 'express';
import { getPool } from '../config/db';
import type { VentaPorDia, VentaPorHora, VentaPorDaypart } from '../types/api.types';

export async function getVentasPorDia(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();
    const result = await pool.request().query<VentaPorDia>(
      'SELECT * FROM VentasPorDia ORDER BY Fecha DESC, Restaurante ASC'
    );
    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas por día',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

export async function getVentasPorHora(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();
    const result = await pool.request().query<VentaPorHora>(
      'SELECT * FROM VentasPorHora ORDER BY Fecha DESC, Hora ASC, Restaurante ASC'
    );
    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas por hora',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

export async function getVentasPorDaypart(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();
    const result = await pool.request().query<VentaPorDaypart>(
      'SELECT * FROM VentasPorDaypart ORDER BY Fecha DESC, Daypart ASC, Restaurante ASC'
    );
    res.json({
      success: true,
      total: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas por daypart',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
