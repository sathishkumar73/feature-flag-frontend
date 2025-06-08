// hooks/useAuditLogs.ts
import { useState, useMemo, useCallback } from 'react';
import {
  AuditLog,
  AuditLogActionFilter,
  AuditLogStatusFilter,
  AuditLogSortField,
  AuditLogSortOrder,
} from '@/components/types/audit-log';

// Full dummy audit logs data (moved here from the main component)
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-06-08T10:30:00Z',
    user: 'John Doe',
    userEmail: 'john.doe@company.com',
    action: 'Create',
    entity: 'new-checkout-flow',
    entityId: 'flag_001',
    details: 'Created new feature flag for checkout optimization',
    status: 'Success',
    fullDetails:
      'Feature flag "new-checkout-flow" was created with default targeting rules. Initial rollout set to 0% with gradual rollout planned.',
    metadata: { environment: 'production', rolloutPercentage: 0 },
  },
  {
    id: '2',
    timestamp: '2024-06-08T09:15:00Z',
    user: 'Sarah Wilson',
    userEmail: 'sarah.wilson@company.com',
    action: 'Update',
    entity: 'dark-mode-toggle',
    entityId: 'flag_002',
    details: 'Updated targeting rules for dark mode feature',
    status: 'Success',
    fullDetails:
      'Modified targeting rules to include beta user segment. Rollout percentage increased from 25% to 50%.',
    metadata: { environment: 'production', previousRollout: 25, newRollout: 50 },
  },
  {
    id: '3',
    timestamp: '2024-06-08T08:45:00Z',
    user: 'Mike Chen',
    userEmail: 'mike.chen@company.com',
    action: 'Delete',
    entity: 'legacy-payment-method',
    entityId: 'flag_003',
    details: 'Removed deprecated payment method flag',
    status: 'Failure',
    fullDetails:
      'Failed to delete flag due to active dependencies. Flag is still referenced in checkout service.',
    metadata: { environment: 'production', dependencies: ['checkout-service', 'payment-processor'] },
  },
  {
    id: '4',
    timestamp: '2024-06-07T16:20:00Z',
    user: 'Lisa Rodriguez',
    userEmail: 'lisa.rodriguez@company.com',
    action: 'Update',
    entity: 'mobile-app-redesign',
    entityId: 'flag_004',
    details: 'Enabled flag for mobile app redesign',
    status: 'Success',
    fullDetails:
      'Feature flag enabled for mobile app redesign. Targeting iOS users in US region with 100% rollout.',
    metadata: { environment: 'production', platform: 'iOS', region: 'US', rollout: 100 },
  },
  {
    id: '5',
    timestamp: '2024-06-07T14:10:00Z',
    user: 'Alex Thompson',
    userEmail: 'alex.thompson@company.com',
    action: 'Create',
    entity: 'ai-recommendations',
    entityId: 'flag_005',
    details: 'Created AI-powered recommendation engine flag',
    status: 'Success',
    fullDetails:
      'New feature flag for AI recommendations system. Initially disabled with plans for gradual rollout.',
    metadata: { environment: 'staging', aiModel: 'gpt-4', rollout: 0 },
  },
];


export const useAuditLogs = (logsPerPage: number = 10) => {
  const [logs] = useState<AuditLog[]>(mockAuditLogs); // Logs state is local to hook
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