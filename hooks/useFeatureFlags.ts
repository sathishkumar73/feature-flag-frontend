// hooks/useFeatureFlags.ts
"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabaseClient'; // Adjust this path as needed
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";

// Assuming these types are defined in '@/types/flag'
import { FeatureFlag, SortField, SortDirection } from '@/types/flag';

// DTO for creating a flag (what we send to backend)
interface CreateFeatureFlagDto {
  name: string;
  description?: string;
  enabled?: boolean;
  environment: string;
  rolloutPercentage?: number;
}

// Response structure for a created flag (what backend sends back after creation)
interface CreatedFlagResponse extends FeatureFlag {
  // Assuming the backend returns the full FeatureFlag object upon creation
}

// Helper functions (can be in utils/flag-helpers.ts if they are shared)
const filterFlags = (
  flags: FeatureFlag[],
  searchTerm: string,
  environmentFilter: string,
  statusFilter: string
) => {
  return flags.filter((flag) => {
    const matchesSearch = searchTerm
      ? flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesEnvironment = environmentFilter
      ? flag.environment === environmentFilter
      : true;

    const matchesStatus = statusFilter
      ? statusFilter === 'enabled'
        ? flag.enabled
        : !flag.enabled
      : true;

    return matchesSearch && matchesEnvironment && matchesStatus;
  });
};

const sortFlags = (
  flags: FeatureFlag[],
  sortField: SortField,
  sortDirection: SortDirection
) => {
  return [...flags].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};

export const useFeatureFlags = (itemsPerPage: number, backendUrl: string) => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]); // Raw flags fetched from API
  const [searchTerm, setSearchTerm] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Loading, Error, and Auth States ---
  const [isLoadingFlags, setIsLoadingFlags] = useState(true); // For main data fetch
  const [isAuthLoading, setIsAuthLoading] = useState(true); // For Supabase auth token retrieval
  const [error, setError] = useState<string | null>(null); // General error state
  const [userAccessToken, setUserAccessToken] = useState<string | null>(null); // Supabase JWT
  const [isCreatingFlag, setIsCreatingFlag] = useState(false); // For CreateFlagModal
  const [isTogglingFlagId, setIsTogglingFlagId] = useState<string | null>(null); // For FeatureFlagsTable switch

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
          // If no session, set error for the page to show login prompt
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


  }, []); // Runs only once on component mount

  // --- Data Fetching (GET /flags) ---
  const fetchFlags = useCallback(async () => {
    if (!userAccessToken) {
      if (!isAuthLoading) {
        setError("Authentication required to fetch flags.");
      }
      return;
    }
    setIsLoadingFlags(true);
    setError(null);
    try {
      const queryParams = {
        sort: sortField,
        order: sortDirection,
        // environment: environmentFilter,
        // status: statusFilter,
        // searchTerm: searchTerm,
        // page: String(currentPage),
        // limit: String(itemsPerPage),
      };
      if (!backendUrl) {
        throw new Error("Backend URL is not configured. Please check NEXT_PUBLIC_API_URL.");
      }
      const data = await apiGet<any>("/flags", queryParams);
      setFlags(data.data || data);
    } catch (err: any) {
      console.error('Error fetching flags:', err);
      setError(err.message || "An unexpected error occurred while fetching flags.");
      setFlags([]);
    } finally {
      setIsLoadingFlags(false);
    }
  }, [backendUrl, userAccessToken, sortField, sortDirection, isAuthLoading]);

  // Trigger `fetchFlags` whenever `userAccessToken`, `isAuthLoading`, or sorting parameters change
  useEffect(() => {
    if (userAccessToken && !isAuthLoading) {
      fetchFlags();
    }
  }, [userAccessToken, isAuthLoading, fetchFlags]);

  // --- Client-Side Filtering, Sorting, and Pagination ---
  const filteredAndSortedFlags = useMemo(() => {
    let currentFlags = flags;

    // Apply client-side filters (if not done by backend GET endpoint)
    currentFlags = filterFlags(currentFlags, searchTerm, environmentFilter, statusFilter);

    // Apply client-side sorting (if not done by backend GET endpoint)
    currentFlags = sortFlags(currentFlags, sortField, sortDirection);

    return currentFlags;
  }, [flags, searchTerm, environmentFilter, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedFlags.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFlags = filteredAndSortedFlags.slice(startIndex, startIndex + itemsPerPage);

  // --- Pagination Handlers ---
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // --- Sorting Handler ---
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc'); // Default to ascending when changing sort field
    }
    setCurrentPage(1); // Reset to first page on sort change
  };

  // --- Create Flag Handler (POST /flags) ---
  const handleCreateFlag = async (newFlagData: CreateFeatureFlagDto): Promise<FeatureFlag | null> => {
    if (!userAccessToken) {
      toast.error("You are not authenticated. Please log in to create flags.");
      return null;
    }
    setIsCreatingFlag(true);
    try {
      const newFlag = await apiPost<FeatureFlag>("/flags", newFlagData);
      setFlags(prevFlags => [...prevFlags, newFlag]);
      toast.success(`Feature flag "${newFlag.name}" has been created successfully.`);
      fetchFlags();
      return newFlag;
    } catch (err: any) {
      console.error('Error creating feature flag:', err);
      toast.error(err.message || "An unexpected error occurred while creating the flag.");
      return null;
    } finally {
      setIsCreatingFlag(false);
    }
  };

  // --- Toggle Flag Handler (PUT /flags/:id) ---
  const handleToggleFlag = async (flag: FeatureFlag) => {
    if (!userAccessToken) {
      toast.error("You are not authenticated. Please log in to toggle flags.");
      return;
    }
    setIsTogglingFlagId(flag.id);
    const originalEnabledState = flag.enabled;
    setFlags(prevFlags =>
      prevFlags.map(f =>
        f.id === flag.id ? { ...f, enabled: !f.enabled } : f
      )
    );
    try {
      await apiPut(`/flags/${flag.id}`, { enabled: !originalEnabledState });
      toast.success(`Feature flag "${flag.name}" has been ${!originalEnabledState ? 'enabled' : 'disabled'}.`);
    } catch (err: any) {
      console.error('Error toggling flag:', err);
      toast.error(err.message || `Failed to toggle flag "${flag.name}". Reverting...`);
      setFlags(prevFlags =>
        prevFlags.map(f =>
          f.id === flag.id ? { ...f, enabled: originalEnabledState } : f
        )
      );
    } finally {
      setIsTogglingFlagId(null);
    }
  };


  return {
    searchTerm, setSearchTerm,
    environmentFilter, setEnvironmentFilter,
    statusFilter, setStatusFilter,
    sortField, sortDirection, handleSort,
    paginatedFlags, filteredAndSortedFlags, // filteredAndSortedFlags is useful for export
    currentPage, totalPages, goToNextPage, goToPreviousPage,
    handleCreateFlag,
    handleToggleFlag, // The main toggle function
    isLoadingFlags,
    isAuthLoading,
    error,
    isCreatingFlag, // Expose this to disable table switch
    isTogglingFlagId, // Expose this to disable table switch
    userAccessToken, // Might be useful for other components if needed
  };
};