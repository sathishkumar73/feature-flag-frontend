import { GCPProject, GCPService, MockApiCalls } from './types';

export const MOCK_PROJECTS: GCPProject[] = [
  {
    projectId: 'gradual-rollout-demo',
    projectName: 'GradualRollout Demo Project',
    projectNumber: '123456789012',
    lifecycleState: 'ACTIVE',
    createTime: '2024-01-15T10:30:00Z'
  },
  {
    projectId: 'my-web-app-prod',
    projectName: 'My Web App Production',
    projectNumber: '987654321098',
    lifecycleState: 'ACTIVE',
    createTime: '2023-11-20T14:22:00Z'
  },
  {
    projectId: 'test-project-dev',
    projectName: 'Test Project Development',
    projectNumber: '456789123456',
    lifecycleState: 'ACTIVE',
    createTime: '2024-02-01T09:15:00Z'
  }
];

export const MOCK_SERVICES: GCPService[] = [
  {
    name: 'run',
    displayName: 'Cloud Run API',
    required: true,
    enabled: false,
    status: 'pending',
    description: 'Required for deploying the canary proxy service',
    estimatedTime: 3000
  },
  {
    name: 'storage-api',
    displayName: 'Cloud Storage API',
    required: true,
    enabled: true,
    status: 'enabled',
    description: 'Required for accessing stable/ and canary/ build artifacts',
    estimatedTime: 0
  },
  {
    name: 'cloudbuild',
    displayName: 'Cloud Build API',
    required: true,
    enabled: false,
    status: 'pending',
    description: 'Required for building and deploying the proxy container',
    estimatedTime: 2500
  },
  {
    name: 'monitoring',
    displayName: 'Cloud Monitoring API',
    required: true,
    enabled: false,
    status: 'pending',
    description: 'Required for metrics collection and health monitoring',
    estimatedTime: 2000
  },
  {
    name: 'iam',
    displayName: 'Identity & Access Management API',
    required: true,
    enabled: false,
    status: 'pending',
    description: 'Required for service account and permissions management',
    estimatedTime: 1500
  }
];

// Mock API calls with realistic delays
export const mockApiCalls: MockApiCalls = {
  simulateOAuthSuccess: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_PROJECTS), 1200);
    });
  },
  enableService: (serviceName: string, estimatedTime: number) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, serviceName }), estimatedTime);
    });
  },
  createBucket: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ 
        bucketName: `canary-assets-demo`,
        region: 'us-central1'
      }), 1800);
    });
  },
  deployProxy: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        serviceUrl: `https://canary-proxy-${Math.random().toString(36).substring(7)}-uc.a.run.app`,
        region: 'us-central1'
      }), 3500);
    });
  }
}; 