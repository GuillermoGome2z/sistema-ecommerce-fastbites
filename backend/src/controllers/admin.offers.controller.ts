import { Request, Response } from 'express';
import { getPool, sql } from '../config/db';

interface OfertaRow {
  id: number;
  nombre: string;
  descripcion: string;
  tipoDescuento: 'Porcentaje' | 'MontoFijo';
  valorDescuento: number;
  codigoPromo: string | null;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  usosTotal: number;
}

export async function adminGetAllOffers(_req: Request, res: Response): Promise<void> {
  try {
    const pool = await getPool();

    const offersResult = await pool.request().query<OfertaRow>(`
      SELECT
        o.OfertaId                                          AS id,
        o.Nombre                                            AS nombre,
        ISNULL(o.Descripcion, '')                           AS descripcion,
        o.TipoDescuento                                     AS tipoDescuento,
        CAST(o.ValorDescuento AS FLOAT)                     AS valorDescuento,
        o.CodigoPromo                                       AS codigoPromo,
        CONVERT(NVARCHAR(10), o.FechaInicio, 120)           AS fechaInicio,
        CONVERT(NVARCHAR(10), o.FechaFin, 120)              AS fechaFin,
        o.Activo                                            AS activo,
        o.UsoActual                                         AS usosTotal
      FROM Ofertas o
      ORDER BY o.FechaFin DESC
    `);

    const productsResult = await pool.request().query<{ ofertaId: number; productoId: number }>(`
      SELECT OfertaId AS ofertaId, ProductoId AS productoId FROM OfertaProductos ORDER BY OfertaId
    `);

    const productosByOferta = new Map<number, number[]>();
    for (const row of productsResult.recordset) {
      const list = productosByOferta.get(row.ofertaId) ?? [];
      list.push(row.productoId);
      productosByOferta.set(row.ofertaId, list);
    }

    const data = offersResult.recordset.map((o) => ({
      ...o,
      productosAplicados: productosByOferta.get(o.id) ?? [],
    }));

    res.json({ success: true, total: data.length, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener ofertas',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}

export async function adminCreateOffer(req: Request, res: Response): Promise<void> {
  const { nombre, descripcion, tipoDescuento, valorDescuento, codigoPromo, fechaInicio, fechaFin, activo } = req.body as {
    nombre: string; descripcion?: string; tipoDescuento: 'Porcentaje' | 'MontoFijo';
    valorDescuento: number; codigoPromo?: string; fechaInicio: string; fechaFin: string; activo?: boolean;
  };

  if (!nombre || !tipoDescuento || !valorDescuento || !fechaInicio || !fechaFin) {
    res.status(400).json({ success: false, message: 'nombre, tipoDescuento, valorDescuento, fechaInicio y fechaFin son requeridos' });
    return;
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('nombre',         sql.NVarChar(150), nombre)
      .input('descripcion',    sql.NVarChar(500), descripcion ?? null)
      .input('tipoDescuento',  sql.NVarChar(20),  tipoDescuento)
      .input('valorDescuento', sql.Decimal(10,2), Number(valorDescuento))
      .input('codigoPromo',    sql.NVarChar(30),  codigoPromo ? codigoPromo.toUpperCase() : null)
      .input('fechaInicio',    sql.DateTime2,     new Date(fechaInicio))
      .input('fechaFin',       sql.DateTime2,     new Date(fechaFin))
      .input('activo',         sql.Bit,           activo !== false ? 1 : 0)
      .query<{ OfertaId: number }>(`
        INSERT INTO Ofertas (Nombre, Descripcion, TipoDescuento, ValorDescuento, CodigoPromo, FechaInicio, FechaFin, Activo)
        OUTPUT INSERTED.OfertaId
        VALUES (@nombre, @descripcion, @tipoDescuento, @valorDescuento, @codigoPromo, @fechaInicio, @fechaFin, @activo)
      `);

    res.status(201).json({ success: true, data: { id: result.recordset[0].OfertaId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear oferta', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}

export async function adminUpdateOffer(req: Request, res: Response): Promise<void> {
  const ofertaId = parseInt(req.params.id, 10);
  if (isNaN(ofertaId)) { res.status(400).json({ success: false, message: 'ID inválido' }); return; }

  const { nombre, descripcion, tipoDescuento, valorDescuento, codigoPromo, fechaInicio, fechaFin, activo } = req.body as {
    nombre: string; descripcion?: string; tipoDescuento: 'Porcentaje' | 'MontoFijo';
    valorDescuento: number; codigoPromo?: string; fechaInicio: string; fechaFin: string; activo?: boolean;
  };

  try {
    const pool = await getPool();
    await pool.request()
      .input('ofertaId',       sql.Int,           ofertaId)
      .input('nombre',         sql.NVarChar(150), nombre)
      .input('descripcion',    sql.NVarChar(500), descripcion ?? null)
      .input('tipoDescuento',  sql.NVarChar(20),  tipoDescuento)
      .input('valorDescuento', sql.Decimal(10,2), Number(valorDescuento))
      .input('codigoPromo',    sql.NVarChar(30),  codigoPromo ? codigoPromo.toUpperCase() : null)
      .input('fechaInicio',    sql.DateTime2,     new Date(fechaInicio))
      .input('fechaFin',       sql.DateTime2,     new Date(fechaFin))
      .input('activo',         sql.Bit,           activo !== false ? 1 : 0)
      .query(`
        UPDATE Ofertas
        SET Nombre = @nombre, Descripcion = @descripcion, TipoDescuento = @tipoDescuento,
            ValorDescuento = @valorDescuento, CodigoPromo = @codigoPromo,
            FechaInicio = @fechaInicio, FechaFin = @fechaFin, Activo = @activo,
            FechaActualizacion = SYSDATETIME()
        WHERE OfertaId = @ofertaId
      `);

    res.json({ success: true, message: 'Oferta actualizada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar oferta', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}

export async function adminToggleOffer(req: Request, res: Response): Promise<void> {
  const ofertaId = parseInt(req.params.id, 10);
  if (isNaN(ofertaId)) { res.status(400).json({ success: false, message: 'ID inválido' }); return; }

  try {
    const pool = await getPool();
    await pool.request()
      .input('ofertaId', sql.Int, ofertaId)
      .query(`
        UPDATE Ofertas
        SET Activo = CASE WHEN Activo = 1 THEN 0 ELSE 1 END,
            FechaActualizacion = SYSDATETIME()
        WHERE OfertaId = @ofertaId
      `);
    res.json({ success: true, message: 'Estado de la oferta actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cambiar estado', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
}
