// hooks/useFeatureFlags.ts
import { useState, useMemo, useCallback } from 'react';
import { FeatureFlag, SortField, SortDirection, FlagStatusFilter, FlagEnvironmentFilter } from '@/types/flag'; // Import types

export const useFeatureFlags = (itemsPerPage: number = 10) => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState<FlagEnvironmentFilter>('All');
  const [statusFilter, setStatusFilter] = useState<FlagStatusFilter>('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized filtered and sorted flags
  const filteredAndSortedFlags = useMemo(() => {
    let filtered = flags.filter(flag => {
      const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           flag.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEnvironment = environmentFilter === 'All' || flag.environment === environmentFilter;
      const matchesStatus = statusFilter === 'All' ||
                           (statusFilter === 'Enabled' && flag.enabled) ||
                           (statusFilter === 'Disabled' && !flag.enabled);

      return matchesSearch && matchesEnvironment && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;

      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else {
          // Fallback or error handling if sortField is unexpected
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0; // Should not be reached if types are handled
    });

    return filtered;
  }, [flags, searchTerm, environmentFilter, statusFilter, sortField, sortDirection]);

  // Memoized pagination logic
  const totalPages = Math.ceil(filteredAndSortedFlags.length / itemsPerPage);
  const paginatedFlags = useMemo(() => {
    return filteredAndSortedFlags.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredAndSortedFlags, currentPage, itemsPerPage]);

  // Handlers for state updates
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on sort change
  }, [sortField]);

  const handleCreateFlag = useCallback((newFlag: FeatureFlag) => {
    // In a real app, you'd call an API here and then update state with the response
    setFlags(prev => [newFlag, ...prev]);
    setCurrentPage(1); // Go to first page to see the new flag
  }, []);

  const handleToggleFlag = useCallback((flagId: string, enabled: boolean, reason: string) => {
    // In a real app, you'd call an API here to update the flag's status
    setFlags(prev => prev.map(flag =>
      flag.id === flagId
        ? { ...flag, enabled, updatedAt: new Date().toISOString() }
        : flag
    ));
    console.log(`Flag ${flagId} ${enabled ? 'enabled' : 'disabled'} with reason: ${reason}`);
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  return {
    flags,
    setFlags, // Exposed if needed for direct manipulation, though handlers are preferred
    searchTerm,
    setSearchTerm,
    environmentFilter,
    setEnvironmentFilter,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    handleSort,
    paginatedFlags,
    filteredAndSortedFlags, // Useful for export functions etc.
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    handleCreateFlag,
    handleToggleFlag,
    itemsPerPage // Expose for consumer reference
  };
};