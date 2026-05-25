import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTOS_MOCK } from '../data/productos.mock';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  const destacados = PRODUCTOS_MOCK.filter((p) => p.esDestacado && p.activo);

  return (
    <section className="py-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Productos Destacados</h2>
          <p className="text-gray-500 mt-1">Los favoritos de nuestros clientes</p>
        </div>
        <Link
          to="/productos"
          className="flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors self-start sm:self-auto"
        >
          Ver todos
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {destacados.map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </section>
  );
}
