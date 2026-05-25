import { Router } from 'express';
import { getVentasPorDia, getVentasPorHora, getVentasPorDaypart } from '../controllers/reports.controller';

const router = Router();

router.get('/ventas-dia', getVentasPorDia);
router.get('/ventas-hora', getVentasPorHora);
router.get('/ventas-daypart', getVentasPorDaypart);

export default router;
