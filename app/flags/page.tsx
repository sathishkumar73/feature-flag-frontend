"use client";
import CreateFlagDialog from "@/components/CreateFlagDialog";
import { useEffect, useState } from "react";
import { fetchFlags } from "@/services/flagService";
import { FeatureFlag } from "@/components/types/flag";
import FeatureFlagsFilters from "@/components/FeatureFlags/FeatureFlagsFilters";
import FeatureFlagsList from "@/components/FeatureFlags/FeatureFlagsList";
import FeatureFlagsPagination from "@/components/FeatureFlags/FeatureFlagsPagination";
import EditFlagDialog from "@/components/EditFlagDialog";
import DeleteFlagDialog from "@/components/DeleteFlagDialog";

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [environment, setEnvironment] = useState("all");
  const [sortOrder, setSortOrder] = useState("createdAt_desc");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [flagToDelete, setFlagToDelete] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchFlags(page, limit, environment, sortOrder)
      .then((data: FeatureFlag[]) => setFlags(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, limit, environment, sortOrder]);

  const handleEditClick = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (flag: FeatureFlag) => {
    setFlagToDelete(flag);
    setIsDeleteDialogOpen(true);
  };

  const handleFlagCreated = (newFlag: FeatureFlag) => {
    setFlags([newFlag, ...flags]);
    setIsCreateDialogOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleFlagUpdated = (updatedFlag: FeatureFlag) => {
    setFlags((prevFlags) =>
      prevFlags.map((flag) => (flag.id === updatedFlag.id ? updatedFlag : flag))
    );
    setEditingFlag(null);
    setIsEditDialogOpen(false);
  };

  const handleFlagDeleted = (deletedFlag: FeatureFlag) => {
    setFlags((prevFlags) => prevFlags.filter((flag) => flag.id !== deletedFlag.id));
    setFlagToDelete(null);
    setIsDeleteDialogOpen(false);
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
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onFlagCreated={handleFlagCreated}
        />
      </div>

      <FeatureFlagsList
        loading={loading}
        flags={flags}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {flags.length > 0 && !loading && totalPages > 0 && (
        <FeatureFlagsPagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {editingFlag && (
        <EditFlagDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onFlagUpdated={handleFlagUpdated}
          initialFlag={editingFlag}
        />
      )}

      {flagToDelete && (
        <DeleteFlagDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          flagToDelete={flagToDelete}
          onFlagDeleted={handleFlagDeleted}
        />
      )}
    </div>
  );
}
