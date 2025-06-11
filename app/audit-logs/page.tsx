"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

// Import modularized components and hooks
import AuditLogsHeader from '@/components/AuditLogsHeader';
import AuditLogsFilters from '@/components/AuditLogsFilters';
import AuditLogsTable from '@/components/AuditLogsTable';
import AuditLogsPagination from '@/components/AuditLogsPagination';
import AuditLogDetailsModal from '@/components/AuditLogDetailsModal';
import AuditLogExportConfirmModal from '@/components/AuditLogExportConfirmModal'; // New export modal

import { useAuditLogs } from '@/hooks/useAuditLogs'; // Import the custom hook
import { exportAuditLogsToCSV } from '@/utils/audit-log-helpers'; // Import utility for CSV export
import { AuditLog } from '@/components/types/audit-log'; // Import the type
import Loader3DCube from '@/components/ui/loader';

const AuditLogsPage = () => {
  // Use the custom hook to manage all audit log logic and state
  const {
    searchTerm, setSearchTerm,
    actionFilter, setActionFilter,
    statusFilter, setStatusFilter,
    sortField, sortOrder, handleSort,
    paginatedLogs, filteredAndSortedLogs, // Keep filteredAndSortedLogs for export
    currentPage, totalPages, goToNextPage, goToPreviousPage,
    isLoadingLogs
  } = useAuditLogs(10, process.env.NEXT_PUBLIC_API_URL!); // Pass itemsPerPage to the hook

  // States for modals
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [exportConfirmModalOpen, setExportConfirmModalOpen] = useState(false); // New state for export modal

  // Function to open the export confirmation modal
  const handleOpenExportConfirm = () => {
    if (filteredAndSortedLogs.length === 0) {
      toast.info("No logs to export.", {
        description: "Please adjust your filters to include data for export."
      });
      return;
    }
    setExportConfirmModalOpen(true);
  };

  // Function called when export is confirmed
  const handleConfirmExport = () => {
    exportAuditLogsToCSV(filteredAndSortedLogs, toast);
    setExportConfirmModalOpen(false); // Close the modal after export
  };

  if (isLoadingLogs) {
    return <div className="min-h-screen flex items-center justify-center text-xl"><Loader3DCube/></div>;
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header Section */}
      <AuditLogsHeader />

      {/* Filters and Search Section */}
      <AuditLogsFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onExportCSV={handleOpenExportConfirm} // Use the new handler here
        totalFilteredLogsCount={filteredAndSortedLogs.length}
      />

      {/* Audit Logs Table */}
      <Card>
        <AuditLogsTable
          logs={paginatedLogs}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onViewDetails={setSelectedLog}
          totalFilteredLogsCount={filteredAndSortedLogs.length}
          paginatedLogsCount={paginatedLogs.length}
        />
      </Card>

      {/* Pagination Controls */}
      <AuditLogsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
      />

      {/* Modals */}
      <AuditLogDetailsModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      {/* New Export Confirmation Modal */}
      <AuditLogExportConfirmModal
        isOpen={exportConfirmModalOpen}
        onClose={() => setExportConfirmModalOpen(false)}
        onConfirm={handleConfirmExport}
        totalLogsToExport={filteredAndSortedLogs.length}
      />
    </div>
  );
};

export default AuditLogsPage;