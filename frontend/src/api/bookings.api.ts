// src/api/bookings.api.ts

import api from './axios.config';
import type { BookingRequest, BookingResponse, PageResponse } from '../types/booking.types';

export const bookingsAPI = {
  // Создать бронирование
  create: (data: BookingRequest) =>
    api.post<BookingResponse>('/bookings', data),

  // Получить мои бронирования
  getMyBookings: (page = 0, size = 10) =>
    api.get<PageResponse<BookingResponse>>('/bookings/my', {
      params: { page, size, sort: 'startTime,desc' },
    }),

  // Получить все бронирования (только для админа)
  getAllBookings: (page = 0, size = 20) =>
    api.get<PageResponse<BookingResponse>>('/bookings', {
      params: { page, size, sort: 'startTime,desc' },
    }),

  // Получить бронирование по ID
  getById: (id: number) =>
    api.get<BookingResponse>(`/bookings/${id}`),

  // Обновить бронирование
  update: (id: number, data: BookingRequest) =>
    api.put<BookingResponse>(`/bookings/${id}`, data),

  // Удалить бронирование
  delete: (id: number) =>
    api.delete(`/bookings/${id}`),
};