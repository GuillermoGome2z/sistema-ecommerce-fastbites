import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Flame, ShoppingCart, Tag, Star, Check } from 'lucide-react';
import type { Categoria, Producto } from '../types/product.types';
import { API_BASE_URL } from '../../../config/api';
import { useCarrito } from '../../carrito/CarritoContext';

interface BackendProductoBase {
  ProductoId: number;
  Nombre: string;
  Descripcion?: string;
  PrecioBase: number;
  Categoria: string;
  EsDestacado: number | boolean;
  Activo?: number | boolean;
  Imagen?: string | null;
}

interface BackendProductoDetalle extends BackendProductoBase {
  RestauranteId: number;
  Calorias?: number;
  TiempoPreparacion?: number;
  relacionados: BackendProductoBase[];
}

const IMAGEN_CATEGORIA: Record<string, string> = {
  Desayuno: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80',
  Almuerzo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
  Cena:     'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
};

const CALORIAS_CATEGORIA: Record<string, number>  = { Desayuno: 450, Almuerzo: 650, Cena: 750 };
const TIEMPO_CATEGORIA: Record<string, number>    = { Desayuno: 10,  Almuerzo: 15,  Cena: 20  };

function adaptar(p: BackendProductoBase): Producto {
  return {
    id: p.ProductoId,
    nombre: p.Nombre,
    descripcion: p.Descripcion ?? '',
    precioBase: p.PrecioBase,
    categoria: p.Categoria as Categoria,
    imagen: p.Imagen ?? IMAGEN_CATEGORIA[p.Categoria] ?? IMAGEN_CATEGORIA['Almuerzo'],
    calorias: (p as BackendProductoDetalle).Calorias || (CALORIAS_CATEGORIA[p.Categoria] ?? 500),
    tiempoPreparacion: (p as BackendProductoDetalle).TiempoPreparacion || (TIEMPO_CATEGORIA[p.Categoria] ?? 12),
    esDestacado: Boolean(p.EsDestacado),
    activo: Boolean(p.Activo ?? true),
  };
}

function RelatedImg({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div className="w-full h-full bg-orange-50 flex items-center justify-center">
      <span className="text-3xl">🍽️</span>
    </div>
  );
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [relacionados, setRelacionados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then((r) => r.json())
      .then((json: { success: boolean; message?: string; data?: BackendProductoDetalle }) => {
        if (!json.success || !json.data) {
          setError(json.message ?? 'Producto no encontrado');
          return;
        }
        setProducto(adaptar(json.data));
        setRelacionados((json.data.relacionados ?? []).map(adaptar));
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Cargando producto...</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-7xl">🍽️</p>
        <h2 className="text-2xl font-extrabold text-gray-800">Producto no encontrado</h2>
        <p className="text-gray-500">{error || 'El producto que buscas no existe o fue removido.'}</p>
        <Link
          to="/productos"
          className="mt-2 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al Menú
        </Link>
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
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 font-medium text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Product card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="relative h-72 lg:h-auto min-h-80">
              {imgError ? (
                <div className="absolute inset-0 bg-orange-50 flex flex-col items-center justify-center text-orange-300">
                  <span className="text-7xl mb-2">🍽️</span>
                  <span className="text-sm text-gray-400">{producto.nombre}</span>
                </div>
              ) : (
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  onError={() => setImgError(true)}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {producto.esDestacado && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  <Star size={12} fill="white" />
                  Destacado
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Tag size={11} />
                    {producto.categoria}
                  </span>
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
                  {producto.nombre}
                </h1>
                <p className="text-gray-600 text-base leading-relaxed mb-8">
                  {producto.descripcion}
                </p>

                <div className="flex gap-4 mb-8">
                  <div className="flex items-center gap-3 bg-orange-50 px-4 py-3 rounded-2xl flex-1">
                    <Flame size={20} className="text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Calorías</p>
                      <p className="font-bold text-gray-800">{producto.calorias} cal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-orange-50 px-4 py-3 rounded-2xl flex-1">
                    <Clock size={20} className="text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Preparación</p>
                      <p className="font-bold text-gray-800">{producto.tiempoPreparacion} min</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-black text-orange-500">
                    ${producto.precioBase.toFixed(2)}
                  </span>
                  <span className="text-gray-500 text-sm mb-1.5">precio base</span>
                </div>
                {addError && (
                  <p className="text-red-500 text-sm mb-3 text-center">{addError}</p>
                )}
                <button
                  onClick={async () => {
                    if (adding || added) return;
                    setAdding(true);
                    setAddError('');
                    try {
                      await agregarAlCarrito(producto.id, 1, producto.nombre);
                      setAdded(true);
                      setTimeout(() => setAdded(false), 2000);
                    } catch (err) {
                      setAddError(err instanceof Error ? err.message : 'Error al agregar al carrito.');
                    } finally {
                      setAdding(false);
                    }
                  }}
                  disabled={adding}
                  className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-60 text-white font-bold text-lg px-6 py-4 rounded-2xl transition-all shadow-lg shadow-orange-200"
                >
                  {added ? <Check size={22} /> : <ShoppingCart size={22} />}
                  {adding ? 'Agregando...' : added ? '¡Agregado!' : 'Agregar al Carrito'}
                </button>
                <button
                  onClick={() => navigate('/productos')}
                  className="w-full mt-3 text-gray-500 hover:text-orange-500 font-medium text-sm transition-colors py-2"
                >
                  ← Seguir explorando el menú
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relacionados.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
              También te puede gustar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relacionados.map((p) => (
                <Link
                  key={p.id}
                  to={`/productos/${p.id}`}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="h-40 overflow-hidden">
                    <RelatedImg src={p.imagen} alt={p.nombre} />
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900">{p.nombre}</p>
                    <p className="text-gray-500 text-xs mt-0.5 mb-2">{p.categoria}</p>
                    <p className="text-orange-500 font-extrabold text-lg">
                      ${p.precioBase.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
