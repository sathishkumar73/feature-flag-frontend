export interface FeatureFlag {
  id: string;
  name: string;
  description?: string | null;
  enabled: boolean;
  environment: string;
  rolloutPercentage: number;
  version: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: User | null;
  updatedBy?: User | null;
}

export interface FeatureFlagCreateRequest {
  name: string;
  description?: string | null;
  enabled?: boolean;
  environment: string;
  rolloutPercentage?: number;
  createdById?: string;
}

export interface FeatureFlagUpdateRequest {
  name?: string;
  description?: string | null;
  enabled?: boolean;
  environment?: string;
  rolloutPercentage?: number;
  updatedById?: string;
}

// User type for reference
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'DEV' | 'PRODUCT_MANAGER';
  createdAt: string;
  updatedAt: string;
}