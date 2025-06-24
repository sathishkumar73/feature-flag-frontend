'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRight,
  CheckCircle,
  Calendar,
  Hash,
  Sparkles,
  Shield,
  Zap,
  Cloud,
  Loader2,
  ExternalLink,
  Folder,
  Play,
  CheckCircle2,
  Clock,
  X,
  ChevronLeft
} from 'lucide-react';

// =============================================================================
// MOCK DATA - Replace with real API calls when onboarding UI is complete
// =============================================================================

const MOCK_PROJECTS = [
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

const MOCK_SERVICES = [
  {
    name: 'run',
    displayName: 'Cloud Run API',
    required: true,
    enabled: false,
    status: 'pending',
    description: 'Required for deploying the canary proxy service',
    estimatedTime: 3000 // 3 seconds
  },
  {
    name: 'storage-api',
    displayName: 'Cloud Storage API',
    required: true,
    enabled: true,
    status: 'enabled',
    description: 'Required for accessing stable/ and canary/ build artifacts',
    estimatedTime: 0 // Already enabled
  },
  {
    name: 'cloudbuild',
    displayName: 'Cloud Build API',
    required: true,
    enabled: false,
    status: 'pending',
    description: 'Required for building and deploying the proxy container',
    estimatedTime: 2500 // 2.5 seconds
  },
  {
    name: 'monitoring',
    displayName: 'Cloud Monitoring API',
    required: true,
    enabled: false,
    status: 'pending',
    description: 'Required for metrics collection and health monitoring',
    estimatedTime: 2000 // 2 seconds
  },
  {
    name: 'iam',
    displayName: 'Identity & Access Management API',
    required: true,
    enabled: false,
    status: 'pending',
    description: 'Required for service account and permissions management',
    estimatedTime: 1500 // 1.5 seconds
  }
];

// Mock functions with realistic delays
const mockApiCalls = {
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

// =============================================================================
// END MOCK DATA
// =============================================================================

interface GCPProject {
  projectId: string;
  projectName: string;
  projectNumber: string;
  lifecycleState: string;
  createTime: string;
}

interface GCPService {
  name: string;
  displayName: string;
  required: boolean;
  enabled: boolean;
  status: string;
  description: string;
  estimatedTime: number;
}

interface CanaryOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (deploymentUrl: string) => void;
}

const CanaryOnboarding: React.FC<CanaryOnboardingProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setProjects([]);
      setSelectedProject(null);
      setServices(MOCK_SERVICES);
      setLoading(false);
      setDeploymentUrl('');
      setAnimatingNext(false);
      setProgressPercent(0);
      setEnablingServices(false);
      setCurrentlyEnabling(null);
      setBucketName('');
    }
  }, [isOpen]);

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
    setAnimatingNext(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setAnimatingNext(false);
    }, 300);
  };

  // Mock OAuth Connection
  const handleConnect = async () => {
    setLoading(true);
    try {
      const mockProjects = await mockApiCalls.simulateOAuthSuccess();
      setProjects(mockProjects as GCPProject[]);
      transitionToStep(1);
    } catch (error) {
      console.error('Mock OAuth failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step handlers with fluid transitions
  const handleProjectSelect = (project: GCPProject) => {
    setSelectedProject(project);
    // Auto-advance after selection with slight delay for better UX
    setTimeout(() => {
      transitionToStep(2);
    }, 800);
  };

  // Enhanced service enabling - one by one
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
      const result = await mockApiCalls.createBucket();
      setBucketName((result as unknown as { bucketName: string }).bucketName);
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
      const result = await mockApiCalls.deployProxy();
      setDeploymentUrl((result as unknown as { serviceUrl: string }).serviceUrl);
      transitionToStep(5);
    } catch (error) {
      console.error('Mock deployment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (onComplete && deploymentUrl) {
      onComplete(deploymentUrl);
    }
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStepConfig = () => {
    const configs = [
      {
        title: "Let's get you set up! 👋",
        subtitle: "Connect your Google Cloud account to start deploying canary proxies",
        emoji: "☁️"
      },
      {
        title: "Choose your project",
        subtitle: `We found ${projects.length} projects. Which one would you like to use?`,
        emoji: "🏗️"
      },
      {
        title: "Enable required services",
        subtitle: "We'll automatically enable the APIs you need",
        emoji: "⚙️"
      },
      {
        title: "Create storage bucket",
        subtitle: "Setting up storage for your builds",
        emoji: "📦"
      },
      {
        title: "Deploy your proxy",
        subtitle: "Almost there! Deploying your canary proxy service",
        emoji: "🚀"
      },
      {
        title: "All done! 🎉",
        subtitle: "Your canary deployment system is ready",
        emoji: "✨"
      }
    ];
    return configs[currentStep] || configs[0];
  };

  const stepConfig = getStepConfig();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
          
          {/* Progress Bar */}
          <div className="w-full bg-muted h-1 rounded-t-2xl">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out rounded-tl-2xl"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-8 h-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-8">
            
            {/* Step Indicator */}
            {currentStep > 0 && (
              <div className="text-center mb-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-2">
                  <span>{currentStep} of 5</span>
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          step <= currentStep ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={`transition-all duration-500 ease-out ${
              animatingNext ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
            }`}>
              
              {/* Header */}
              <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-700">
                <div className="text-5xl mb-4 animate-in zoom-in duration-500 delay-200">
                  {stepConfig.emoji}
                </div>
                <h1 className="text-3xl font-bold mb-3 animate-in slide-in-from-bottom-2 duration-500 delay-300">
                  {stepConfig.title}
                </h1>
                <p className="text-lg text-muted-foreground animate-in slide-in-from-bottom-2 duration-500 delay-400">
                  {stepConfig.subtitle}
                </p>
              </div>

              {/* Step Content */}
              <div className="animate-in slide-in-from-bottom-4 duration-700 delay-500">
                
                {/* Step 0: Initial Connection */}
                {currentStep === 0 && (
                  <div className="text-center space-y-6">
                    <Alert className="max-w-md mx-auto">
                      <Sparkles className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Demo Mode:</strong> This is a complete UI mockup with realistic animations
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className={`rounded-2xl bg-muted p-6 transition-all duration-300 ${
                          loading ? 'animate-pulse' : 'hover:bg-accent'
                        }`}>
                          <div className="relative">
                            <Cloud className="h-10 w-10 text-muted-foreground" />
                            {loading && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleConnect}
                        disabled={loading}
                        size="lg"
                        className="px-6 py-3 font-semibold hover:scale-105 transition-transform duration-200"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting to Google Cloud...
                          </>
                        ) : (
                          <>
                            <Cloud className="mr-2 h-4 w-4" />
                            Connect with Google Cloud
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-muted-foreground flex items-center justify-center">
                        <Shield className="mr-1 h-3 w-3" />
                        Secure OAuth 2.0 authentication
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 1: Project Selection */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      {projects.map((project, index) => (
                        <Card
                          key={project.projectId}
                          className={`cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-md animate-in slide-in-from-left duration-500 ${
                            selectedProject?.projectId === project.projectId
                              ? 'ring-2 ring-primary bg-accent scale-[1.01] shadow-md'
                              : ''
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => handleProjectSelect(project)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h3 className="font-medium">{project.projectName}</h3>
                                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Hash className="h-3 w-3" />
                                    <code className="bg-muted px-1 py-0.5 rounded">{project.projectId}</code>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(project.createTime)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs">{project.lifecycleState}</Badge>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  selectedProject?.projectId === project.projectId
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                }`}>
                                  {selectedProject?.projectId === project.projectId && (
                                    <CheckCircle className="h-3 w-3 text-primary-foreground animate-in zoom-in duration-200" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {selectedProject && (
                      <div className="text-center animate-in slide-in-from-bottom duration-500">
                        <p className="text-sm text-muted-foreground">
                          Great choice! Setting up <strong>{selectedProject.projectName}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Enable Services - Enhanced with one-by-one enabling */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Selected project: <strong>{selectedProject?.projectName}</strong>
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {services.map((service, index) => {
                        const isCurrentlyEnabling = currentlyEnabling === service.name;
                        const isEnabling = service.status === 'enabling';
                        
                        return (
                          <div
                            key={service.name}
                            className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-300 animate-in slide-in-from-right ${
                              service.enabled 
                                ? 'bg-green-50/50 border-green-200' 
                                : isEnabling 
                                  ? 'bg-blue-50/50 border-blue-200' 
                                  : 'hover:bg-accent'
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                                service.enabled 
                                  ? 'bg-green-100' 
                                  : isEnabling 
                                    ? 'bg-blue-100' 
                                    : 'bg-muted'
                              }`}>
                                {service.enabled ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 animate-in zoom-in duration-200" />
                                ) : isEnabling ? (
                                  <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                                ) : (
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{service.displayName}</h4>
                                <p className="text-xs text-muted-foreground">{service.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={service.enabled ? "default" : isEnabling ? "secondary" : "secondary"}
                                className={`text-xs ${
                                  service.enabled 
                                    ? "bg-green-100 text-green-800" 
                                    : isEnabling 
                                      ? "bg-blue-100 text-blue-800" 
                                      : ""
                                }`}
                              >
                                {service.enabled ? 'Ready' : isEnabling ? 'Enabling...' : 'Pending'}
                              </Badge>
                              {isCurrentlyEnabling && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Show progress when enabling services */}
                    {enablingServices && (
                      <div className="text-center space-y-3 animate-in fade-in duration-500">
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm font-medium">
                            Enabling services...
                          </span>
                        </div>
                        {currentlyEnabling && (
                          <p className="text-xs text-muted-foreground">
                            Currently enabling: <strong>{services.find(s => s.name === currentlyEnabling)?.displayName}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="text-center">
                      <Button 
                        onClick={handleEnableServices} 
                        disabled={enablingServices}
                        size="lg"
                        className="px-6 py-3 hover:scale-105 transition-transform duration-200"
                      >
                        {enablingServices ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enabling services...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Enable all services
                            <Zap className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Create Bucket */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <Card className="animate-in slide-in-from-bottom duration-500">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Folder className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Storage Configuration</h3>
                              <p className="text-sm text-muted-foreground">Perfect setup for your builds</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span>Bucket:</span>
                              <code className="text-xs">canary-assets-{selectedProject?.projectId}</code>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span>Structure:</span>
                              <div className="flex space-x-1">
                                <code className="text-xs">stable/</code>
                                <code className="text-xs">canary/</code>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span>Region:</span>
                              <span className="text-xs">us-central1</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="text-center">
                      <Button 
                        onClick={handleCreateBucket} 
                        disabled={loading}
                        size="lg"
                        className="px-6 py-3 hover:scale-105 transition-transform duration-200"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating storage...
                          </>
                        ) : (
                          <>
                            <Folder className="mr-2 h-4 w-4" />
                            Create storage bucket
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Deploy Proxy */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <Card className="animate-in slide-in-from-bottom duration-500">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <Zap className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Final Step</h3>
                              <p className="text-sm text-muted-foreground">Deploying your intelligent canary proxy</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                              <div className="text-muted-foreground">Project</div>
                              <div className="font-medium text-xs">{selectedProject?.projectName}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground">Storage</div>
                              <div className="font-mono text-xs">{bucketName}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground">Service</div>
                              <div className="font-medium text-xs">Cloud Run</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground">Region</div>
                              <div className="font-medium text-xs">us-central1</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {loading && (
                      <div className="text-center animate-in fade-in duration-500">
                        <div className="mb-3">
                          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                        </div>
                        <p className="font-medium text-sm">Deploying your canary proxy...</p>
                        <p className="text-xs text-muted-foreground">This usually takes 2-3 minutes</p>
                      </div>
                    )}

                    <div className="text-center">
                      <Button 
                        onClick={handleDeployProxy} 
                        disabled={loading}
                        size="lg"
                        className="px-6 py-3 hover:scale-105 transition-transform duration-200"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Deploy canary proxy
                            <Zap className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 5: Success */}
                {currentStep === 5 && (
                  <div className="text-center space-y-6">
                    <div className="animate-in zoom-in duration-700">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-primary animate-in zoom-in duration-500 delay-200" />
                      </div>
                    </div>

                    <Card className="animate-in slide-in-from-bottom duration-500 delay-300">
                      <CardContent className="p-6">
                        <h3 className="font-medium mb-4">🎯 Your Setup Details</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-muted-foreground">Project:</span>
                            <span className="font-medium text-xs">{selectedProject?.projectName}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-muted-foreground">Storage:</span>
                            <code className="text-xs">{bucketName}</code>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-muted-foreground">Service URL:</span>
                            <code className="text-xs max-w-48 truncate">{deploymentUrl}</code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-center space-x-3 animate-in slide-in-from-bottom duration-500 delay-500">
                      <Button className="px-4 hover:scale-105 transition-transform duration-200">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open GCP Console
                      </Button>
                      <Button 
                        variant="outline" 
                        className="px-4 hover:scale-105 transition-transform duration-200"
                        onClick={handleComplete}
                      >
                        Close & Continue
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground animate-in fade-in duration-500 delay-700">
                      🚀 Ready to start deploying with confidence!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Back Button (for steps > 0 and < 5) */}
            {currentStep > 0 && currentStep < 5 && !loading && !enablingServices && (
              <div className="absolute bottom-6 left-6 animate-in slide-in-from-left duration-500">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => transitionToStep(Math.max(0, currentStep - 1))}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CanaryOnboarding;