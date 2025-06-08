"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabaseClient'; // Adjust this path as needed

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

    // Listen for real-time auth state changes (e.g., token refresh, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUserAccessToken(session?.access_token || null);
          setError(null); // Clear any previous auth errors
        } else if (event === 'SIGNED_OUT') {
          setUserAccessToken(null);
          setFlags([]); // Clear flags on sign out
          setError("You have been signed out.");
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe(); // Cleanup listener
    };
  }, []); // Runs only once on component mount

  // --- Data Fetching (GET /flags) ---
  const fetchFlags = useCallback(async () => {
    // Prevent fetching if authentication is still loading or token is not available
    if (!userAccessToken) {
      if (!isAuthLoading) { // If auth loading is done but no token, set error
        setError("Authentication required to fetch flags.");
      }
      return;
    }

    setIsLoadingFlags(true);
    setError(null); // Clear previous errors

    try {
      // Construct query parameters for server-side filtering/sorting if your backend supports it
      const queryParams = new URLSearchParams({
        sort: sortField,
        order: sortDirection,
        // You might add these for server-side filtering/search/pagination
        // environment: environmentFilter,
        // status: statusFilter,
        // searchTerm: searchTerm,
        // page: String(currentPage),
        // limit: String(itemsPerPage),
      }).toString();

      if (!backendUrl) {
          throw new Error("Backend URL is not configured. Please check NEXT_PUBLIC_API_URL.");
      }

      const response = await fetch(`${backendUrl}/flags?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${userAccessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch flags: ${response.statusText}`);
      }

      const data = await response.json();
      // Adjust based on your backend response structure.
      // If backend returns { data: FeatureFlag[], total: number }, use data.data.
      // Otherwise, assume it's just an array of flags.
      setFlags(data.data || data);

    } catch (err: any) {
      console.error('Error fetching flags:', err);
      setError(err.message || "An unexpected error occurred while fetching flags.");
      setFlags([]); // Clear flags on error
    } finally {
      setIsLoadingFlags(false);
    }
  }, [backendUrl, userAccessToken, sortField, sortDirection, isAuthLoading]); // Dependencies for useCallback

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
  const handleCreateFlag = async (newFlagData: CreateFeatureFlagDto) => {
    if (!userAccessToken) {
      toast.error("You are not authenticated. Please log in to create flags.");
      return;
    }
    setIsCreatingFlag(true);
    try {
      const response = await fetch(`${backendUrl}/flags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userAccessToken}`,
        },
        body: JSON.stringify(newFlagData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create flag: ${response.statusText}`);
      }

      const newFlag: CreatedFlagResponse = await response.json();
      setFlags(prevFlags => [...prevFlags, newFlag]); // Add new flag to local state
      toast.success(`Feature flag "${newFlag.name}" has been created successfully.`);
      fetchFlags(); // Re-fetch all flags to ensure consistency (optional, can be optimized)
      return newFlag; // Return the created flag if needed by caller
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

    setIsTogglingFlagId(flag.id); // Set the flag being toggled to disable its switch

    const originalEnabledState = flag.enabled;
    // Optimistic UI Update: Update the local state immediately
    setFlags(prevFlags =>
      prevFlags.map(f =>
        f.id === flag.id ? { ...f, enabled: !f.enabled } : f
      )
    );

    try {
      const response = await fetch(`${backendUrl}/flags/${flag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userAccessToken}`,
        },
        body: JSON.stringify({ enabled: !originalEnabledState }), // Send the new state
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to toggle flag: ${response.statusText}`);
      }

      toast.success(`Feature flag "${flag.name}" has been ${!originalEnabledState ? 'enabled' : 'disabled'}.`);
      // Optionally, if your backend returns the updated flag, you could use it to update state
      // const updatedFlag: FeatureFlag = await response.json();
      // setFlags(prevFlags => prevFlags.map(f => f.id === updatedFlag.id ? updatedFlag : f));
    } catch (err: any) {
      console.error('Error toggling flag:', err);
      toast.error(err.message || `Failed to toggle flag "${flag.name}". Reverting...`);
      // Revert UI on error to original state
      setFlags(prevFlags =>
        prevFlags.map(f =>
          f.id === flag.id ? { ...f, enabled: originalEnabledState } : f
        )
      );
    } finally {
      setIsTogglingFlagId(null); // Clear the toggling state
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
    isCreatingFlag,
    isTogglingFlagId, // Expose this to disable table switch
    userAccessToken // Might be useful for other components if needed
  };
};