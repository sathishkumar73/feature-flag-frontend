export interface GCPProject {
  projectId: string;
  projectName: string;
  projectNumber: string;
  lifecycleState: string;
  createTime: string;
  isActive?: boolean;
}

export interface GCPService {
  name: string;
  displayName: string;
  required: boolean;
  enabled: boolean;
  status: string;
  description: string;
  estimatedTime: number;
}

export interface GCPAuthInitiateResponse {
  authUrl: string;
  state: string;
  expiresAt: string;
}

export interface GCPAuthCallbackResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  projectId?: string;
}

export interface GCPProjectsResponse {
  projects: GCPProject[];
  activeProject?: GCPProject;
}

export interface CanaryOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (deploymentUrl: string) => void;
  initialStep?: number; // Step to start at (1=auth, 2=project, 3=deployment)
}

export interface StepConfig {
  title: string;
  subtitle: string;
  emoji: string;
}

// Mock data interfaces
export interface MockApiCalls {
  simulateOAuthSuccess: () => Promise<GCPProject[]>;
  enableService: (serviceName: string, estimatedTime: number) => Promise<{ success: boolean; serviceName: string }>;
  createBucket: () => Promise<{ bucketName: string; region: string }>;
  deployProxy: () => Promise<{ serviceUrl: string; region: string }>;
} 