import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import type { Categoria } from '../types/product.types';
import { PRODUCTOS_MOCK } from '../data/productos.mock';
import ProductFilters from '../components/ProductFilters';
import ProductGrid from '../components/ProductGrid';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria | 'Todos'>('Todos');

  useEffect(() => {
    const cat = searchParams.get('categoria') as Categoria | null;
    if (cat) setCategoriaActiva(cat);
  }, [searchParams]);

  const productosFiltrados = PRODUCTOS_MOCK.filter((p) => {
    if (!p.activo) return false;
    if (categoriaActiva === 'Todos') return true;
    return p.categoria === categoriaActiva;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">FB</span>
              </div>
              <span className="font-black text-xl text-gray-900">
                Fast<span className="text-orange-500">Bites</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-orange-500 font-medium text-sm transition-colors"
              >
                Inicio
              </Link>
              <Link to="/productos" className="text-orange-500 font-semibold text-sm">
                Menú
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="breadcrumb">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-orange-500 transition-colors"
          >
            <Home size={14} />
            Inicio
          </Link>
          <ChevronRight size={14} />
          <span className="text-orange-500 font-medium">Menú</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Nuestro Menú</h1>
          <p className="text-gray-500 mt-1">
            {productosFiltrados.length}{' '}
            {productosFiltrados.length === 1 ? 'producto disponible' : 'productos disponibles'}
            {categoriaActiva !== 'Todos' && (
              <span className="text-orange-500 font-medium"> en {categoriaActiva}</span>
            )}
          </p>
        </div>

        <ProductFilters categoriaActiva={categoriaActiva} onChange={setCategoriaActiva} />
        <ProductGrid productos={productosFiltrados} />
      </div>
    </div>
  );
}
