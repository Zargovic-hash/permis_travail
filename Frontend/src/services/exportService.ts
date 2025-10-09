// ============================================
// EXPORT SERVICE - HSE PERMIT SYSTEM
// ============================================

import apiClient from '../api/client';
import { PermisFilters } from '../types';
import { generateExportFileName } from '../utils/formatters';

// ========== CSV EXPORT ==========

export const exportPermisCSV = async (filters: PermisFilters = {}): Promise<Blob> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await apiClient.get(`/reports/export-csv?${params.toString()}`, {
    responseType: 'blob'
  });
  
  return response;
};

export const downloadPermisCSV = async (filters: PermisFilters = {}): Promise<void> => {
  const blob = await exportPermisCSV(filters);
  const fileName = generateExportFileName('permis', 'csv');
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ========== JSON EXPORT ==========

export const exportToJSON = (data: any, fileName: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ========== EXCEL EXPORT ==========

export const convertToExcel = (data: any[]): void => {
  // Cette fonction nécessiterait une bibliothèque comme xlsx
  // Pour l'instant, on exporte en CSV
  console.warn('Excel export not implemented, using CSV instead');
};

// ========== DEFAULT EXPORT ==========
export default {
  exportPermisCSV,
  downloadPermisCSV,
  exportToJSON
};