// hooks/useFeatureFlags.ts
import { useState, useMemo, useCallback } from 'react';
import { FeatureFlag, SortField, SortDirection, FlagStatusFilter, FlagEnvironmentFilter } from '@/types/flag'; // Import types

// Mock data (could be fetched from an API in a real app)
const initialFlags: FeatureFlag[] = [
  {
    id: 'flag_001',
    name: 'new-checkout-flow',
    description: 'Enable the new streamlined checkout process with improved UX and conversion tracking',
    environment: 'Production',
    enabled: true,
    rolloutPercentage: 75,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
  {
    id: 'flag_002',
    name: 'dark-mode-toggle',
    description: 'Allow users to switch between light and dark themes',
    environment: 'Staging',
    enabled: false,
    rolloutPercentage: 0,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-19T16:20:00Z'
  },
  {
    id: 'flag_003',
    name: 'advanced-analytics',
    description: 'Show advanced analytics dashboard with detailed metrics and reporting capabilities for premium users',
    environment: 'Development',
    enabled: true,
    rolloutPercentage: 100,
    createdAt: '2024-01-12T11:45:00Z',
    updatedAt: '2024-01-22T13:30:00Z'
  },
  {
    id: 'flag_004',
    name: 'social-login',
    description: 'Enable social media login options (Google, GitHub, Discord)',
    environment: 'Production',
    enabled: true,
    rolloutPercentage: 50,
    createdAt: '2024-01-10T08:20:00Z',
    updatedAt: '2024-01-21T10:15:00Z'
  },
  {
    id: 'flag_005',
    name: 'beta-features',
    description: 'Access to experimental features for beta testing program',
    environment: 'Staging',
    enabled: true,
    rolloutPercentage: 25,
    createdAt: '2024-01-08T14:10:00Z',
    updatedAt: '2024-01-23T09:40:00Z'
  }
];


export const useFeatureFlags = (itemsPerPage: number = 10) => {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);
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