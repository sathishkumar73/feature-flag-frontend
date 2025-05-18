"use client";
import AuditLogsTable from "@/components/AuditLogsTable";
import FeatureFlagsPagination from "@/components/FeatureFlags/FeatureFlagsPagination";
import React, { useState, useEffect } from "react";
import { AuditLog } from "@/components/types/audit-log";
import { fetchAuditLogs } from "@/services/auditLogService";

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
    fetchAuditLogs(flagIdFilter)
      .then((data) => {
        setAuditLogs(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load audit logs.");
      })
      .finally(() => setLoading(false));
  }, [flagIdFilter]);

  const handlePageChange = (pageNumber: number) => {
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
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
    </div>
  );
};

export default AuditLogsPage;