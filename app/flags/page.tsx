"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

// Import the new modularized components and hook
import FeatureFlagsHeader from '@/components/FeatureFlagsHeader';
import FeatureFlagsFilters from '@/components/FeatureFlagsFilters';
import FeatureFlagsTable from '@/components/FeatureFlagsTable';
import FeatureFlagsPagination from '@/components/FeatureFlagsPagination';
import CreateFlagModal from '@/components/CreateFlagModal';
import ToggleFlagModal from '@/components/ToggleFlagModal';
import FeatureFlagModal from '@/components/FeatureFlagModal';

import { useFeatureFlags } from '@/hooks/useFeatureFlags'; // Import the custom hook
import { exportFlagsToCSV } from '@/utils/flag-helpers'; // Import the utility function
import { FeatureFlag } from '@/types/flag'; // Import the type

const FeatureFlagsPage = () => {
  // Use the custom hook to manage all feature flag logic and state
  const {
    flags, // Not directly used for display, but useful if you need to pass raw flags
    searchTerm, setSearchTerm,
    environmentFilter, setEnvironmentFilter,
    statusFilter, setStatusFilter,
    sortField, sortDirection, handleSort,
    paginatedFlags, filteredAndSortedFlags,
    currentPage, totalPages, goToNextPage, goToPreviousPage,
    handleCreateFlag, handleToggleFlag,
    itemsPerPage
  } = useFeatureFlags(10); // Pass itemsPerPage to the hook

  // States for modals
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [flagToToggle, setFlagToToggle] = useState<FeatureFlag | null>(null);

  const handleSwitchToggle = (flag: FeatureFlag) => {
    setFlagToToggle(flag);
    setToggleModalOpen(true);
  };

  const handleExport = () => {
    exportFlagsToCSV(filteredAndSortedFlags, toast);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <FeatureFlagsHeader onOpenCreateModal={() => setCreateModalOpen(true)} />

        {/* Filters and Search Section */}
        <FeatureFlagsFilters
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          environmentFilter={environmentFilter}
          onEnvironmentFilterChange={setEnvironmentFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onExportCSV={handleExport}
          totalFilteredFlags={filteredAndSortedFlags.length}
        />

        {/* Feature Flags Table */}
        <Card>
          <FeatureFlagsTable
            flags={paginatedFlags}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onFlagToggle={handleSwitchToggle}
            onViewDetails={setSelectedFlag}
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
          onClose={() => setCreateModalOpen(false)}
          onCreateFlag={handleCreateFlag}
        />

        <ToggleFlagModal
          flag={flagToToggle}
          isOpen={toggleModalOpen}
          onClose={() => {
            setToggleModalOpen(false);
            setFlagToToggle(null);
          }}
          onToggleFlag={handleToggleFlag}
        />
      </div>
    </div>
  );
};

export default FeatureFlagsPage;