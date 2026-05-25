import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ReportsDashboardPage from './pages/ReportsDashboardPage';
import SalesByDayPage from './pages/SalesByDayPage';
import SalesByHourPage from './pages/SalesByHourPage';
import SalesByDaypartPage from './pages/SalesByDaypartPage';
import IntegrationStatusPage from './pages/IntegrationStatusPage';

export default function ReportesPreview() {
  return (
    <MemoryRouter initialEntries={['/reportes']}>
      <Routes>
        <Route path="/reportes" element={<ReportsDashboardPage />} />
        <Route path="/reportes/ventas-dia" element={<SalesByDayPage />} />
        <Route path="/reportes/ventas-hora" element={<SalesByHourPage />} />
        <Route path="/reportes/ventas-daypart" element={<SalesByDaypartPage />} />
        <Route path="/reportes/integracion" element={<IntegrationStatusPage />} />
      </Routes>
    </MemoryRouter>
  );
}
