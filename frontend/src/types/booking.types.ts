// src/types/booking.types.ts

export interface BookingRequest {
  resourceId: number;
  startTime: string; // ISO 8601 format
  endTime: string;
}

export interface BookingResponse {
  id: number;
  resourceId: number;
  resourceName: string;
  startTime: string;
  endTime: string;
  userEmail: string;
  userId: number;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
}