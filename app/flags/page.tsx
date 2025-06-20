// app/feature-flags/page.tsx
"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

import FeatureFlagsHeader from '@/components/FeatureFlagsHeader';
import FeatureFlagsFilters from '@/components/FeatureFlagsFilters';
import FeatureFlagsTable from '@/components/FeatureFlagsTable';
import FeatureFlagsPagination from '@/components/FeatureFlagsPagination';
import CreateFlagModal from '@/components/CreateFlagModal';
import ToggleFlagModal from '@/components/ToggleFlagModal';
import FeatureFlagModal from '@/components/FeatureFlagModal';
import ExportConfirmModal from '@/components/ExportConfirmModal';
import OnboardingOverlay from '@/components/OnboardingOverlay';

import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { exportFlagsToCSV } from '@/utils/flag-helpers';
import { FeatureFlag, FlagEnvironmentFilter, FlagStatusFilter } from '@/types/flag';
import Loader3DCube from '@/components/ui/loader';

const FeatureFlagsPage = () => {
  const {
    searchTerm, setSearchTerm,
    environmentFilter, setEnvironmentFilter,
    statusFilter, setStatusFilter,
    sortField, sortDirection, handleSort,
    paginatedFlags, filteredAndSortedFlags,
    currentPage, totalPages, goToNextPage, goToPreviousPage,
    handleCreateFlag, // This is the function we pass to CreateFlagModal
    handleToggleFlag,
    isLoadingFlags,
    isAuthLoading,
    error,
    isCreatingFlag, // FIX: Destructure isCreatingFlag from the hook
    isTogglingFlagId,
    userAccessToken // Keep if needed for other checks or components
  } = useFeatureFlags(10, process.env.NEXT_PUBLIC_API_URL!);

  // States for modals
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [flagToToggle, setFlagToToggle] = useState<FeatureFlag | null>(null);
  const [exportConfirmModalOpen, setExportConfirmModalOpen] = useState(false);

  const handleSwitchToggle = (flag: FeatureFlag) => {
    setFlagToToggle(flag);
    setToggleModalOpen(true);
  };

  const handleOpenExportConfirm = () => {
    if (filteredAndSortedFlags.length === 0) {
      toast.info("No flags to export.", {
        description: "Please adjust your filters or create flags to export data."
      });
      return;
    }
    setExportConfirmModalOpen(true);
  };

  const handleConfirmExport = () => {
    exportFlagsToCSV(filteredAndSortedFlags, toast);
    setExportConfirmModalOpen(false);
  };

  // --- Conditional Rendering for Loading/Error/Auth States ---
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Authenticating with Supabase...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Error: {error}
        <p className="mt-2 text-base text-gray-600">Please check your network connection or ensure you are logged in.</p>
      </div>
    );
  }

  if (!userAccessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">
        You are not logged in. Please log in to manage feature flags.
      </div>
    );
  }

  if (isLoadingFlags) {
    return <div className="min-h-screen flex items-center justify-center text-xl"><Loader3DCube/></div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 relative">
        {/* Onboarding Overlay */}
        <OnboardingOverlay />
        
        {/* Header Section */}
        <FeatureFlagsHeader onOpenCreateModal={() => setCreateModalOpen(true)} />

        {/* Filters and Search Section */}
        <FeatureFlagsFilters
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          environmentFilter={environmentFilter as FlagEnvironmentFilter}
          onEnvironmentFilterChange={setEnvironmentFilter}
          statusFilter={statusFilter as FlagStatusFilter}
          onStatusFilterChange={setStatusFilter}
          onExportCSV={handleOpenExportConfirm}
          totalFilteredFlags={filteredAndSortedFlags.length}
        />

        {/* Feature Flags Table */}
        <Card className="px-6">
          <FeatureFlagsTable
            flags={paginatedFlags}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onFlagToggle={handleSwitchToggle}
            onViewDetails={setSelectedFlag}
            isTogglingFlagId={isTogglingFlagId} // Pass to disable specific switches
          />
        </Card>

        {/* Pagination Controls */}
        <FeatureFlagsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={goToNextPage}
          onPreviousPage={goToPreviousPage}
        />

        {/* Modals */}
        {selectedFlag && (
          <FeatureFlagModal
            flag={selectedFlag}
            isOpen={!!selectedFlag}
            onClose={() => setSelectedFlag(null)}
          />
        )}

        <CreateFlagModal
          isOpen={createModalOpen}
          // FIX: Removed backendUrl from here as the modal no longer uses it for API calls
          // backendUrl={process.env.NEXT_PUBLIC_API_URL!}
          onClose={() => setCreateModalOpen(false)}
          onCreateFlag={handleCreateFlag} // This sends the form data to the hook
          isSubmitting={isCreatingFlag} // FIX: Pass the isCreatingFlag state to control modal's UI
        />

        <ToggleFlagModal
          flag={flagToToggle}
          isOpen={toggleModalOpen}
          onClose={() => {
            setToggleModalOpen(false);
            setFlagToToggle(null);
          }}
          onToggleFlag={async (flag) => {
            if (flag) {
              await handleToggleFlag(flag);
            }
          }}
        />

        <ExportConfirmModal
          isOpen={exportConfirmModalOpen}
          onClose={() => setExportConfirmModalOpen(false)}
          onConfirm={handleConfirmExport}
          totalFlagsToExport={filteredAndSortedFlags.length}
        />
      </div>
    </div>
  );
};

export default FeatureFlagsPage;