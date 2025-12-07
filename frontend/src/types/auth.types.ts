// src/types/auth.types.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

// Структура данных внутри JWT токена
export interface JwtPayload {
  sub: string; // email
  role?: string;
  roles?: string[];
  exp: number;
  iat: number;
}