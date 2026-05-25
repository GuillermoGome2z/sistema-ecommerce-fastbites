import { Link } from 'react-router-dom';
import { Clock, Flame, ShoppingCart } from 'lucide-react';
import type { Producto } from '../types/product.types';

interface Props {
  producto: Producto;
}

export default function ProductCard({ producto }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
      <div className="relative overflow-hidden h-52 flex-shrink-0">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
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
            <button className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-3 py-1.5 rounded-xl transition-all">
              <ShoppingCart size={14} />
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
