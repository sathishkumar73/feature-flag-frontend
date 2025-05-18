import { FeatureFlag } from "./flag";

export interface FeatureFlagsListProps {
  loading: boolean;
  flags: FeatureFlag[];
}