export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface JwtPayload {
  usuarioId: number;
  email: string;
  nombreCompleto: string;
  roles: string[];
}

export interface UsuarioRow {
  UsuarioId: number;
  Email: string;
  PasswordHash: string;
  NombreCompleto: string;
  Activo: boolean;
  IntentosFallidosLogin: number;
  BloqueadoHasta: Date | null;
  EmailVerificado: boolean;
}

// ─── Enums de dominio (valores exactos de los CHECK de la BD) ──
export type EstadoPedido = 'Pendiente' | 'Confirmado' | 'EnPreparacion' | 'EnCamino' | 'Entregado' | 'Cancelado';
export type EstadoPago   = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Reembolsado';
export type TipoEntrega  = 'Domicilio' | 'Recoger';

export const ESTADOS_PEDIDO: EstadoPedido[] = ['Pendiente','Confirmado','EnPreparacion','EnCamino','Entregado','Cancelado'];
export const ESTADOS_PAGO:   EstadoPago[]   = ['Pendiente','Aprobado','Rechazado','Reembolsado'];

export interface ClienteRow {
  ClienteId: number;
  UsuarioId: number;
  Nombre: string;
  Apellido: string;
  Telefono: string | null;
  FechaNacimiento: Date | null;
  Activo: boolean;
}

export interface DireccionRow {
  DireccionId: number;
  ClienteId: number;
  Alias: string;
  Calle: string;
  NumeroExterior: string | null;
  NumeroInterior: string | null;
  Colonia: string | null;
  Ciudad: string;
  Estado: string;
  CodigoPostal: string;
  Referencias: string | null;
  Latitud: number | null;
  Longitud: number | null;
  EsPrincipal: boolean;
}

export interface Producto {
  ProductoId: number;
  Nombre: string;
  Descripcion: string | null;
  PrecioBase: number;
  Categoria: string;
  Restaurante: string;
  EsDestacado: boolean;
  Activo: boolean;
}

export interface VentaPorDia {
  Fecha: string;
  RestauranteId: number;
  Restaurante: string;
  TotalPedidos: number;
  TotalSubtotal: number;
  TotalDescuento: number;
  TotalEnvio: number;
  TotalVentas: number;
}

export interface VentaPorHora {
  Fecha: string;
  Hora: number;
  RestauranteId: number;
  Restaurante: string;
  TotalPedidos: number;
  TotalVentas: number;
}

export interface VentaPorDaypart {
  Fecha: string;
  DaypartId: number;
  Daypart: string;
  RestauranteId: number;
  Restaurante: string;
  TotalPedidos: number;
  TotalVentas: number;
}
