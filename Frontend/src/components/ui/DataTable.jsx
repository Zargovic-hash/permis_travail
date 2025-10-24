// ============================================
// FICHIER 8: src/components/ui/DataTable.jsx
// ============================================
import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Pagination from './Pagination';
import { Skeleton } from './Skeleton';

export default function DataTable({ 
  columns = [],
  data = [],
  loading = false,
  pagination,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
  emptyMessage = 'Aucune donnée disponible',
  className = ''
}) {
  const handleSort = (columnKey) => {
    if (onSort && columns.find(col => col.key === columnKey)?.sortable) {
      onSort(columnKey);
    }
  };

  const renderSortIcon = (columnKey) => {
    if (sortColumn === columnKey) {
      return sortDirection === 'asc' 
        ? <ChevronUp className="w-4 h-4" />
        : <ChevronDown className="w-4 h-4" />;
    }
    return <ChevronsUpDown className="w-4 h-4 opacity-30" />;
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {[...Array(5)].map((_, idx) => (
                <tr key={idx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-5 py-4">
                      <Skeleton height="20px" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider ${
                      col.sortable ? 'cursor-pointer select-none hover:bg-slate-100 transition-colors' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {col.sortable && renderSortIcon(col.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center">
                    <p className="text-sm text-slate-500">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-4 text-sm text-slate-900">
                        {col.render ? col.render(row, rowIndex) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

