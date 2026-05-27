import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../modules/auth/context/AuthContext';

// Auth — páginas creadas
import LoginPage           from '../modules/auth/pages/LoginPage';
import RegisterPage        from '../modules/auth/pages/RegisterPage';
import ForgotPasswordPage  from '../modules/auth/pages/ForgotPasswordPage';
import VerifyPinPage       from '../modules/auth/pages/VerifyPinPage';

// Layouts
import ClientLayout        from '../layouts/ClientLayout';
import AdminLayout         from '../layouts/AdminLayout';

// Páginas existentes — solo importar, NUNCA modificar
import HomePage            from '../modules/catalogo/pages/HomePage';
import ProductsPage        from '../modules/catalogo/pages/ProductsPage';
import CartPage            from '../modules/carrito/pages/CartPage';

// Backoffice Pages
import AdminDashboardPage  from '../modules/backoffice/pages/AdminDashboardPage';
import AdminUsersPage      from '../modules/backoffice/pages/AdminUsersPage';
import AdminRolesPage      from '../modules/backoffice/pages/AdminRolesPage';
import AdminRestaurantsPage from '../modules/backoffice/pages/AdminRestaurantsPage';
import AdminProductsPage   from '../modules/backoffice/pages/AdminProductsPage';
import AdminDaypartPage    from '../modules/backoffice/pages/AdminDaypartPage';
import AdminOffersPage     from '../modules/backoffice/pages/AdminOffersPage';
import AdminOrdersPage     from '../modules/backoffice/pages/AdminOrdersPage';
import AdminOrderDetailPage from '../modules/backoffice/pages/AdminOrderDetailPage';

// Reports Pages
import ReportsDashboardPage from '../modules/reportes/pages/ReportsDashboardPage';

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas de autenticación — sin layout */}
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/registro"            element={<RegisterPage />} />
          <Route path="/recuperar-password"  element={<ForgotPasswordPage />} />
          <Route path="/verificar-pin"       element={<VerifyPinPage />} />

          {/* Rutas de cliente — con ClientLayout */}
          <Route element={<ClientLayout />}>
            <Route path="/"          element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/carrito"   element={<CartPage />} />
          </Route>

          {/* Rutas de admin — con AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index              element={<AdminDashboardPage />} />
            <Route path="users"       element={<AdminUsersPage />} />
            <Route path="roles"       element={<AdminRolesPage />} />
            <Route path="restaurants" element={<AdminRestaurantsPage />} />
            <Route path="products"    element={<AdminProductsPage />} />
            <Route path="dayparts"    element={<AdminDaypartPage />} />
            <Route path="offers"      element={<AdminOffersPage />} />
            <Route path="orders"      element={<AdminOrdersPage />} />
            <Route path="orders/:id"  element={<AdminOrderDetailPage />} />
            <Route path="reportes"    element={<ReportsDashboardPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
