export interface GCPProject {
  projectId: string;
  projectName: string;
  projectNumber: string;
  lifecycleState: string;
  createTime: string;
  isActive?: boolean;
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