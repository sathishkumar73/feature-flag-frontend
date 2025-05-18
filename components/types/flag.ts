export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  environment: string;
  createdAt?: Date;
  updatedAt?: Date;
  rolloutPercentage: Number;
  version: number
}