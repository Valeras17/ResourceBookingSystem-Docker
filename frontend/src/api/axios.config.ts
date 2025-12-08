// src/api/axios.config.ts

import axios from 'axios';
import toast from 'react-hot-toast';

// Используем переменную окружения или захардкоженный URL для production
const API_URL = import.meta.env.VITE_API_URL || 'https://resourcebookingsystem-docker-1.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Автоматически добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Insufficient permissions');
    } else if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      Object.values(errors).forEach((msg) => {
        toast.error(msg as string);
      });
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An error occurred. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export default api;