// hooks/useAuditLogs.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabaseClient';

import {
  AuditLog,
  AuditLogActionFilter,
  AuditLogStatusFilter,
  AuditLogSortField,
  AuditLogSortOrder,
} from '@/components/types/audit-log'; // Assuming these types are correctly defined here

export const useAuditLogs = (logsPerPage: number = 10, backendUrl: string) => {
  const [logs, setLogs] = useState<AuditLog[]>([]); // This will now be populated by the API call
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditLogActionFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AuditLogStatusFilter>('all');
  const [sortField, setSortField] = useState<AuditLogSortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<AuditLogSortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Loading, Error, and Auth States ---
  const [isLoadingLogs, setIsLoadingLogs] = useState(true); // For main data fetch
  const [isAuthLoading, setIsAuthLoading] = useState(true); // For Supabase auth token retrieval
  const [error, setError] = useState<string | null>(null); // General error state
  const [userAccessToken, setUserAccessToken] = useState<string | null>(null); // Supabase JWT

  // --- Supabase Authentication & Session Management ---
  useEffect(() => {
    const getAuthToken = async () => {
      try {
        setIsAuthLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session || !session.access_token) {
          throw new Error("No active Supabase session found. Please ensure you are logged in.");
        }
        setUserAccessToken(session.access_token);
      } catch (err: any) {
        console.error('Supabase Auth Error:', err);
        setError(err.message || "Failed to authenticate with Supabase. Please refresh or log in.");
        setUserAccessToken(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    getAuthToken(); // Initial call on mount

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUserAccessToken(session?.access_token || null);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUserAccessToken(null);
          setLogs([]); // Clear logs on sign out
          setError("You have been signed out.");
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe(); // Cleanup listener
    };
  }, []); // Runs only once on component mount

  // --- Data Fetching (GET Request) ---
  const fetchAuditLogs = useCallback(async () => {
    if (!userAccessToken) {
      if (!isAuthLoading) {
        setError("Authentication required to fetch audit logs.");
      }
      return;
    }

    setIsLoadingLogs(true);
    setError(null);

    try {
      // You can add query parameters here if your backend supports server-side filtering/sorting/pagination
      const queryParams = new URLSearchParams({
        // Example: If your backend needs current sort/order
        sortField: sortField,
        sortOrder: sortOrder,
        // Example: If your backend supports pagination
        page: String(currentPage),
        limit: String(logsPerPage),
        // Example: If your backend supports filtering by action/status/search
        action: actionFilter === 'all' ? '' : actionFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
        searchTerm: searchTerm,
      }).toString();

      if (!backendUrl) {
          throw new Error("Backend URL is not configured. Please check NEXT_PUBLIC_API_URL.");
      }

      const response = await fetch(`${backendUrl}/audit-logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${userAccessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch audit logs: ${response.statusText}`);
      }

      const data = await response.json();
      // Assuming your backend returns an array of AuditLog directly, or an object like { data: AuditLog[] }
      setLogs(data.data || data); // Adjust based on your actual API response structure

    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || "An unexpected error occurred while fetching audit logs.");
      setLogs([]); // Clear logs on error
    } finally {
      setIsLoadingLogs(false);
    }
  }, [
    backendUrl,
    userAccessToken,
    isAuthLoading,
    sortField,
    sortOrder,
    currentPage,
    logsPerPage,
    actionFilter,
    statusFilter,
    searchTerm // Include all dependencies that would cause a re-fetch
  ]);

  // Trigger fetchAuditLogs when relevant state changes
  useEffect(() => {
    if (userAccessToken && !isAuthLoading) {
      fetchAuditLogs();
    }
  }, [userAccessToken, isAuthLoading, fetchAuditLogs]); // dependencies for useEffect

  // Memoized filtering and sorting logic (client-side, if not fully done by backend)
  // NOTE: If your backend handles filtering/sorting, this `useMemo` might just return `logs` directly
  // or apply minimal client-side transformations if needed.
  const filteredAndSortedLogs = useMemo(() => {
    let currentLogs = logs;

    // Apply client-side filters if backend doesn't handle all of them
    currentLogs = currentLogs.filter(log => {
      const matchesSearch =
        searchTerm === '' ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

      return matchesSearch && matchesAction && matchesStatus;
    });

    // Apply client-side sorting if backend doesn't return sorted data
    currentLogs.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'timestamp') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortField === 'user') {
        comparison = a.user.localeCompare(b.user);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return currentLogs;
  }, [logs, searchTerm, actionFilter, statusFilter, sortField, sortOrder]);

  // Memoized pagination logic (client-side, if not fully done by backend)
  const totalPages = Math.ceil(filteredAndSortedLogs.length / logsPerPage);
  const paginatedLogs = useMemo(() => {
    // Reset current page if it's out of bounds after filtering/sorting
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages); // Go to last page if current is beyond new total
    } else if (currentPage === 0 && totalPages > 0) { // Handle case where page could go to 0
      setCurrentPage(1);
    }
    return filteredAndSortedLogs.slice(
      (currentPage - 1) * logsPerPage,
      currentPage * logsPerPage
    );
  }, [filteredAndSortedLogs, currentPage, logsPerPage, totalPages]); // Added totalPages as dependency

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
    isLoadingLogs, // Expose loading state
    isAuthLoading, // Expose auth loading state
    error,         // Expose error state
    userAccessToken // Expose access token (if needed by other components directly)
  };
};