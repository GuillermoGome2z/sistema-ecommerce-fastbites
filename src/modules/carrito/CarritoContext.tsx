import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { CartItem, Address, PaymentMethod, CartTotals, LastOrder } from './types/cart.types';
import { CARRITO_MOCK } from './data/carrito.mock';
import { DIRECCIONES_MOCK } from './data/direcciones.mock';
import { METODOS_PAGO_MOCK } from './data/metodosPago.mock';

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
  confirmarPedido: () => string;
}

const CarritoContext = createContext<CarritoContextType | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(CARRITO_MOCK);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    DIRECCIONES_MOCK.find((d) => d.esPrincipal) ?? null
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    METODOS_PAGO_MOCK.find((m) => m.esPrincipal) ?? null
  );
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

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

  const confirmarPedido = (): string => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 900 + 100).toString();
    const numero = `FB-${dateStr}-${rand}`;
    setLastOrder({
      numeroPedido: numero,
      direccion: selectedAddress,
      metodoPago: selectedPayment,
      totales: { ...totales },
    });
    setItems([]);
    return numero;
  };

  return (
    <CarritoContext.Provider
      value={{
        items,
        direcciones: DIRECCIONES_MOCK,
        metodosPago: METODOS_PAGO_MOCK,
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
