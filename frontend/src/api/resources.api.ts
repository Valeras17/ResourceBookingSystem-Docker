// src/api/resources.api.ts

import api from './axios.config';
import type { Resource, ResourceRequest } from '../types/resource.types';
import type { PageResponse } from '../types/booking.types';

export const resourcesAPI = {
  // Получить все ресурсы (публичный доступ)
  getAll: (page = 0, size = 20) =>
    api.get<PageResponse<Resource>>('/resources', {
      params: { page, size, sort: 'id' },
    }),

  // Поиск ресурсов
  search: (query: string, page = 0, size = 20) =>
    api.get<PageResponse<Resource>>('/resources/search', {
      params: { query, page, size },
    }),

  // Получить ресурс по ID (публичный доступ)
  getById: (id: number) =>
    api.get<Resource>(`/resources/${id}`),

  // Создать ресурс (только админ)
  create: (data: ResourceRequest) =>
    api.post<Resource>('/resources', data),

  // Обновить ресурс (только админ)
  update: (id: number, data: ResourceRequest) =>
    api.put<Resource>(`/resources/${id}`, data),

  // Удалить ресурс (только админ)
  delete: (id: number) =>
    api.delete(`/resources/${id}`),
};