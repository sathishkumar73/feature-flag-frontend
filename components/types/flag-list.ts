import { FeatureFlag } from "./flag";

export interface FeatureFlagsListProps {
  loading: boolean;
  flags: FeatureFlag[];
  onEdit: (flag: FeatureFlag) => void;
  onDelete: (flag: FeatureFlag) => void;
}

export interface DeleteFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flagToDelete: FeatureFlag | null;
  onFlagDeleted?: (flag: FeatureFlag) => void;
}

export interface FeatureFlagsFiltersProps {
  environment: string;
  onEnvironmentChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
}
