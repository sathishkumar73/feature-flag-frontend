// app/feature-flags/page.tsx (or wherever your main page is)
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
import ExportConfirmModal from '@/components/ExportConfirmModal'; // Import the new modal

import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { exportFlagsToCSV } from '@/utils/flag-helpers';
import { FeatureFlag } from '@/types/flag';

const FeatureFlagsPage = () => {
  const {
    searchTerm, setSearchTerm,
    environmentFilter, setEnvironmentFilter,
    statusFilter, setStatusFilter,
    sortField, sortDirection, handleSort,
    paginatedFlags, filteredAndSortedFlags, // Keep filteredAndSortedFlags for export
    currentPage, totalPages, goToNextPage, goToPreviousPage,
    handleCreateFlag, handleToggleFlag,
  } = useFeatureFlags(10);

  // States for modals
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [flagToToggle, setFlagToToggle] = useState<FeatureFlag | null>(null);
  const [exportConfirmModalOpen, setExportConfirmModalOpen] = useState(false); // New state for export modal

  const handleSwitchToggle = (flag: FeatureFlag) => {
    setFlagToToggle(flag);
    setToggleModalOpen(true);
  };

  // Function to open the export confirmation modal
  const handleOpenExportConfirm = () => {
    if (filteredAndSortedFlags.length === 0) {
      toast.info("No flags to export.", {
        description: "Please adjust your filters or create flags to export data."
      });
      return;
    }
    setExportConfirmModalOpen(true);
  };

  // Function called when export is confirmed
  const handleConfirmExport = () => {
    exportFlagsToCSV(filteredAndSortedFlags, toast);
    setExportConfirmModalOpen(false); // Close the modal after export
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
          onExportCSV={handleOpenExportConfirm}
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
          backendUrl={process.env.NEXT_PUBLIC_API_URL!}
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

        {/* New Export Confirmation Modal */}
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