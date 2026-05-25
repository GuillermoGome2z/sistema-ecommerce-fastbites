import type { AdminRestaurant } from '../types/backoffice.types';

export const ADMIN_RESTAURANTES_MOCK: AdminRestaurant[] = [
  {
    id: 1,
    nombre: 'FastBites Centro',
    direccion: 'Av. Juárez 100, Centro Histórico',
    ciudad: 'Ciudad de México',
    telefono: '+52 55 1234-5678',
    activo: true,
    totalProductos: 12,
  },
  {
    id: 2,
    nombre: 'FastBites Norte',
    direccion: 'Blvd. Manuel Ávila Camacho 55, Polanco',
    ciudad: 'Ciudad de México',
    telefono: '+52 55 8765-4321',
    activo: true,
    totalProductos: 8,
  },
  {
    id: 3,
    nombre: 'FastBites Sur',
    direccion: 'Insurgentes Sur 900, Col. Del Valle',
    ciudad: 'Ciudad de México',
    telefono: '+52 55 9876-5432',
    activo: false,
    totalProductos: 6,
  },
];
