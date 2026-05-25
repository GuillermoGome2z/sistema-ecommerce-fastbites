import type { AdminRole } from '../types/backoffice.types';

export const ADMIN_ROLES_MOCK: AdminRole[] = [
  {
    id: 1,
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema. Puede gestionar usuarios, productos, restaurantes, pedidos y configuraciones.',
    permisos: ['Gestionar usuarios', 'Gestionar roles', 'Gestionar restaurantes', 'Gestionar productos', 'Gestionar pedidos', 'Ver reportes', 'Gestionar ofertas', 'Configuración del sistema'],
    activo: true,
  },
  {
    id: 2,
    nombre: 'Supervisor',
    descripcion: 'Acceso de supervisión. Puede ver y gestionar pedidos, productos y generar reportes.',
    permisos: ['Gestionar productos', 'Gestionar pedidos', 'Ver reportes', 'Gestionar ofertas'],
    activo: true,
  },
  {
    id: 3,
    nombre: 'EmpleadoBackoffice',
    descripcion: 'Acceso operativo. Puede gestionar pedidos y actualizar estados de preparación.',
    permisos: ['Ver pedidos', 'Actualizar estado de pedidos', 'Ver productos'],
    activo: true,
  },
  {
    id: 4,
    nombre: 'Cliente',
    descripcion: 'Usuario final de la aplicación. Puede realizar pedidos, ver su historial y gestionar su perfil.',
    permisos: ['Realizar pedidos', 'Ver historial de pedidos', 'Gestionar perfil', 'Ver catálogo'],
    activo: true,
  },
];
