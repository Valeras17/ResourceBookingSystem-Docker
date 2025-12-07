// src/utils/dateUtils.ts

import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch {
    return dateString;
  }
};

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy', { locale: ru });
  } catch {
    return dateString;
  }
};

export const formatTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'HH:mm', { locale: ru });
  } catch {
    return dateString;
  }
};

// Для MUI DateTimePicker (конвертация в ISO)
export const toISOString = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString();
};