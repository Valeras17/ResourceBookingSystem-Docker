// src/store/authStore.ts

import { create } from 'zustand';
import { authAPI } from '../api/auth.api';
import type { RegisterRequest, LoginRequest } from '../types/auth.types';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string; // email
  exp: number;
  iat: number;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userEmail: string | null;
  isAdmin: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  userEmail: null,
  isAdmin: false,

  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        
        if (isExpired) {
          localStorage.removeItem('token');
          set({ token: null, isAuthenticated: false, userEmail: null, isAdmin: false });
          toast.error('Session expired. Please login again.');
        } else {
          const isAdmin = decoded.sub === 'admin@booking.com';
          set({ 
            token, 
            isAuthenticated: true, 
            userEmail: decoded.sub,
            isAdmin 
          });
        }
      } catch (error) {
        localStorage.removeItem('token');
        set({ token: null, isAuthenticated: false, userEmail: null, isAdmin: false });
      }
    }
  },

  login: async (data: LoginRequest) => {
    try {
      const response = await authAPI.login(data);
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      
      const decoded = jwtDecode<DecodedToken>(token);
      const isAdmin = decoded.sub === 'admin@booking.com';
      
      set({ 
        token, 
        isAuthenticated: true, 
        userEmail: decoded.sub,
        isAdmin 
      });
      
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      const response = await authAPI.register(data);
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      
      const decoded = jwtDecode<DecodedToken>(token);
      
      set({ 
        token, 
        isAuthenticated: true, 
        userEmail: decoded.sub,
        isAdmin: false 
      });
      
      toast.success('Registration successful!');
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false, userEmail: null, isAdmin: false });
    toast.success('Logged out successfully');
  },
}));