import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Pagination } from './Pagination';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  rowKey?: (row: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
  pagination,
  onPageChange,
  onSort,
  rowKey = (row) => row.id
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (!onSort) return;

    let newDirection: 'asc' | 'desc' = 'asc';
    
    if (sortKey === key) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortKey(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <EmptyState 
          title="Aucun résultat"
          message={emptyMessage}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  } ${column.width || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && (
        <div className="border-t border-gray-200 px-6 py-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}