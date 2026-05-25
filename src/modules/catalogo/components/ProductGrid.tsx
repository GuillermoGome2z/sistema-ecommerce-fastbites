import type { Producto } from '../types/product.types';
import ProductCard from './ProductCard';

interface Props {
  productos: Producto[];
}

export default function ProductGrid({ productos }: Props) {
  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-6xl mb-4">🍽️</p>
        <p className="text-gray-600 text-lg font-medium">No hay productos en esta categoría</p>
        <p className="text-gray-500 text-sm mt-1">Intenta con otra selección</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productos.map((p) => (
        <ProductCard key={p.id} producto={p} />
      ))}
    </div>
  );
}
