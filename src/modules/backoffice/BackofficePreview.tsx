import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminRolesPage from './pages/AdminRolesPage';
import AdminRestaurantsPage from './pages/AdminRestaurantsPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminDaypartPage from './pages/AdminDaypartPage';
import AdminOffersPage from './pages/AdminOffersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminOrderDetailPage from './pages/AdminOrderDetailPage';

/**
 * Wrapper aislado para previsualizar el Módulo 4 sin depender de App.tsx ni rutas globales.
 * Uso temporal: importar en App.tsx → <BackofficePreview />
 */
export default function BackofficePreview() {
  return (
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/roles" element={<AdminRolesPage />} />
        <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/dayparts" element={<AdminDaypartPage />} />
        <Route path="/admin/offers" element={<AdminOffersPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}
