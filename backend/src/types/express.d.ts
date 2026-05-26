// Extiende el tipo Request de Express para incluir el usuario autenticado
declare namespace Express {
  interface Request {
    user?: {
      usuarioId: number;
      email: string;
      nombreCompleto: string;
      roles: string[];
    };
  }
}
