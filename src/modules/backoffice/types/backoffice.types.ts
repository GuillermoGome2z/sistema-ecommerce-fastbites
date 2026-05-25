export type AdminOrderStatus =
  | 'Pendiente'
  | 'Confirmado'
  | 'EnPreparacion'
  | 'EnCamino'
  | 'Entregado'
  | 'Cancelado';

export type AdminRoleName =
  | 'Cliente'
  | 'Administrador'
  | 'EmpleadoBackoffice'
  | 'Supervisor';

export type DescuentoTipo = 'Porcentaje' | 'MontoFijo';

export interface AdminRole {
  id: number;
  nombre: AdminRoleName;
  descripcion: string;
  permisos: string[];
  activo: boolean;
}

export interface AdminUser {
  id: number;
  nombre: string;
  email: string;
  rol: AdminRoleName;
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
}

export interface AdminRestaurant {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  activo: boolean;
  totalProductos?: number;
}

export interface AdminProduct {
  id: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  categoria: string;
  restauranteId: number;
  restaurante: string;
  imagen: string;
  activo: boolean;
  esDestacado: boolean;
  calorias: number;
  tiempoPreparacion: number;
}

export interface AdminOffer {
  id: number;
  nombre: string;
  descripcion: string;
  tipoDescuento: DescuentoTipo;
  valorDescuento: number;
  codigoPromo?: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  productosAplicados: number[];
  usosTotal: number;
}

export interface AdminOrderItem {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  personalizacion?: {
    tamano?: string;
    bebida?: string;
    notas?: string;
  };
}

export interface AdminOrder {
  id: string;
  numeroPedido: string;
  clienteNombre: string;
  clienteEmail: string;
  restaurante: string;
  fecha: string;
  estado: AdminOrderStatus;
  items: AdminOrderItem[];
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  metodoPago: string;
  direccionEntrega: string;
}

export interface Daypart {
  id: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  productosCount: number;
  emoji: string;
  descripcion: string;
}

export interface DashboardStats {
  totalPedidosHoy: number;
  ventasHoy: number;
  productosActivos: number;
  restaurantesActivos: number;
  ofertasActivas: number;
  pedidosPendientes: number;
}
