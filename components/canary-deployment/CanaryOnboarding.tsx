'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  X,
  ChevronLeft
} from 'lucide-react';
import { CanaryOnboardingProps } from './types';
import { useCanaryOnboarding } from './hooks/useCanaryOnboarding';
import { getStepConfig } from './utils/stepConfig';
import {
  ConnectionStep,
  ProjectSelectionStep,
  ServicesStep,
  StorageStep,
  DeployStep,
  SuccessStep
} from './onboarding';

const CanaryOnboarding: React.FC<CanaryOnboardingProps> = ({ 
  isOpen, 
  onClose, 
  onComplete,
  initialStep = 1,
  selectedProject
}) => {
  const {
    // State
    currentStep,
    projects,
    selectedProject: hookSelectedProject,
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
    loadServices,
  } = useCanaryOnboarding({ isOpen, initialStep, onComplete, selectedProject });

  const stepConfig = getStepConfig(currentStep, projects.length);

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
                <div className="flex items-center justify-between mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </Button>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{currentStep + 1} of 5</span>
                    <div className="flex space-x-1">
                      {[0,1,2,3,4].map((step) => (
                        <div
                          key={step}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            step === currentStep ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="w-16"></div> {/* Spacer for centering */}
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
                  <ConnectionStep 
                    loading={loading}
                    onConnect={handleConnect}
                  />
                )}

                {/* Step 1: Project Selection */}
                {currentStep === 1 && (
                  <ProjectSelectionStep 
                    projects={projects}
                    selectedProject={hookSelectedProject || null}
                    loading={loading}
                    onProjectSelect={handleProjectSelect}
                  />
                )}

                {/* Step 2: Enable Services */}
                {currentStep === 2 && (
                  <ServicesStep 
                    services={services}
                    selectedProject={hookSelectedProject ? { projectName: hookSelectedProject.projectName } : null}
                    enablingServices={enablingServices}
                    currentlyEnabling={currentlyEnabling}
                    servicesError={servicesError}
                    loading={loading}
                    onEnableServices={handleEnableServices}
                    onRetry={loadServices}
                  />
                )}

                {/* Step 3: Create Bucket */}
                {currentStep === 3 && (
                  <StorageStep 
                    selectedProject={hookSelectedProject || null}
                    loading={loading}
                    onCreateBucket={handleCreateBucket}
                  />
                )}

                {/* Step 4: Deploy Proxy */}
                {currentStep === 4 && (
                  <DeployStep 
                    selectedProject={hookSelectedProject || null}
                    bucketName={bucketName}
                    loading={loading}
                    onDeploy={handleDeployProxy}
                  />
                )}

                {/* Step 5: Success */}
                {currentStep === 5 && (
                  <SuccessStep 
                    selectedProject={hookSelectedProject || null}
                    bucketName={bucketName}
                    deploymentUrl={deploymentUrl}
                    onComplete={handleComplete}
                  />
                )}
              </div>
            </div>

            {/* Back Button (for steps > 0 and < 5) */}
            {currentStep > 0 && currentStep < 5 && !loading && !enablingServices && (
              <div className="absolute bottom-6 left-6 animate-in slide-in-from-left duration-500">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
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