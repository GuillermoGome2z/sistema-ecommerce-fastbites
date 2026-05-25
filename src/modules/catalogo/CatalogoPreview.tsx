import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';

/**
 * Wrapper aislado para previsualizar el Módulo 2 sin depender de App.tsx ni de rutas globales.
 * Uso temporal: importar en App.tsx → <CatalogoPreview />
 */
export default function CatalogoPreview() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}
