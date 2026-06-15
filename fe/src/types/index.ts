export interface LoginResponse {
  access_token: string;
  token_type: string;
  rol: string;
  nombre: string;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol?: string;
  tipo?: 'cliente' | 'usuario';
}