export type OrderStatus =
  | 'Pendiente'
  | 'Confirmado'
  | 'EnPreparacion'
  | 'EnCamino'
  | 'Entregado'
  | 'Cancelado';

export type CheckoutStep = 'carrito' | 'direccion' | 'pago' | 'confirmacion';
export type PaymentType = 'tarjeta' | 'efectivo';

export interface CartProduct {
  id: number;
  nombre: string;
  imagen: string;
  precioBase: number;
  categoria: string;
}

export interface CartItemPersonalizacion {
  tamano?: string;
  bebida?: string;
  complementos?: string[];
  ingredientesAdicionales?: string[];
  notas?: string;
}

export interface CartItem {
  id: string;
  producto: CartProduct;
  cantidad: number;
  personalizacion?: CartItemPersonalizacion;
  precioUnitario: number;
  subtotal: number;
}

export interface CartTotals {
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
}

export interface Address {
  id: number;
  alias: string;
  calle: string;
  ciudad: string;
  codigoPostal: string;
  referencias?: string;
  esPrincipal: boolean;
}

export interface PaymentMethod {
  id: number;
  tipoPagoId: number;
  tipo: PaymentType;
  alias: string;
  ultimosDigitos?: string;
  banco?: string;
  esPrincipal: boolean;
}

export interface OrderProduct {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  personalizacion?: CartItemPersonalizacion;
}

export interface Order {
  id: string;
  numeroPedido: string;
  fecha: string;
  estado: OrderStatus;
  productos: OrderProduct[];
  direccion: Address;
  metodoPago: PaymentMethod;
  totales: CartTotals;
  restaurante: string;
  tiempoEstimado: number;
}

export interface LastOrder {
  numeroPedido: string;
  direccion: Address | null;
  metodoPago: PaymentMethod | null;
  totales: CartTotals;
}
