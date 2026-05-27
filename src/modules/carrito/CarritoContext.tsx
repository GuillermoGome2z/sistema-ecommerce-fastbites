import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import type { CartItem, Address, PaymentMethod, CartTotals, LastOrder, PaymentType } from './types/cart.types';
import { DIRECCIONES_MOCK } from './data/direcciones.mock';
import { METODOS_PAGO_MOCK } from './data/metodosPago.mock';
import { API_BASE_URL } from '../../config/api';

interface CarritoContextType {
  items: CartItem[];
  direcciones: Address[];
  metodosPago: PaymentMethod[];
  selectedAddress: Address | null;
  selectedPayment: PaymentMethod | null;
  totales: CartTotals;
  lastOrder: LastOrder | null;
  incrementar: (id: string) => void;
  decrementar: (id: string) => void;
  eliminar: (id: string) => void;
  setSelectedAddress: (a: Address) => void;
  setSelectedPayment: (p: PaymentMethod) => void;
  confirmarPedido: () => Promise<string>;
}

// ── Backend shape adapters ────────────────────────────────────────
interface BackendAddress {
  DireccionId: number;
  Alias: string | null;
  Calle: string;
  NumeroExterior: string | null;
  Colonia: string | null;
  Ciudad: string;
  CodigoPostal: string;
  Referencias: string | null;
  EsPrincipal: boolean | number;
}

interface BackendPaymentMethod {
  MetodoPagoId: number;
  TipoPagoId: number;
  NombreTipo: string;
  Alias: string | null;
  Ultimos4Digitos: string | null;
  MarcaTarjeta: string | null;
  EsPrincipal: boolean | number;
}

function adaptarDireccion(d: BackendAddress): Address {
  const partes = [d.Calle, d.NumeroExterior, d.Colonia].filter(Boolean);
  return {
    id:            d.DireccionId,
    alias:         d.Alias ?? 'Dirección',
    calle:         partes.join(', '),
    ciudad:        d.Ciudad,
    codigoPostal:  d.CodigoPostal,
    referencias:   d.Referencias ?? undefined,
    esPrincipal:   Boolean(d.EsPrincipal),
  };
}

interface BackendCartItem {
  carritoDetalleId: number;
  productoId:       number;
  nombreProducto:   string;
  tamanioId:        number | null;
  nombreTamanio:    string | null;
  cantidad:         number;
  precioUnitario:   number;
  subtotalItem:     number;
  notas:            string | null;
}

function adaptarCartItem(i: BackendCartItem): CartItem {
  return {
    id:              String(i.carritoDetalleId),
    producto: {
      id:         i.productoId,
      nombre:     i.nombreProducto,
      imagen:     '',
      precioBase: i.precioUnitario,
      categoria:  '',
    },
    cantidad:        i.cantidad,
    personalizacion: {
      tamano: i.nombreTamanio ?? undefined,
      notas:  i.notas ?? undefined,
    },
    precioUnitario:  i.precioUnitario,
    subtotal:        i.subtotalItem,
  };
}

function adaptarMetodoPago(m: BackendPaymentMethod): PaymentMethod {
  const tipo: PaymentType = m.NombreTipo.toLowerCase().includes('tarjeta') ? 'tarjeta' : 'efectivo';
  return {
    id:              m.MetodoPagoId,
    tipoPagoId:      m.TipoPagoId,
    tipo,
    alias:           m.Alias ?? m.NombreTipo,
    ultimosDigitos:  m.Ultimos4Digitos ?? undefined,
    banco:           m.MarcaTarjeta ?? undefined,
    esPrincipal:     Boolean(m.EsPrincipal),
  };
}

