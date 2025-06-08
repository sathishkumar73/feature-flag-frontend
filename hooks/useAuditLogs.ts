// hooks/useAuditLogs.ts
import { useState, useMemo, useCallback } from 'react';
import {
  AuditLog,
  AuditLogActionFilter,
  AuditLogStatusFilter,
  AuditLogSortField,
  AuditLogSortOrder,
} from '@/components/types/audit-log';

export const useAuditLogs = (logsPerPage: number = 10) => {
  const [logs] = useState<AuditLog[]>([]); // Initialize with empty array
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditLogActionFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AuditLogStatusFilter>('all');
  const [sortField, setSortField] = useState<AuditLogSortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<AuditLogSortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized filtering and sorting logic
  const filteredAndSortedLogs = useMemo(() => {
    let filtered = logs.filter(log => {
      const matchesSearch =
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

      return matchesSearch && matchesAction && matchesStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'timestamp') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortField === 'user') {
        comparison = a.user.localeCompare(b.user);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [logs, searchTerm, actionFilter, statusFilter, sortField, sortOrder]);

  // Memoized pagination logic
  const totalPages = Math.ceil(filteredAndSortedLogs.length / logsPerPage);
  const paginatedLogs = useMemo(() => {
    return filteredAndSortedLogs.slice(
      (currentPage - 1) * logsPerPage,
      currentPage * logsPerPage
    );
  }, [filteredAndSortedLogs, currentPage, logsPerPage]);

  // Handler for sorting
  const handleSort = useCallback((field: AuditLogSortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc for new sort field (e.g., latest timestamp first)
    }
    setCurrentPage(1); // Reset to first page on sort change
  }, [sortField]);

  // Handlers for pagination
  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  return {
    searchTerm, setSearchTerm,
    actionFilter, setActionFilter,
    statusFilter, setStatusFilter,
    sortField, sortOrder, handleSort,
    paginatedLogs,
    filteredAndSortedLogs, // Export this for the CSV export function
    currentPage, totalPages, goToNextPage, goToPreviousPage,
    logsPerPage,
  };
};