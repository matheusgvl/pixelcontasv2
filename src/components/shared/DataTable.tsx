import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchField?: keyof T;
  onRowClick?: (row: T) => void;
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    action: (selectedRows: T[]) => void;
    variant?: 'primary' | 'outline' | 'danger';
  }[];
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'Buscar...',
  searchField,
  onRowClick,
  bulkActions
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchField) return data;
    
    return data.filter(row => {
      const value = row[searchField];
      if (value === undefined || value === null) return false;
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchField]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    const sorted = [...filteredData].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof T];
      let bValue: any = b[sortConfig.key as keyof T];
      
      // If accessor is a function, we sort by key from sortConfig
      if (typeof aValue === 'object' || aValue === undefined) {
        return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sorted;
  }, [filteredData, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Sorting Handler
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(paginatedData.map(row => row.id));
      setSelectedIds(newSelected);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const selectedRows = useMemo(() => {
    return data.filter(row => selectedIds.has(row.id));
  }, [data, selectedIds]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Table Controls (Search & Bulk Actions) */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {searchField ? (
          <div className="w-full sm:max-w-xs">
            <Input
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              icon={<Search className="h-4.5 w-4.5" />}
            />
          </div>
        ) : <div />}

        {/* Selected Counter & Bulk Action Buttons */}
        {selectedIds.size > 0 && bulkActions && (
          <div className="flex items-center gap-3 w-full sm:w-auto bg-black-soft/80 border border-primary/20 px-4 py-2 rounded-soft justify-between sm:justify-start">
            <span className="text-xs font-semibold text-text-primary font-title">
              {selectedIds.size} selecionado(s)
            </span>
            <div className="flex gap-2">
              {bulkActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => {
                    action.action(selectedRows);
                    setSelectedIds(new Set());
                  }}
                  icon={action.icon}
                  className="!py-1.5 !px-3 text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Table Wrapper */}
      <div className="w-full overflow-x-auto border border-border rounded-premium bg-white shadow-premium">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white">
              {bulkActions && (
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(row => selectedIds.has(row.id))}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded text-black focus:ring-primary/40 border-border accent-black"
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => col.sortable && col.sortKey && handleSort(col.sortKey)}
                  className={`p-4 text-xs font-bold font-title tracking-wider ${col.sortable ? 'cursor-pointer select-none hover:bg-black/90' : ''} ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && sortConfig?.key === col.sortKey && (
                      sortConfig?.direction === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (bulkActions ? 1 : 0)} className="p-8 text-center text-sm text-text-secondary">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-[#F8F3EE] transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {bulkActions && (
                    <td className="p-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={e => handleSelectRow(row.id, e.target.checked)}
                        className="h-4 w-4 rounded text-black focus:ring-primary/40 border-border accent-black"
                      />
                    </td>
                  )}
                  {columns.map((col, idx) => {
                    const content = typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode);
                    
                    return (
                      <td key={idx} className={`p-4 text-sm text-text-primary ${col.className || ''}`}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-2 px-1">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span>Linhas por página:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-border rounded px-2 py-1 focus:border-black focus:outline-none"
            >
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="ml-4">
              Mostrando {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredData.length, currentPage * pageSize)} de {filteredData.length} registros
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="!p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <Button
                  key={pageNum}
                  variant={isCurrent ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`!py-1.5 !px-3 text-xs ${isCurrent ? '!bg-black !text-white' : ''}`}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="!p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
