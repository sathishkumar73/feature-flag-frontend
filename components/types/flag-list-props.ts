import { FeatureFlag } from "./flag";

export interface FeatureFlagsListProps {
  loading: boolean;
  flags: FeatureFlag[];
  onEdit: (flag: FeatureFlag) => void;
  onDelete: (flag: FeatureFlag) => void;
}