const CarritoContext = createContext<CarritoContextType | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [direcciones, setDirecciones] = useState<Address[]>(DIRECCIONES_MOCK);
  const [metodosPago, setMetodosPago] = useState<PaymentMethod[]>(METODOS_PAGO_MOCK);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    DIRECCIONES_MOCK.find((d) => d.esPrincipal) ?? null
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    METODOS_PAGO_MOCK.find((m) => m.esPrincipal) ?? null
  );
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  // Load cart, addresses, and payment methods if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('fb_token');
    if (!token) return;

    const headers: HeadersInit = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE_URL}/api/cart`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/customers/me/addresses`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/customers/me/payment-methods`, { headers }).then((r) => r.json()),
    ])
      .then(([cartJson, addrJson, payJson]) => {
        if (cartJson.success && Array.isArray(cartJson.data.items) && cartJson.data.items.length > 0) {
          setItems((cartJson.data.items as BackendCartItem[]).map(adaptarCartItem));
        }
        if (addrJson.success && Array.isArray(addrJson.data) && addrJson.data.length > 0) {
          const adapted = (addrJson.data as BackendAddress[]).map(adaptarDireccion);
          setDirecciones(adapted);
          setSelectedAddress(adapted.find((d) => d.esPrincipal) ?? adapted[0]);
        }
        if (payJson.success && Array.isArray(payJson.data) && payJson.data.length > 0) {
          const adapted = (payJson.data as BackendPaymentMethod[]).map(adaptarMetodoPago);
          setMetodosPago(adapted);
          setSelectedPayment(adapted.find((m) => m.esPrincipal) ?? adapted[0]);
        }
      })
      .catch(() => {});
  }, []);

  const totales = useMemo<CartTotals>(() => {
    const subtotal = parseFloat(items.reduce((s, i) => s + i.subtotal, 0).toFixed(2));
    const descuento = subtotal > 40 ? parseFloat((subtotal * 0.1).toFixed(2)) : 0;
    const envio = subtotal > 30 ? 0 : 2.99;
    return {
      subtotal,
      descuento,
      envio,
      total: parseFloat((subtotal - descuento + envio).toFixed(2)),
    };
  }, [items]);

  const incrementar = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: item.cantidad + 1,
              subtotal: parseFloat(((item.cantidad + 1) * item.precioUnitario).toFixed(2)),
            }
          : item
      )
    );
  };

  const decrementar = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.cantidad > 1
          ? {
              ...item,
              cantidad: item.cantidad - 1,
              subtotal: parseFloat(((item.cantidad - 1) * item.precioUnitario).toFixed(2)),
            }
          : item
      )
    );
  };

  const eliminar = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const confirmarPedido = async (): Promise<string> => {
    const token = localStorage.getItem('fb_token');
    if (!token) throw new Error('Debes iniciar sesión para confirmar el pedido.');
    if (!selectedPayment) throw new Error('Selecciona un método de pago.');

    const headers: HeadersInit = {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 1. Clear any existing backend cart
    await fetch(`${API_BASE_URL}/api/cart`, { method: 'DELETE', headers }).catch(() => {});

    // 2. Sync local items to backend cart
    for (const item of items) {
      const r = await fetch(`${API_BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productoId: item.producto.id, cantidad: item.cantidad }),
      });
      const json = await r.json();
      if (!json.success) throw new Error(json.message ?? 'Error al sincronizar el carrito con el servidor.');
    }

    // 3. Create the order
    const body: Record<string, unknown> = {
      tipoPagoId:  selectedPayment.tipoPagoId,
      metodoPagoId: selectedPayment.id,
    };
    if (selectedAddress) {
      body.direccionId = selectedAddress.id;
    } else {
      body.tipoEntrega = 'Recoger';
    }

    const orderRes = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const orderJson = await orderRes.json();
    if (!orderJson.success) throw new Error(orderJson.message ?? 'Error al crear el pedido.');

    const pedidoId: number = orderJson.data.pedidoId;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const numero = `FB-${dateStr}-${String(pedidoId).padStart(3, '0')}`;

    setLastOrder({
      numeroPedido: numero,
      direccion:   selectedAddress,
      metodoPago:  selectedPayment,
      totales:     { ...totales },
    });
    setItems([]);
    return numero;
  };

  return (
    <CarritoContext.Provider
      value={{
        items,
        direcciones,
        metodosPago,
        selectedAddress,
        selectedPayment,
        totales,
        lastOrder,
        incrementar,
        decrementar,
        eliminar,
        setSelectedAddress,
        setSelectedPayment,
        confirmarPedido,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return ctx;
}
