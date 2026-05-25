export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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
