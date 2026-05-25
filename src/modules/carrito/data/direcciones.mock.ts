import type { Address } from '../types/cart.types';

export const DIRECCIONES_MOCK: Address[] = [
  {
    id: 1,
    alias: 'Casa',
    calle: 'Av. Insurgentes Sur 1234, Col. Del Valle',
    ciudad: 'Ciudad de México',
    codigoPostal: '03100',
    referencias: 'Edificio azul, portón negro, tercer piso',
    esPrincipal: true,
  },
  {
    id: 2,
    alias: 'Oficina',
    calle: 'Paseo de la Reforma 505, Col. Cuauhtémoc',
    ciudad: 'Ciudad de México',
    codigoPostal: '06600',
    referencias: 'Torre corporativa, piso 12, preguntar por recepción',
    esPrincipal: false,
  },
  {
    id: 3,
    alias: 'Casa de mamá',
    calle: 'Calle Morelos 88, Col. Santa María',
    ciudad: 'Ciudad de México',
    codigoPostal: '06400',
    referencias: 'Casa blanca con jardín, timbre izquierdo',
    esPrincipal: false,
  },
];
