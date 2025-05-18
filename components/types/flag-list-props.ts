import { FeatureFlag } from "./flag";

export interface FeatureFlagsListProps {
  loading: boolean;
  flags: FeatureFlag[];
  onEdit: (flagId: string) => void;
  onDelete: (flagId: string) => void;
}
