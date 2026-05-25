import type { AdminUser } from '../types/backoffice.types';

export const ADMIN_USUARIOS_MOCK: AdminUser[] = [
  { id: 1, nombre: 'Ana García', email: 'ana@fastbites.com', rol: 'Administrador', activo: true, fechaCreacion: '2024-01-15', ultimoAcceso: '2025-05-24' },
  { id: 2, nombre: 'Carlos Mendoza', email: 'carlos@fastbites.com', rol: 'Supervisor', activo: true, fechaCreacion: '2024-02-20', ultimoAcceso: '2025-05-23' },
  { id: 3, nombre: 'María López', email: 'maria@fastbites.com', rol: 'EmpleadoBackoffice', activo: true, fechaCreacion: '2024-03-10', ultimoAcceso: '2025-05-22' },
  { id: 4, nombre: 'Pedro Sánchez', email: 'pedro@fastbites.com', rol: 'EmpleadoBackoffice', activo: false, fechaCreacion: '2024-04-05', ultimoAcceso: '2025-04-15' },
  { id: 5, nombre: 'Valentina Torres', email: 'valentina@gmail.com', rol: 'Cliente', activo: true, fechaCreacion: '2024-05-12', ultimoAcceso: '2025-05-24' },
  { id: 6, nombre: 'Roberto Díaz', email: 'roberto@gmail.com', rol: 'Cliente', activo: true, fechaCreacion: '2024-06-18', ultimoAcceso: '2025-05-20' },
  { id: 7, nombre: 'Sofía Ramírez', email: 'sofia@gmail.com', rol: 'Cliente', activo: false, fechaCreacion: '2024-07-22', ultimoAcceso: '2025-03-10' },
  { id: 8, nombre: 'Luis Herrera', email: 'luis@fastbites.com', rol: 'Supervisor', activo: true, fechaCreacion: '2024-08-30', ultimoAcceso: '2025-05-25' },
];
