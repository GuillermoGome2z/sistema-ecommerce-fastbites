import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import type { Categoria, Producto } from '../types/product.types';
import ProductFilters from '../components/ProductFilters';
import ProductGrid from '../components/ProductGrid';
import { API_BASE_URL } from '../../../config/api';

interface BackendProducto {
  ProductoId: number;
  Nombre: string;
  Descripcion: string;
  PrecioBase: number;
  Categoria: string;
  EsDestacado: number | boolean;
  Activo: number | boolean;
  Imagen?: string | null;
}

const IMAGEN_CATEGORIA: Record<string, string> = {
  Desayuno: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80',
  Almuerzo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
  Cena:     'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
};

const CALORIAS_CATEGORIA: Record<string, number> = { Desayuno: 450, Almuerzo: 650, Cena: 750 };
const TIEMPO_CATEGORIA: Record<string, number>   = { Desayuno: 10,  Almuerzo: 15,  Cena: 20  };

function adaptar(p: BackendProducto): Producto {
  return {
    id: p.ProductoId,
    nombre: p.Nombre,
    descripcion: p.Descripcion ?? '',
    precioBase: p.PrecioBase,
    categoria: p.Categoria as Categoria,
    imagen: p.Imagen ?? IMAGEN_CATEGORIA[p.Categoria] ?? IMAGEN_CATEGORIA['Almuerzo'],
    calorias: CALORIAS_CATEGORIA[p.Categoria] ?? 500,
    tiempoPreparacion: TIEMPO_CATEGORIA[p.Categoria] ?? 12,
    esDestacado: Boolean(p.EsDestacado),
    activo: Boolean(p.Activo),
  };
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria | 'Todos'>('Todos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cat = searchParams.get('categoria') as Categoria | null;
    if (cat) setCategoriaActiva(cat);
  }, [searchParams]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setProductos(json.data.map(adaptar)); })
      .catch(() => setError('No se pudo cargar el menú. Verifica que el backend esté corriendo.'))
      .finally(() => setLoading(false));
  }, []);

  const productosFiltrados = productos.filter((p) => {
    if (!p.activo) return false;
    if (categoriaActiva === 'Todos') return true;
    return p.categoria === categoriaActiva;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Cargando menú...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-6 py-4 rounded-2xl max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

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

        <ProductFilters categoriaActiva={categoriaActiva} onChange={setCategoriaActiva} productos={productos} />
        <ProductGrid productos={productosFiltrados} />
      </div>
    </div>
  );
}
