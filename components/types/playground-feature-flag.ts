// Strict type for PlaygroundFeatureFlag matching Prisma schema
export interface PlaygroundFeatureFlag {
  id: string;
  session_id: string;
  flag_key: string;
  enabled: boolean;
  rollout_percentage: number;
  createdAt: string;
  updatedAt: string;
}
