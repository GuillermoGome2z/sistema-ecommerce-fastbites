import type { PaymentMethod } from '../types/cart.types';

export const METODOS_PAGO_MOCK: PaymentMethod[] = [
  {
    id: 1,
    tipoPagoId: 1,
    tipo: 'tarjeta',
    alias: 'Visa principal',
    ultimosDigitos: '4242',
    banco: 'BBVA',
    esPrincipal: true,
  },
  {
    id: 2,
    tipoPagoId: 1,
    tipo: 'tarjeta',
    alias: 'Mastercard',
    ultimosDigitos: '8888',
    banco: 'Santander',
    esPrincipal: false,
  },
  {
    id: 3,
    tipoPagoId: 2,
    tipo: 'efectivo',
    alias: 'Efectivo contra entrega',
    esPrincipal: false,
  },
];
