import { apiGet, apiPost } from '@/lib/apiClient';
import { 
  GCPServicesResponse, 
  EnableAllServicesResponse, 
  EnableServiceResponse, 
  ServiceStatusResponse 
} from '../types';

// GCP Services API integration
export const gcpServicesApi = {
  // Get all services status
  getServices: (projectId?: string) => {
    const url = projectId ? `/gcp/services?projectId=${projectId}` : '/gcp/services';
    return apiGet<GCPServicesResponse>(url);
  },
  
  // Enable all services at once (recommended)
  enableAllServices: (projectId?: string) => {
    const payload = projectId ? { projectId } : {};
    return apiPost<EnableAllServicesResponse>('/gcp/services/enable-all', payload);
  },
  
  // Enable individual service (if needed)
  enableService: (serviceName: string, projectId?: string) => {
    const payload = projectId ? { serviceName, projectId } : { serviceName };
    return apiPost<EnableServiceResponse>('/gcp/services/enable', payload);
  },
  
  // Check individual service status (for polling if needed)
  getServiceStatus: (serviceName: string, projectId?: string) => {
    const url = projectId ? `/gcp/services/status/${serviceName}?projectId=${projectId}` : `/gcp/services/status/${serviceName}`;
    return apiGet<ServiceStatusResponse>(url);
  }
}; 