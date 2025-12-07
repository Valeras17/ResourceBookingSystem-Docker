// src/api/auth.api.ts

import api from './axios.config';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth.types';

export const authAPI = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/authenticate', data),
};