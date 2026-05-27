import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, Loader } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';
import StatusBadge from '../components/StatusBadge';
import ActionButton from '../components/ActionButton';
import OfferFormModal from '../components/OfferFormModal';
import type { AdminOffer } from '../types/backoffice.types';
import { API_BASE_URL } from '../../../config/api';

export default function AdminOffersPage() {
  const [offers, setOffers]     = useState<AdminOffer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<AdminOffer | null>(null);

  const token = () => localStorage.getItem('fb_token') ?? '';
  const authHeaders = () => ({
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/offers`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (json.success) setOffers(json.data as AdminOffer[]);
      else setError(json.message ?? 'Error al cargar ofertas.');
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openEdit   = (o: AdminOffer) => { setEditing(o); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setModalOpen(true); };

  const toggleActive = async (id: number) => {
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, activo: !o.activo } : o));
    try {
      await fetch(`${API_BASE_URL}/api/admin/offers/${id}/toggle`, { method: 'PATCH', headers: authHeaders() });
    } catch {
      setOffers((prev) => prev.map((o) => o.id === id ? { ...o, activo: !o.activo } : o));
    }
  };

  const handleSave = async (data: Partial<AdminOffer>) => {
    try {
      if (editing) {
        await fetch(`${API_BASE_URL}/api/admin/offers/${editing.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`${API_BASE_URL}/api/admin/offers`, {
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

  const rows = offers.map((o) => [
    <div>
      <p className="font-semibold text-gray-900 text-sm">{o.nombre}</p>
      <p className="text-gray-400 text-xs mt-0.5">{o.descripcion.slice(0, 45)}{o.descripcion.length > 45 ? '...' : ''}</p>
    </div>,
    <div className="flex flex-col gap-0.5">
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit ${o.tipoDescuento === 'Porcentaje' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
        {o.tipoDescuento === 'Porcentaje' ? `${o.valorDescuento}%` : `$${o.valorDescuento}`}
      </span>
      <span className="text-xs text-gray-400">{o.tipoDescuento}</span>
    </div>,
    o.codigoPromo ? (
      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200">{o.codigoPromo}</span>
    ) : <span className="text-gray-500 text-xs">—</span>,
    <span className="text-xs text-gray-600">{o.fechaInicio} → {o.fechaFin}</span>,
    <span className="text-xs text-gray-500 font-medium">{o.usosTotal} usos</span>,
    <StatusBadge status="" active={o.activo} />,
    <div className="flex items-center gap-1">
      <ActionButton onClick={() => openEdit(o)} icon={<Pencil size={14} />} label="Editar" />
      <ActionButton
        onClick={() => toggleActive(o.id)}
        icon={o.activo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        label={o.activo ? 'Desactivar' : 'Activar'}
        variant={o.activo ? 'warning' : 'success'}
      />
    </div>,
  ]);

  return (
    <AdminLayout title="Ofertas">
      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">{offers.length} ofertas configuradas</p>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            <Plus size={16} /> Nueva Oferta
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <Loader className="w-7 h-7 text-orange-500 animate-spin" />
          </div>
        ) : (
          <AdminTable headers={['Oferta', 'Descuento', 'Código', 'Vigencia', 'Uso', 'Estado', 'Acciones']} rows={rows} emptyMessage="No hay ofertas configuradas." />
        )}
      </div>

      <OfferFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        offer={editing}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}
