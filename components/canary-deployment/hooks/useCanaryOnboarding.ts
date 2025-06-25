import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost } from '@/lib/apiClient';
import { GCPProject, GCPService } from '../types';
import { MOCK_SERVICES, mockApiCalls } from '../mockData';

interface UseCanaryOnboardingProps {
  isOpen: boolean;
  initialStep?: number;
  onComplete?: (deploymentUrl: string) => void;
}

export const useCanaryOnboarding = ({ 
  isOpen, 
  initialStep = 1, 
  onComplete 
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
  const [selectedProject, setSelectedProject] = useState<GCPProject | null>(null);
  const [services, setServices] = useState<GCPService[]>(MOCK_SERVICES);
  const [loading, setLoading] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [animatingNext, setAnimatingNext] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [enablingServices, setEnablingServices] = useState(false);
  const [currentlyEnabling, setCurrentlyEnabling] = useState<string | null>(null);
  const [bucketName, setBucketName] = useState('');

  const hasFetchedProjects = useRef(false);

  // Reset state when modal opens or initialStep changes
  useEffect(() => {
    if (isOpen) {
      const internalStep = getInternalStep(initialStep);
      console.log('[CanaryOnboarding] Modal opened with initialStep:', initialStep, 'mapped to internal step:', internalStep);
      
      setCurrentStep(internalStep);
      setProjects([]);
      setSelectedProject(null);
      setServices(MOCK_SERVICES);
      setLoading(false);
      setDeploymentUrl('');
      setAnimatingNext(false);
      setProgressPercent((internalStep / 5) * 100); // Set progress based on initial step
      setEnablingServices(false);
      setCurrentlyEnabling(null);
      setBucketName('');
      hasFetchedProjects.current = false;
    }
  }, [isOpen, initialStep]);

  // Load projects when entering project selection step or when starting at step 2
  useEffect(() => {
    const shouldLoadProjects = isOpen && 
      (currentStep === 1 || (currentStep >= 1 && initialStep === 2)) && 
      projects.length === 0 && 
      !hasFetchedProjects.current;

    if (shouldLoadProjects) {
      hasFetchedProjects.current = true;
      const loadProjects = async () => {
        setLoading(true);
        try {
          console.log('[CanaryOnboarding] Loading projects...');
          const response = await apiGet('/gcp/projects') as { projects: GCPProject[] };
          setProjects(response.projects || []);
          console.log('[CanaryOnboarding] Projects loaded from backend:', response.projects);
          
          // Check for selected project
          console.log('[CanaryOnboarding] Calling GET /gcp/project-selection');
          const selection = await apiGet<{ projectId: string | null }>('/gcp/project-selection');
          console.log('[CanaryOnboarding] Response from GET /gcp/project-selection:', selection);
          
          if (selection.projectId) {
            const found = response.projects.find(p => p.projectId === selection.projectId) || null;
            setSelectedProject(found);
            if (found) {
              console.log('[CanaryOnboarding] Active project found and set:', found);
              // If we're starting at step 2 (project selection) but already have a project selected,
              // auto-advance to next step after a short delay
              if (initialStep === 2) {
                setTimeout(() => {
                  transitionToStep(2); // Move to services step
                }, 800);
              } else if (currentStep === 1) {
                // Normal flow from step 1
                setTimeout(() => {
                  transitionToStep(2);
                }, 800);
              }
            }
          } else {
            console.log('[CanaryOnboarding] No active project found in response');
          }
        } catch (error) {
          console.error('Failed to load projects:', error);
        } finally {
          setLoading(false);
        }
      };
      loadProjects();
    }
  }, [isOpen, currentStep, projects.length, initialStep]);

  // Smooth progress animation
  useEffect(() => {
    const targetProgress = (currentStep / 5) * 100;
    const progressTimer = setInterval(() => {
      setProgressPercent(prev => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 1) {
          clearInterval(progressTimer);
          return targetProgress;
        }
        return prev + diff * 0.1;
      });
    }, 16);

    return () => clearInterval(progressTimer);
  }, [currentStep]);

  // Smooth step transition
  const transitionToStep = (nextStep: number) => {
    console.log('[CanaryOnboarding] Transitioning to step:', nextStep);
    setAnimatingNext(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setAnimatingNext(false);
    }, 300);
  };

  // Step handlers
  const handleConnect = async () => {
    setLoading(true);
    try {
      console.log('[CanaryOnboarding] Simulating OAuth connection...');
      const mockProjects = await mockApiCalls.simulateOAuthSuccess();
      setProjects(mockProjects);
      transitionToStep(1);
    } catch (error) {
      console.error('Mock OAuth failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = async (project: GCPProject) => {
    console.log('[CanaryOnboarding] User selected project:', project.projectName, '(', project.projectId, ')');
    setSelectedProject(project);
    
    // Make backend call to set selected project
    try {
      console.log('[CanaryOnboarding] Calling POST /gcp/project-selection with:', { projectId: project.projectId });
      await apiPost('/gcp/project-selection', { projectId: project.projectId });
      console.log('[CanaryOnboarding] Successfully set selected project in backend:', project.projectName);
    } catch (error) {
      console.error('[CanaryOnboarding] Failed to set selected project in backend:', error);
    }
    
    // Persist project selection
    localStorage.setItem('canarySelectedProject', JSON.stringify(project));
    localStorage.setItem('canarySelectedProjectId', project.projectId);
    
    // Auto-advance after selection with slight delay for better UX
    setTimeout(() => {
      transitionToStep(2);
    }, 800);
  };

  const handleEnableServices = async () => {
    setEnablingServices(true);
    
    try {
      const servicesToEnable = services.filter(s => !s.enabled);
      
      for (const service of servicesToEnable) {
        // Mark as currently enabling
        setCurrentlyEnabling(service.name);
        setServices(prev => prev.map(s => 
          s.name === service.name 
            ? { ...s, status: 'enabling' }
            : s
        ));

        // Wait for the service to be enabled
        await mockApiCalls.enableService(service.name, service.estimatedTime);
        
        // Mark as enabled
        setServices(prev => prev.map(s => 
          s.name === service.name 
            ? { ...s, enabled: true, status: 'enabled' }
            : s
        ));

        // Small delay between services for better UX
        if (service !== servicesToEnable[servicesToEnable.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      setCurrentlyEnabling(null);
      
      // Auto-advance after all services are enabled
      setTimeout(() => {
        transitionToStep(3);
      }, 1000);
      
    } catch (error) {
      console.error('Mock enable services failed:', error);
    } finally {
      setEnablingServices(false);
    }
  };

  const handleCreateBucket = async () => {
    setLoading(true);
    try {
      console.log('[CanaryOnboarding] Creating storage bucket...');
      const result = await mockApiCalls.createBucket();
      setBucketName(result.bucketName);
      transitionToStep(4);
    } catch (error) {
      console.error('Mock bucket creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployProxy = async () => {
    setLoading(true);
    try {
      console.log('[CanaryOnboarding] Deploying canary proxy...');
      const result = await mockApiCalls.deployProxy();
      setDeploymentUrl(result.serviceUrl);
      transitionToStep(5);
    } catch (error) {
      console.error('Mock deployment failed:', error);
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
    
    // Handlers
    handleConnect,
    handleProjectSelect,
    handleEnableServices,
    handleCreateBucket,
    handleDeployProxy,
    handleComplete,
    handleBack,
    transitionToStep
  };
}; 