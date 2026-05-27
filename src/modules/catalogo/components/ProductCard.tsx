import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, ShoppingCart, Check, AlertCircle, X } from 'lucide-react';
import type { Producto } from '../types/product.types';
import { useCarrito } from '../../carrito/CarritoContext';

interface Props {
  producto: Producto;
}

export default function ProductCard({ producto }: Props) {
  const { agregarAlCarrito } = useCarrito();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleAgregar = async () => {
    if (adding || added) return;
    setAdding(true);
    setAddError('');
    try {
      await agregarAlCarrito(producto.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Error al agregar al carrito.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {/* Modal de error — cubre toda la pantalla */}
      {addError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setAddError('')}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Aviso</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{addError}</p>
            <button
              onClick={() => setAddError('')}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors w-full"
            >
              Entendido
            </button>
            <button
              onClick={() => setAddError('')}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
        <div className="relative overflow-hidden h-52 flex-shrink-0">
          {imgError ? (
            <div className="w-full h-full bg-orange-50 flex flex-col items-center justify-center text-orange-300">
              <span className="text-5xl mb-1">🍽️</span>
              <span className="text-xs text-gray-400">{producto.nombre}</span>
            </div>
          ) : (
            <img
              src={producto.imagen}
              alt={producto.nombre}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {producto.esDestacado && (
            <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              ⭐ Destacado
            </span>
          )}
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            {producto.categoria}
          </span>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-gray-900 font-bold text-lg mb-1 leading-tight">{producto.nombre}</h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">{producto.descripcion}</p>

          <div className="flex items-center gap-3 mb-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1">
              <Flame size={13} className="text-orange-400" />
              {producto.calorias} cal
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-orange-400" />
              {producto.tiempoPreparacion} min
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-2xl font-extrabold text-orange-500">${producto.precioBase.toFixed(2)}</span>
            <div className="flex gap-2">
              <Link
                to={`/productos/${producto.id}`}
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-xl border border-gray-200 hover:border-orange-300"
              >
                Ver más
              </Link>
              <button
                onClick={handleAgregar}
                disabled={adding}
                className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-60 text-white text-sm font-semibold px-3 py-1.5 rounded-xl transition-all"
              >
                {added ? <Check size={14} /> : <ShoppingCart size={14} />}
                {adding ? '...' : added ? '¡Listo!' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
