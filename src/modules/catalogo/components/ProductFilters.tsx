import type { Categoria } from '../types/product.types';
import { PRODUCTOS_MOCK, CATEGORIAS } from '../data/productos.mock';

interface Props {
  categoriaActiva: Categoria | 'Todos';
  onChange: (cat: Categoria | 'Todos') => void;
}

export default function ProductFilters({ categoriaActiva, onChange }: Props) {
  const totalActivos = PRODUCTOS_MOCK.filter((p) => p.activo).length;

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <button
        onClick={() => onChange('Todos')}
        className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
          categoriaActiva === 'Todos'
            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
            : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
        }`}
      >
        Todos ({totalActivos})
      </button>

      {CATEGORIAS.map((cat) => {
        const conteo = PRODUCTOS_MOCK.filter((p) => p.categoria === cat && p.activo).length;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
              categoriaActiva === cat
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            {cat} ({conteo})
          </button>
        );
      })}
    </div>
  );
}
