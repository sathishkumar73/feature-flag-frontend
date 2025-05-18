"use client";
import CreateFlagDialog from "@/components/CreateFlagDialog";
import { useEffect, useState } from "react";
import { fetchFlags } from "@/services/flagService";
import { FeatureFlag } from "@/components/types/flag";
import FeatureFlagsFilters from "@/components/FeatureFlags/FeatureFlagsFilters";
import FeatureFlagsList from "@/components/FeatureFlags/FeatureFlagsList";
import FeatureFlagsPagination from "@/components/FeatureFlags/FeatureFlagsPagination";

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [environment, setEnvironment] = useState("all");
  const [sortOrder, setSortOrder] = useState("createdAt_desc");

  useEffect(() => {
    setLoading(true);
    fetchFlags(page, limit, environment, sortOrder)
      .then((data: FeatureFlag[]) => setFlags(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, limit, environment, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleEditFlag = (flagId: string) => {
    console.log(`Edit flag with ID: ${flagId}`);
    // Implement your edit logic here (e.g., open a modal)
  };

  const handleDeleteFlag = (flagId: string) => {
    console.log(`Delete flag with ID: ${flagId}`);
    // Implement your delete logic here (e.g., show a confirmation dialog and then call an API)
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feature Flags</h1>
      <div className="flex justify-between">
        <FeatureFlagsFilters
          environment={environment}
          onEnvironmentChange={setEnvironment}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
        <CreateFlagDialog
          className="mb-4"
          onFlagCreated={(response: FeatureFlag) => {
            setFlags([response, ...flags]);
          }}
        />
      </div>

      <FeatureFlagsList
        loading={loading}
        flags={flags}
        onEdit={handleEditFlag}
        onDelete={handleDeleteFlag}
      />

      {flags.length > 0 && !loading && totalPages > 0 && (
        <FeatureFlagsPagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
