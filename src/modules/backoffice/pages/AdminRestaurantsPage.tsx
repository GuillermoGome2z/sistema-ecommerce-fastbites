import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, MapPin, Phone, Loader } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import ActionButton from '../components/ActionButton';
import RestaurantFormModal from '../components/RestaurantFormModal';
import type { AdminRestaurant } from '../types/backoffice.types';
import { API_BASE_URL } from '../../../config/api';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<AdminRestaurant | null>(null);

  const token = () => localStorage.getItem('fb_token') ?? '';
  const authHeaders = () => ({
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/restaurants`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (json.success) setRestaurants(json.data as AdminRestaurant[]);
      else setError(json.message ?? 'Error al cargar restaurantes.');
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (r: AdminRestaurant) => { setEditing(r); setModalOpen(true); };

  const toggleActive = async (id: number) => {
    setRestaurants((prev) => prev.map((r) => r.id === id ? { ...r, activo: !r.activo } : r));
    try {
      await fetch(`${API_BASE_URL}/api/admin/restaurants/${id}/toggle`, { method: 'PATCH', headers: authHeaders() });
    } catch {
      setRestaurants((prev) => prev.map((r) => r.id === id ? { ...r, activo: !r.activo } : r));
    }
  };

  const handleSave = async (data: Partial<AdminRestaurant>) => {
    try {
      if (editing) {
        await fetch(`${API_BASE_URL}/api/admin/restaurants/${editing.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`${API_BASE_URL}/api/admin/restaurants`, {
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

  return (
    <AdminLayout title="Restaurantes">
      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">{restaurants.length} restaurantes registrados</p>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            <Plus size={16} /> Nuevo Restaurante
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <Loader className="w-7 h-7 text-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((r) => (
              <div key={r.id} className={`bg-white rounded-2xl shadow-sm border ${r.activo ? 'border-gray-100' : 'border-gray-200 opacity-70'} p-5 space-y-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-gray-900">{r.nombre}</h3>
                    <StatusBadge status="" active={r.activo} />
                  </div>
                  <div className="flex gap-1">
                    <ActionButton onClick={() => openEdit(r)} icon={<Pencil size={14} />} label="Editar" />
                    <ActionButton
                      onClick={() => toggleActive(r.id)}
                      icon={r.activo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      label={r.activo ? 'Desactivar' : 'Activar'}
                      variant={r.activo ? 'warning' : 'success'}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                    <span>{r.direccion}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-orange-400 flex-shrink-0" />
                    <span>{r.telefono || '—'}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>{r.ciudad}</span>
                  <span>{r.totalProductos ?? 0} productos</span>
                </div>
              </div>
            ))}
            {!loading && restaurants.length === 0 && (
              <p className="text-gray-400 text-sm col-span-3 text-center py-10">No hay restaurantes registrados.</p>
            )}
          </div>
        )}
      </div>

      <RestaurantFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurant={editing}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}
