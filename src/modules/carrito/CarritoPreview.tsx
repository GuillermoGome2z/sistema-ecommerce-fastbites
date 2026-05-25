import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CarritoProvider } from './CarritoContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';

/**
 * Wrapper aislado para previsualizar el Módulo 3 sin depender de App.tsx ni rutas globales.
 * Uso temporal: importar en App.tsx → <CarritoPreview />
 *
 * Rutas internas:
 *   /carrito         → CartPage
 *   /checkout        → CheckoutPage
 *   /confirmacion/:n → OrderConfirmationPage
 *   /pedidos         → OrderHistoryPage
 */
export default function CarritoPreview() {
  return (
    <MemoryRouter initialEntries={['/carrito']}>
      <CarritoProvider>
        <Routes>
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmacion/:numero" element={<OrderConfirmationPage />} />
          <Route path="/pedidos" element={<OrderHistoryPage />} />
        </Routes>
      </CarritoProvider>
    </MemoryRouter>
  );
}
