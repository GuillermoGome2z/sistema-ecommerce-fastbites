import { useState, useEffect, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { AdminProduct, AdminRestaurant } from '../types/backoffice.types';
import { CATEGORIAS_ADMIN } from '../data/adminProductos.mock';
import { ADMIN_RESTAURANTES_MOCK } from '../data/adminRestaurantes.mock';

interface Props {
  open: boolean;
  onClose: () => void;
  product?: AdminProduct | null;
  onSave: (data: Partial<AdminProduct>) => void;
  restaurantes?: AdminRestaurant[];
  categorias?: string[];
}

export default function ProductFormModal({ open, onClose, product, onSave, restaurantes, categorias }: Props) {
  const restList = restaurantes && restaurantes.length > 0 ? restaurantes : ADMIN_RESTAURANTES_MOCK;
  const catList  = categorias  && categorias.length  > 0 ? categorias  : CATEGORIAS_ADMIN;

  const [form, setForm] = useState({
    nombre: '', descripcion: '', precioBase: '', categoria: catList[0] ?? 'Almuerzo',
    restauranteId: String(restList[0]?.id ?? 1), imagen: '', calorias: '', tiempoPreparacion: '',
    esDestacado: false, activo: true,
  });

  useEffect(() => {
    if (product) {
      setForm({
        nombre: product.nombre, descripcion: product.descripcion,
        precioBase: String(product.precioBase), categoria: product.categoria,
        restauranteId: String(product.restauranteId), imagen: product.imagen,
        calorias: String(product.calorias), tiempoPreparacion: String(product.tiempoPreparacion),
        esDestacado: product.esDestacado, activo: product.activo,
      });
    } else {
      setForm({
        nombre: '', descripcion: '', precioBase: '',
        categoria: catList[0] ?? 'Almuerzo',
        restauranteId: String(restList[0]?.id ?? 1),
        imagen: '', calorias: '', tiempoPreparacion: '',
        esDestacado: false, activo: true,
      });
    }
  }, [product, open]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const rest = restList.find((r) => r.id === Number(form.restauranteId));
    onSave({
      ...form,
      precioBase:        Number(form.precioBase),
      restauranteId:     Number(form.restauranteId),
      restaurante:       rest?.nombre ?? '',
      calorias:          Number(form.calorias),
      tiempoPreparacion: Number(form.tiempoPreparacion),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Nombre</label>
              <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" placeholder="Nombre del producto" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors resize-none" placeholder="Descripción breve" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Precio ($)</label>
              <input required type="number" step="0.01" min="0" value={form.precioBase} onChange={(e) => setForm({ ...form, precioBase: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Categoría</label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white">
                {catList.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Restaurante</label>
              <select value={form.restauranteId} onChange={(e) => setForm({ ...form, restauranteId: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white">
                {restList.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Calorías</label>
              <input type="number" min="0" value={form.calorias} onChange={(e) => setForm({ ...form, calorias: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">URL de imagen</label>
              <input value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors" placeholder="https://..." />
            </div>
            <div className="col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input type="checkbox" checked={form.esDestacado} onChange={(e) => setForm({ ...form, esDestacado: e.target.checked })} className="w-4 h-4 accent-orange-500" />
                Producto Destacado
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="w-4 h-4 accent-orange-500" />
                Activo
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-300 font-medium text-sm transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
