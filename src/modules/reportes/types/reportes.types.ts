export type ModuleStatusType = 'Completado' | 'EnProgreso' | 'Pendiente' | 'Bloqueado';
export type DaypartName = 'Desayuno' | 'Almuerzo' | 'Cena';

export interface VentaPorDia {
  Fecha: string;
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
  Restaurante: string;
  TotalPedidos: number;
  TotalVentas: number;
}

export interface VentaPorDaypart {
  Fecha: string;
  Daypart: DaypartName;
  Restaurante: string;
  TotalPedidos: number;
  TotalVentas: number;
}

export interface ReportSummary {
  totalVentas: number;
  totalPedidos: number;
  ticketPromedio: number;
  daypartMasVendido: DaypartName;
  horaMasVentas: number;
}

export interface IntegrationStatus {
  id: string;
  nombre: string;
  descripcion: string;
  estado: ModuleStatusType;
  responsable: string;
  dependencias: string[];
  observaciones: string;
  icono: string;
}

export interface ModuleStatus {
  id: number;
  modulo: string;
  version: string;
  estado: ModuleStatusType;
  responsable: string;
  archivos: number;
  descripcion: string;
  dependencias: string[];
  observaciones: string;
}

export interface ReportFilter {
  restaurante: string;
  fechaInicio: string;
  fechaFin: string;
  hora?: number | null;
  daypart?: DaypartName | null;
}
