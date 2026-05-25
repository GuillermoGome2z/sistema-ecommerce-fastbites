import type { CartItem } from '../types/cart.types';

export const CARRITO_MOCK: CartItem[] = [
  {
    id: 'cart-1',
    producto: {
      id: 1,
      nombre: 'Hamburguesa Clásica',
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
      precioBase: 12.99,
      categoria: 'Almuerzo',
    },
    cantidad: 2,
    personalizacion: {
      tamano: 'Mediana',
      bebida: 'Coca-Cola',
      complementos: ['Papas Fritas'],
      ingredientesAdicionales: ['Queso extra'],
      notas: 'Sin cebolla por favor',
    },
    precioUnitario: 12.99,
    subtotal: 25.98,
  },
  {
    id: 'cart-2',
    producto: {
      id: 2,
      nombre: 'Pizza Pepperoni',
      imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
      precioBase: 14.99,
      categoria: 'Cena',
    },
    cantidad: 1,
    personalizacion: {
      tamano: 'Familiar',
      bebida: 'Sprite',
      complementos: [],
      ingredientesAdicionales: ['Extra pepperoni'],
      notas: '',
    },
    precioUnitario: 14.99,
    subtotal: 14.99,
  },
  {
    id: 'cart-3',
    producto: {
      id: 5,
      nombre: 'Papas Fritas',
      imagen: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80',
      precioBase: 4.99,
      categoria: 'Almuerzo',
    },
    cantidad: 1,
    personalizacion: {
      complementos: [],
      notas: 'Bien crujientes',
    },
    precioUnitario: 4.99,
    subtotal: 4.99,
  },
];
