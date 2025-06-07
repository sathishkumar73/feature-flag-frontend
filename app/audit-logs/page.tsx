"use client";
import AuditLogsTable from "@/components/AuditLogsTable";
import FeatureFlagsPagination from "@/components/FeatureFlags/FeatureFlagsPagination";
import React, { useState, useEffect } from "react";
import { AuditLog } from "@/components/types/audit-log";
import auditLogService from "@/services/auditLogService";
import { toast } from "sonner";

const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const flagIdFilter: string | undefined = undefined;

  useEffect(() => {
    setLoading(true);
    setError(null);
    auditLogService.fetchAuditLogs(flagIdFilter, page)
      .then((data) => {
        setAuditLogs(data.data);
        setTotalPages(data.meta.totalPages);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load audit logs. If the issue persists, please contact support.");
        toast.error("Failed to load audit logs");
      })
      .finally(() => setLoading(false));
  }, [page, flagIdFilter]);

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const handleRetry = () => {
    setError(null);
    setPage(1); // Reset to first page on retry
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      {error ? (
        <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-md border max-h-[500px] overflow-y-scroll">
            <AuditLogsTable
              auditLogs={auditLogs}
              loading={loading}
              error={error}
            />
          </div>
          {totalPages > 0 && (
            <FeatureFlagsPagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogsPage;