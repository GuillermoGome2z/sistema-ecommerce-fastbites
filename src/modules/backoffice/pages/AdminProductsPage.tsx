import { useState } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, Star } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';
import StatusBadge from '../components/StatusBadge';
import ActionButton from '../components/ActionButton';
import ProductFormModal from '../components/ProductFormModal';
import { ADMIN_PRODUCTOS_MOCK, CATEGORIAS_ADMIN } from '../data/adminProductos.mock';
import { ADMIN_RESTAURANTES_MOCK } from '../data/adminRestaurantes.mock';
import type { AdminProduct } from '../types/backoffice.types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>(ADMIN_PRODUCTOS_MOCK);
  const [catFilter, setCatFilter] = useState('Todos');
  const [restFilter, setRestFilter] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);

  const filtered = products.filter((p) => {
    if (catFilter !== 'Todos' && p.categoria !== catFilter) return false;
    if (restFilter !== 'Todos' && p.restaurante !== restFilter) return false;
    return true;
  });

  const openEdit = (p: AdminProduct) => { setEditing(p); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const toggleActive = (id: number) => setProducts((prev) => prev.map((p) => p.id === id ? { ...p, activo: !p.activo } : p));

  const handleSave = (data: Partial<AdminProduct>) => {
    if (editing) {
      setProducts((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...data } : p));
    } else {
      setProducts((prev) => [...prev, { ...data, id: Date.now() } as AdminProduct]);
    }
  };

  const rows = filtered.map((p) => [
    <div className="flex items-center gap-3">
      <img src={p.imagen} alt={p.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      <div>
        <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
          {p.nombre}
          {p.esDestacado && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
        </p>
        <p className="text-gray-400 text-xs">{p.descripcion.slice(0, 40)}...</p>
      </div>
    </div>,
    <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-medium">{p.categoria}</span>,
    <span className="text-xs text-gray-600">{p.restaurante}</span>,
    <span className="font-bold text-orange-500">${p.precioBase.toFixed(2)}</span>,
    <StatusBadge status="" active={p.activo} />,
    <div className="flex items-center gap-1">
      <ActionButton onClick={() => openEdit(p)} icon={<Pencil size={14} />} label="Editar" />
      <ActionButton onClick={() => toggleActive(p.id)} icon={p.activo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} label={p.activo ? 'Desactivar' : 'Activar'} variant={p.activo ? 'warning' : 'success'} />
    </div>,
  ]);

  return (
    <AdminLayout title="Productos">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-orange-400 transition-colors">
              <option value="Todos">Todas las categorías</option>
              {CATEGORIAS_ADMIN.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={restFilter} onChange={(e) => setRestFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-orange-400 transition-colors">
              <option value="Todos">Todos los restaurantes</option>
              {ADMIN_RESTAURANTES_MOCK.map((r) => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
            </select>
            <span className="text-gray-400 text-sm">{filtered.length} productos</span>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>

        <AdminTable headers={['Producto', 'Categoría', 'Restaurante', 'Precio', 'Estado', 'Acciones']} rows={rows} emptyMessage="No hay productos con estos filtros" />
      </div>

      <ProductFormModal open={modalOpen} onClose={() => setModalOpen(false)} product={editing} onSave={handleSave} />
    </AdminLayout>
  );
}
