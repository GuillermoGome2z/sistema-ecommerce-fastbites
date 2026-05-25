import { Request, Response } from 'express';
import { getPool, getDiagnostics } from '../config/db';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    status: 'ok',
    message: 'Backend FastBites funcionando',
    timestamp: new Date().toISOString(),
  });
}

export async function getDbHealth(_req: Request, res: Response): Promise<void> {
  try {
    const diag = await getDiagnostics();

    if (!diag.masterConnected) {
      res.status(500).json({
        success: false,
        status: 'error',
        message: 'No se pudo conectar a SQL Server (ni siquiera a master)',
        diagnostics: diag,
      });
      return;
    }

    if (diag.hasAccess !== 1) {
      res.status(500).json({
        success: false,
        status: 'error',
        message: `El usuario '${diag.systemUser}' no tiene acceso a ${diag.targetDb}. HAS_DBACCESS=${diag.hasAccess}, DB_ID=${diag.databaseId}`,
        diagnostics: diag,
      });
      return;
    }

    if (!diag.targetDbConnected) {
      res.status(500).json({
        success: false,
        status: 'warning',
        message: `Master OK y HAS_DBACCESS=1, pero la conexión directa a ${diag.targetDb} falló`,
        diagnostics: diag,
      });
      return;
    }

    // Verificación final: query real sobre FastBitesDB
    const conn = await getPool();
    const verify = await conn.request().query<{ currentDb: string }>(
      'SELECT DB_NAME() AS currentDb'
    );

    res.json({
      success: true,
      status: 'ok',
      message: `Conexión a SQL Server exitosa`,
      currentDb: verify.recordset[0]?.currentDb,
      diagnostics: diag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Error inesperado al verificar la conexión',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
