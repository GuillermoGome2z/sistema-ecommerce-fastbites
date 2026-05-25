import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { AdminOffer } from '../types/backoffice.types';

interface Props {
  open: boolean;
  onClose: () => void;
  offer?: AdminOffer | null;
  onSave: (data: Partial<AdminOffer>) => void;
}

export default function OfferFormModal({ open, onClose, offer, onSave }: Props) {
  const [form, setForm] = useState({
    nombre: '', descripcion: '', tipoDescuento: 'Porcentaje' as 'Porcentaje' | 'MontoFijo',
    valorDescuento: '', codigoPromo: '', fechaInicio: '', fechaFin: '', activo: true,
  });

  useEffect(() => {
    if (offer) {
      setForm({
        nombre: offer.nombre, descripcion: offer.descripcion, tipoDescuento: offer.tipoDescuento,
        valorDescuento: String(offer.valorDescuento), codigoPromo: offer.codigoPromo ?? '',
        fechaInicio: offer.fechaInicio, fechaFin: offer.fechaFin, activo: offer.activo,
      });
    } else {
      setForm({ nombre: '', descripcion: '', tipoDescuento: 'Porcentaje', valorDescuento: '', codigoPromo: '', fechaInicio: '', fechaFin: '', activo: true });
    }
  }, [offer, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, valorDescuento: Number(form.valorDescuento) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900">{offer ? 'Editar Oferta' : 'Nueva Oferta'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Nombre</label>
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" placeholder="Nombre de la oferta" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Tipo</label>
              <select value={form.tipoDescuento} onChange={(e) => setForm({ ...form, tipoDescuento: e.target.value as 'Porcentaje' | 'MontoFijo' })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white">
                <option value="Porcentaje">Porcentaje (%)</option>
                <option value="MontoFijo">Monto Fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Valor</label>
              <input required type="number" step="0.01" min="0" value={form.valorDescuento} onChange={(e) => setForm({ ...form, valorDescuento: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Fecha inicio</label>
              <input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Fecha fin</label>
              <input type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Código promocional</label>
            <input value={form.codigoPromo} onChange={(e) => setForm({ ...form, codigoPromo: e.target.value.toUpperCase() })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors font-mono" placeholder="CODIGO10" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="w-4 h-4 accent-orange-500" />
            Oferta activa
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
