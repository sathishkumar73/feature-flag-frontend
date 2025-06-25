import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, ArrowRight, Loader2, CheckCircle, Circle, Clock } from 'lucide-react';

interface ConnectionCardProps {
  loading: boolean;
  onConnect: () => void;
  connectionStatus: 'not-connected' | 'connected' | 'disconnected';
  currentStep?: number; // Optional prop to track current step
  isConnected?: boolean; // New prop to determine if user is already connected
  isProjectSelected?: boolean; // New prop to determine if project is already selected
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ 
  loading, 
  onConnect, 
  connectionStatus,
  currentStep = 0,
  isConnected = false,
  isProjectSelected = false // default to false
}) => {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          text: 'Connected',
          className: 'bg-green-100 text-green-800 border-green-200',
          variant: 'default' as const
        };
      case 'disconnected':
        return {
          text: 'Disconnected',
          className: 'bg-red-100 text-red-800 border-red-200',
          variant: 'secondary' as const
        };
      case 'not-connected':
      default:
        return {
          text: 'Not Connected',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          variant: 'secondary' as const
        };
    }
  };

  const onboardingSteps = [
    { id: 0, title: 'Connect to GCP', description: 'Authenticate with Google Cloud Platform' },
    { id: 1, title: 'Select Project', description: 'Choose your GCP project' },
    { id: 2, title: 'Enable Services', description: 'Enable required APIs and services' },
    { id: 3, title: 'Create Storage', description: 'Set up storage bucket for builds' },
    { id: 4, title: 'Deploy Proxy', description: 'Deploy canary proxy service' },
    { id: 5, title: 'Complete Setup', description: 'Your canary deployment is ready' }
  ];

  // Calculate the effective current step based on connection status
  const getEffectiveCurrentStep = () => {
    if (isConnected && isProjectSelected) {
      return 2; // Both GCP and project are selected, move to next step
    }
    if (isConnected) {
      return 1;
    }
    return currentStep;
  };

  const effectiveCurrentStep = getEffectiveCurrentStep();

  const getStepIcon = (stepId: number) => {
    if (stepId < effectiveCurrentStep) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (stepId === effectiveCurrentStep) {
      return <Clock className="w-4 h-4 text-blue-600" />;
    } else {
      return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < effectiveCurrentStep) {
      return 'completed';
    } else if (stepId === effectiveCurrentStep) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-muted">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Cloud className="w-6 h-6 mr-2 text-accent" />
              GCP Connection Status
            </div>
            <Badge 
              variant={statusConfig.variant} 
              className={`border ${statusConfig.className}`}
            >
              {statusConfig.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Cloud className="w-10 h-10 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isConnected ? 'Already Connected' : 'Ready to Connect'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isConnected 
                  ? 'Your Google Cloud Platform account is connected. You can proceed with the next steps.'
                  : 'Connect your Google Cloud Platform account to deploy canary proxies in minutes'
                }
              </p>
              {!isConnected && (
                <Button 
                  onClick={onConnect}
                  disabled={loading}
                  className="primary hover:bg-blue-700 text-white px-8 py-3"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-5 h-5 mr-2" />
                      Connect with Google Cloud
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
              {isConnected && (
                <Button 
                  onClick={onConnect}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue Setup
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remaining Steps Section */}
      <Card className="border border-muted">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Setup Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {onboardingSteps.map((step) => {
              const status = getStepStatus(step.id);
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    status === 'completed' 
                      ? 'bg-green-50 border border-green-200' 
                      : status === 'current'
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {getStepIcon(step.id)}
                  <div className="flex-1">
                    <div className={`font-medium ${
                      status === 'completed' 
                        ? 'text-green-800' 
                        : status === 'current'
                        ? 'text-blue-800'
                        : 'text-gray-600'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-sm ${
                      status === 'completed' 
                        ? 'text-green-600' 
                        : status === 'current'
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                  {status === 'completed' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Complete
                    </Badge>
                  )}
                  {status === 'current' && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Current
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Progress Summary */}
          <div className="mt-4 pt-4 border-t border-muted">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {effectiveCurrentStep === 0 
                  ? 'Ready to start setup' 
                  : effectiveCurrentStep === onboardingSteps.length - 1
                  ? 'Setup complete!'
                  : `${effectiveCurrentStep} of ${onboardingSteps.length - 1} steps completed`
                }
              </span>
              <span className="text-gray-500">
                {Math.round((effectiveCurrentStep / (onboardingSteps.length - 1)) * 100)}% complete
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(effectiveCurrentStep / (onboardingSteps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionCard; 