export type Categoria = 'Desayuno' | 'Almuerzo' | 'Cena';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  categoria: Categoria;
  imagen: string;
  calorias: number;
  tiempoPreparacion: number;
  esDestacado: boolean;
  activo: boolean;
}
