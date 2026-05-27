import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, Star, Loader } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';
import StatusBadge from '../components/StatusBadge';
import ActionButton from '../components/ActionButton';
import ProductFormModal from '../components/ProductFormModal';
import type { AdminProduct, AdminRestaurant } from '../types/backoffice.types';
import { API_BASE_URL } from '../../../config/api';

export default function AdminProductsPage() {
  const [products, setProducts]       = useState<AdminProduct[]>([]);
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [catFilter, setCatFilter]     = useState('Todos');
  const [restFilter, setRestFilter]   = useState('Todos');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<AdminProduct | null>(null);

  const token = () => localStorage.getItem('fb_token') ?? '';
  const authHeaders = () => ({
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers: HeadersInit = { Authorization: `Bearer ${token()}` };
      const [prodsRes, restsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/products`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/restaurants`, { headers }),
      ]);
      const [prodsJson, restsJson] = await Promise.all([prodsRes.json(), restsRes.json()]);
      if (prodsJson.success) setProducts(prodsJson.data as AdminProduct[]);
      else setError(prodsJson.message ?? 'Error al cargar productos.');
      if (restsJson.success) setRestaurants(restsJson.data as AdminRestaurant[]);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const categoriasList = useMemo(
    () => [...new Set(products.map((p) => p.categoria))].sort(),
    [products],
  );

  const filtered = products.filter((p) => {
    if (catFilter !== 'Todos' && p.categoria !== catFilter) return false;
    if (restFilter !== 'Todos' && p.restaurante !== restFilter) return false;
    return true;
  });

  const openEdit   = (p: AdminProduct) => { setEditing(p); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setModalOpen(true); };

  const toggleActive = async (id: number) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, activo: !p.activo } : p));
    try {
      await fetch(`${API_BASE_URL}/api/admin/products/${id}/toggle`, { method: 'PATCH', headers: authHeaders() });
    } catch {
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, activo: !p.activo } : p));
    }
  };

  const handleSave = async (data: Partial<AdminProduct>) => {
    try {
      if (editing) {
        await fetch(`${API_BASE_URL}/api/admin/products/${editing.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`${API_BASE_URL}/api/admin/products`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(data),
        });
      }
      loadData();
    } catch {
      loadData();
    }
  };

  const rows = filtered.map((p) => [
    <div className="flex items-center gap-3">
      {p.imagen ? (
        <img src={p.imagen} alt={p.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-400 font-bold text-xs">
          {p.nombre.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div>
        <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
          {p.nombre}
          {p.esDestacado && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
        </p>
        <p className="text-gray-500 text-xs">{p.descripcion.slice(0, 40)}{p.descripcion.length > 40 ? '...' : ''}</p>
      </div>
    </div>,
    <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-medium">{p.categoria}</span>,
    <span className="text-xs text-gray-600">{p.restaurante}</span>,
    <span className="font-bold text-orange-500">${p.precioBase.toFixed(2)}</span>,
    <StatusBadge status="" active={p.activo} />,
    <div className="flex items-center gap-1">
      <ActionButton onClick={() => openEdit(p)} icon={<Pencil size={14} />} label="Editar" />
      <ActionButton
        onClick={() => toggleActive(p.id)}
        icon={p.activo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        label={p.activo ? 'Desactivar' : 'Activar'}
        variant={p.activo ? 'warning' : 'success'}
      />
    </div>,
  ]);

  return (
    <AdminLayout title="Productos">
      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-orange-400 transition-colors">
              <option value="Todos">Todas las categorías</option>
              {categoriasList.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={restFilter} onChange={(e) => setRestFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-orange-400 transition-colors">
              <option value="Todos">Todos los restaurantes</option>
              {restaurants.map((r) => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
            </select>
            <span className="text-gray-400 text-sm">{filtered.length} productos</span>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <Loader className="w-7 h-7 text-orange-500 animate-spin" />
          </div>
        ) : (
          <AdminTable headers={['Producto', 'Categoría', 'Restaurante', 'Precio', 'Estado', 'Acciones']} rows={rows} emptyMessage="No hay productos con estos filtros" />
        )}
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editing}
        onSave={handleSave}
        restaurantes={restaurants}
        categorias={categoriasList}
      />
    </AdminLayout>
  );
}
