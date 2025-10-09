import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { QUERY_KEYS, CACHE_TIMES } from '../utils/constants';
import { AuditLog, AuditLogFilters, PaginatedResponse } from '../types';

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  return useQuery<PaginatedResponse<AuditLog>>({
    queryKey: [QUERY_KEYS.AUDIT_LOGS, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      return apiClient.get(`/audit-logs?${params.toString()}`);
    },
    staleTime: CACHE_TIMES.SHORT
  });
};