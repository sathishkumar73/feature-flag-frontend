import { useState, useEffect, useRef, useCallback } from 'react';
import { GCPProject, GCPService } from '../types';
import { gcpServicesApi } from '../utils/gcpServicesApi';

interface UseCanaryOnboardingProps {
  isOpen: boolean;
  initialStep?: number;
  onComplete?: (deploymentUrl: string) => void;
  selectedProject?: GCPProject | null;
}

export const useCanaryOnboarding = ({ 
  isOpen, 
  initialStep = 1, 
  onComplete,
  selectedProject: initialSelectedProject
}: UseCanaryOnboardingProps) => {
  // Convert initialStep to internal step format (0-based)
  const getInternalStep = (externalStep: number) => {
    switch(externalStep) {
      case 1: return 0; // Authentication -> Step 0
      case 2: return 1; // Project Selection -> Step 1  
      case 3: return 2; // Deployment (skip to services) -> Step 2
      default: return 0; // Default to authentication
    }
  };

  const [currentStep, setCurrentStep] = useState(getInternalStep(initialStep));
  const [projects, setProjects] = useState<GCPProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<GCPProject | null>(initialSelectedProject || null);
  const [services, setServices] = useState<GCPService[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [animatingNext, setAnimatingNext] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [enablingServices, setEnablingServices] = useState(false);
  const [currentlyEnabling, setCurrentlyEnabling] = useState<string | null>(null);
  const [bucketName, setBucketName] = useState('');
  const [servicesError, setServicesError] = useState<string | null>(null);

  const hasFetchedProjects = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when modal opens or initialStep changes
  useEffect(() => {
    if (isOpen) {
      const internalStep = getInternalStep(initialStep);
      console.log('[CanaryOnboarding] Modal opened with initialStep:', initialStep, 'mapped to internal step:', internalStep);
      
      setCurrentStep(internalStep);
      setProjects([]);
      setSelectedProject(initialSelectedProject || null);
      setServices([]);
      setLoading(false);
      setDeploymentUrl('');
      setAnimatingNext(false);
      setProgressPercent((internalStep / 5) * 100); // Set progress based on initial step
      setEnablingServices(false);
      setCurrentlyEnabling(null);
      setBucketName('');
      setServicesError(null);
      hasFetchedProjects.current = false;
      
      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [isOpen, initialStep, initialSelectedProject]);

  // Update selectedProject when prop changes
  useEffect(() => {
    if (initialSelectedProject !== undefined) {
      setSelectedProject(initialSelectedProject);
    }
  }, [initialSelectedProject]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setServicesError(null);
      console.log('[CanaryOnboarding] Loading GCP services...');
      
      if (!selectedProject?.projectId) {
        console.error('[CanaryOnboarding] No project selected');
        setServicesError('No project selected');
        return;
      }
      
      const response = await gcpServicesApi.getServices(selectedProject.projectId);
      setServices(response.services);
      
      console.log('[CanaryOnboarding] Services loaded:', response);
      
      // Auto-advance if all services already enabled
      if (response.allEnabled) {
        console.log('[CanaryOnboarding] All services already enabled, auto-advancing...');
        setTimeout(() => transitionToStep(3), 1000);
      }
    } catch (error) {
      console.error('[CanaryOnboarding] Failed to load GCP services:', error);
      setServicesError(error instanceof Error ? error.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  // Load services when step 2 (services step) becomes active
  useEffect(() => {
    if (currentStep === 2 && selectedProject) {
      loadServices();
    }
  }, [currentStep, selectedProject, loadServices]);

  // Poll for services completion
  const pollServicesCompletion = async () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        console.log('[CanaryOnboarding] Polling for services completion...');
        
        if (!selectedProject?.projectId) {
          console.error('[CanaryOnboarding] No project selected during polling');
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
          return;
        }
        
        const response = await gcpServicesApi.getServices(selectedProject.projectId);
        setServices(response.services);
        
        if (response.allEnabled) {
          console.log('[CanaryOnboarding] All services enabled, stopping polling');
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
          setCurrentlyEnabling(null);
          
          // Auto-advance to next step
          setTimeout(() => transitionToStep(3), 1000);
        }
      } catch (error) {
        console.error('[CanaryOnboarding] Polling failed:', error);
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setServicesError(error instanceof Error ? error.message : 'Failed to check services status');
      }
    }, 2000); // Poll every 2 seconds
  };

  const transitionToStep = (step: number) => {
    setAnimatingNext(true);
    setTimeout(() => {
      setCurrentStep(step);
      setProgressPercent((step / 5) * 100);
      setAnimatingNext(false);
    }, 300);
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      console.log('[CanaryOnboarding] Initiating GCP connection...');
      // This would be replaced with real OAuth flow
      // For now, simulate the connection
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock projects for now - replace with real API call
      const mockProjects: GCPProject[] = [
        {
          projectId: 'gradual-rollout-demo',
          projectName: 'GradualRollout Demo Project',
          projectNumber: '123456789012',
          lifecycleState: 'ACTIVE',
          createTime: '2024-01-15T10:30:00Z'
        }
      ];
      
      setProjects(mockProjects);
      hasFetchedProjects.current = true;
      transitionToStep(1);
    } catch (error) {
      console.error('[CanaryOnboarding] Connection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: GCPProject) => {
    setSelectedProject(project);
    transitionToStep(2);
  };

  const handleEnableServices = async () => {
    setEnablingServices(true);
    setServicesError(null);
    
    try {
      console.log('[CanaryOnboarding] Enabling all GCP services...');
      
      if (!selectedProject?.projectId) {
        console.error('[CanaryOnboarding] No project selected');
        setServicesError('No project selected');
        return;
      }
      
      // Call the batch enable endpoint
      const response = await gcpServicesApi.enableAllServices(selectedProject.projectId);
      
      if (response.success) {
        console.log('[CanaryOnboarding] Services enablement initiated:', response);
        
        // Update UI to show enabling status for all services
        setServices(prev => prev.map(service => ({
          ...service,
          status: 'enabling' as const
        })));
        
        // Start polling for completion
        await pollServicesCompletion();
      } else {
        throw new Error(response.message || 'Failed to enable services');
      }
    } catch (error) {
      console.error('[CanaryOnboarding] Failed to enable services:', error);
      setServicesError(error instanceof Error ? error.message : 'Failed to enable services');
      
      // Update services to show failed status
      setServices(prev => prev.map(service => ({
        ...service,
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Enablement failed'
      })));
    } finally {
      setEnablingServices(false);
    }
  };

  const handleCreateBucket = async () => {
    setLoading(true);
    try {
      console.log('[CanaryOnboarding] Creating storage bucket...');
      // This would be replaced with real bucket creation API
      await new Promise(resolve => setTimeout(resolve, 1800));
      setBucketName('canary-assets-demo');
      transitionToStep(4);
    } catch (error) {
      console.error('[CanaryOnboarding] Bucket creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployProxy = async () => {
    setLoading(true);
    try {
      console.log('[CanaryOnboarding] Deploying canary proxy...');
      // This would be replaced with real deployment API
      await new Promise(resolve => setTimeout(resolve, 3500));
      setDeploymentUrl(`https://canary-proxy-${Math.random().toString(36).substring(7)}-uc.a.run.app`);
      transitionToStep(5);
    } catch (error) {
      console.error('[CanaryOnboarding] Deployment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    console.log('[CanaryOnboarding] Onboarding completed with URL:', deploymentUrl);
    // Persist onboarding completion
    localStorage.setItem('canaryOnboardingComplete', 'true');
    
    if (onComplete && deploymentUrl) {
      onComplete(deploymentUrl);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      transitionToStep(currentStep - 1);
    }
  };

  return {
    // State
    currentStep,
    projects,
    selectedProject,
    services,
    loading,
    deploymentUrl,
    animatingNext,
    progressPercent,
    enablingServices,
    currentlyEnabling,
    bucketName,
    servicesError,
    
    // Handlers
    handleConnect,
    handleProjectSelect,
    handleEnableServices,
    handleCreateBucket,
    handleDeployProxy,
    handleComplete,
    handleBack,
    transitionToStep,
    loadServices
  };
}; 