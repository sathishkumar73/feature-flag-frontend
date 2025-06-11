export interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    environment: 'Production' | 'Staging' | 'Development'; // Use literal types for environments
    enabled: boolean;
    rolloutPercentage: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    createdById: string;
    updatedById: string;
  }
  
  export type SortField = 'name' | 'createdAt';
  export type SortDirection = 'asc' | 'desc';
  export type FlagStatusFilter = 'All' | 'Enabled' | 'Disabled';
  export type FlagEnvironmentFilter = 'All' | 'Production' | 'Staging' | 'Development';
  
  // Type for a new flag before it gets an ID and timestamps from the backend
  export interface NewFeatureFlag {
    name: string;
    description: string;
    environment: 'Production' | 'Staging' | 'Development';
    enabled: boolean;
    rolloutPercentage: number;
  }