import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CarritoProvider } from '../modules/carrito/CarritoContext';
import { AuthProvider } from '../modules/auth/context/AuthContext';
import RequireRole from './RequireRole';

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
import ProductDetailPage   from '../modules/catalogo/pages/ProductDetailPage';
import CartPage            from '../modules/carrito/pages/CartPage';

// Flujo de compra
import CheckoutPage        from '../modules/carrito/pages/CheckoutPage';
import OrderConfirmationPage from '../modules/carrito/pages/OrderConfirmationPage';
import OrderHistoryPage    from '../modules/carrito/pages/OrderHistoryPage';

// Perfil del cliente
import MiCuentaPage        from '../modules/cliente/pages/MiCuentaPage';
import MisDireccionesPage  from '../modules/cliente/pages/MisDireccionesPage';
import MisMetodosPagoPage  from '../modules/cliente/pages/MisMetodosPagoPage';

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
import ReportsDashboardPage  from '../modules/reportes/pages/ReportsDashboardPage';
import SalesByDayPage        from '../modules/reportes/pages/SalesByDayPage';
import SalesByHourPage       from '../modules/reportes/pages/SalesByHourPage';
import SalesByDaypartPage    from '../modules/reportes/pages/SalesByDaypartPage';

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

          {/* CarritoProvider envuelve TODO lo que use useCarrito() */}
          <Route element={<CarritoProvider><Outlet /></CarritoProvider>}>

            {/* Páginas de cliente con navbar compartido */}
            <Route element={<ClientLayout />}>
              <Route path="/"          element={<HomePage />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/carrito"   element={<CartPage />} />
            </Route>

            {/* Detalle de producto — navbar propio, dentro de CarritoProvider */}
            <Route path="/productos/:id" element={<ProductDetailPage />} />

            {/* Flujo de compra — nav propio en cada página */}
            <Route path="/checkout"             element={<CheckoutPage />} />
            <Route path="/confirmacion/:numero" element={<OrderConfirmationPage />} />
            <Route path="/pedidos"              element={<OrderHistoryPage />} />

          </Route>

          {/* Perfil del cliente */}
          <Route path="/mi-cuenta"               element={<MiCuentaPage />} />
          <Route path="/mis-direcciones"         element={<MisDireccionesPage />} />
          <Route path="/mis-metodos-pago"        element={<MisMetodosPagoPage />} />

          {/* Rutas de admin — con AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index              element={<AdminDashboardPage />} />

            {/* Solo Administrador */}
            <Route element={<RequireRole allowedRoles={['Administrador']} />}>
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="roles" element={<AdminRolesPage />} />
            </Route>

            {/* Todos los roles admin */}
            <Route path="restaurants" element={<AdminRestaurantsPage />} />
            <Route path="products"    element={<AdminProductsPage />} />
            <Route path="offers"      element={<AdminOffersPage />} />
            <Route path="orders"      element={<AdminOrdersPage />} />
            <Route path="orders/:id"  element={<AdminOrderDetailPage />} />

            {/* Administrador + EmpleadoBackoffice (no Supervisor) */}
            <Route element={<RequireRole allowedRoles={['Administrador', 'EmpleadoBackoffice']} />}>
              <Route path="dayparts" element={<AdminDaypartPage />} />
            </Route>

            {/* Administrador + Supervisor (no EmpleadoBackoffice) */}
            <Route element={<RequireRole allowedRoles={['Administrador', 'Supervisor']} />}>
              <Route path="reportes"                element={<ReportsDashboardPage />} />
              <Route path="reportes/ventas-dia"     element={<SalesByDayPage />} />
              <Route path="reportes/ventas-hora"    element={<SalesByHourPage />} />
              <Route path="reportes/ventas-daypart" element={<SalesByDaypartPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
