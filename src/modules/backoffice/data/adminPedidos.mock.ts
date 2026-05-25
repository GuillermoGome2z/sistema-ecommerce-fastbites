import type { AdminOrder } from '../types/backoffice.types';

export const ADMIN_PEDIDOS_MOCK: AdminOrder[] = [
  {
    id: 'ord-001', numeroPedido: 'FB-20250525-001',
    clienteNombre: 'Valentina Torres', clienteEmail: 'valentina@gmail.com',
    restaurante: 'FastBites Centro', fecha: '2025-05-25T14:30:00Z',
    estado: 'Pendiente', metodoPago: 'Visa •••• 4242',
    direccionEntrega: 'Av. Insurgentes Sur 1234, CDMX',
    items: [
      { nombre: 'Hamburguesa Clásica', cantidad: 2, precioUnitario: 12.99, subtotal: 25.98, personalizacion: { tamano: 'Mediana', bebida: 'Coca-Cola', notas: 'Sin cebolla' } },
      { nombre: 'Papas Fritas', cantidad: 1, precioUnitario: 4.99, subtotal: 4.99 },
    ],
    subtotal: 30.97, descuento: 0, envio: 2.99, total: 33.96,
  },
  {
    id: 'ord-002', numeroPedido: 'FB-20250525-002',
    clienteNombre: 'Roberto Díaz', clienteEmail: 'roberto@gmail.com',
    restaurante: 'FastBites Norte', fecha: '2025-05-25T13:15:00Z',
    estado: 'EnPreparacion', metodoPago: 'Efectivo',
    direccionEntrega: 'Paseo de la Reforma 505, CDMX',
    items: [
      { nombre: 'Pizza Pepperoni', cantidad: 1, precioUnitario: 14.99, subtotal: 14.99, personalizacion: { tamano: 'Familiar' } },
      { nombre: 'Pizza Familiar', cantidad: 1, precioUnitario: 22.99, subtotal: 22.99 },
    ],
    subtotal: 37.98, descuento: 3.8, envio: 0, total: 34.18,
  },
  {
    id: 'ord-003', numeroPedido: 'FB-20250525-003',
    clienteNombre: 'Valentina Torres', clienteEmail: 'valentina@gmail.com',
    restaurante: 'FastBites Sur', fecha: '2025-05-25T09:00:00Z',
    estado: 'EnCamino', metodoPago: 'Mastercard •••• 8888',
    direccionEntrega: 'Morelos 88, CDMX',
    items: [
      { nombre: 'Combo Desayuno', cantidad: 2, precioUnitario: 9.99, subtotal: 19.98, personalizacion: { bebida: 'Jugo naranja' } },
    ],
    subtotal: 19.98, descuento: 0, envio: 2.99, total: 22.97,
  },
  {
    id: 'ord-004', numeroPedido: 'FB-20250524-004',
    clienteNombre: 'Luis Herrera', clienteEmail: 'luis@fastbites.com',
    restaurante: 'FastBites Centro', fecha: '2025-05-24T20:45:00Z',
    estado: 'Entregado', metodoPago: 'Visa •••• 4242',
    direccionEntrega: 'Av. Juárez 55, CDMX',
    items: [
      { nombre: 'Hamburguesa Doble Queso', cantidad: 2, precioUnitario: 16.49, subtotal: 32.98 },
      { nombre: 'Papas Fritas', cantidad: 2, precioUnitario: 4.99, subtotal: 9.98 },
    ],
    subtotal: 42.96, descuento: 4.3, envio: 0, total: 38.66,
  },
  {
    id: 'ord-005', numeroPedido: 'FB-20250524-005',
    clienteNombre: 'Sofía Ramírez', clienteEmail: 'sofia@gmail.com',
    restaurante: 'FastBites Norte', fecha: '2025-05-24T18:30:00Z',
    estado: 'Cancelado', metodoPago: 'Efectivo',
    direccionEntrega: 'Insurgentes Norte 300, CDMX',
    items: [
      { nombre: 'Wrap Mediterráneo', cantidad: 1, precioUnitario: 11.49, subtotal: 11.49 },
    ],
    subtotal: 11.49, descuento: 0, envio: 2.99, total: 14.48,
  },
  {
    id: 'ord-006', numeroPedido: 'FB-20250525-006',
    clienteNombre: 'Carlos Mendoza', clienteEmail: 'carlos@fastbites.com',
    restaurante: 'FastBites Centro', fecha: '2025-05-25T12:00:00Z',
    estado: 'Confirmado', metodoPago: 'Visa •••• 4242',
    direccionEntrega: 'Av. Juárez 100, CDMX',
    items: [
      { nombre: 'Pizza Pepperoni', cantidad: 2, precioUnitario: 14.99, subtotal: 29.98, personalizacion: { tamano: 'Grande', bebida: 'Sprite' } },
    ],
    subtotal: 29.98, descuento: 0, envio: 2.99, total: 32.97,
  },
  {
    id: 'ord-007', numeroPedido: 'FB-20250525-007',
    clienteNombre: 'María López', clienteEmail: 'maria@fastbites.com',
    restaurante: 'FastBites Sur', fecha: '2025-05-25T08:20:00Z',
    estado: 'Entregado', metodoPago: 'Mastercard •••• 8888',
    direccionEntrega: 'Del Valle, CDMX',
    items: [
      { nombre: 'Pancakes con Miel', cantidad: 2, precioUnitario: 8.49, subtotal: 16.98 },
      { nombre: 'Combo Desayuno', cantidad: 1, precioUnitario: 9.99, subtotal: 9.99 },
    ],
    subtotal: 26.97, descuento: 0, envio: 2.99, total: 29.96,
  },
  {
    id: 'ord-008', numeroPedido: 'FB-20250525-008',
    clienteNombre: 'Roberto Díaz', clienteEmail: 'roberto@gmail.com',
    restaurante: 'FastBites Norte', fecha: '2025-05-25T15:45:00Z',
    estado: 'Pendiente', metodoPago: 'Visa •••• 4242',
    direccionEntrega: 'Polanco, CDMX',
    items: [
      { nombre: 'Hamburguesa Clásica', cantidad: 1, precioUnitario: 12.99, subtotal: 12.99, personalizacion: { notas: 'Extra picante' } },
      { nombre: 'Wrap Mediterráneo', cantidad: 1, precioUnitario: 11.49, subtotal: 11.49 },
    ],
    subtotal: 24.48, descuento: 0, envio: 2.99, total: 27.47,
  },
];
