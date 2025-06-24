'use client';

import React, { useState, useEffect } from 'react';
import { apiPost, apiGet } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';
import {
  BetaNotice,
  ConnectionCard,
  StatisticsDashboard,
  ProjectsGrid,
  DeployAction,
  ConnectedHeader,
  DisconnectedHeader,
  ErrorMessage,
  LoadingSpinner,
  GCPAuthInitiateResponse,
  GCPProjectsResponse,
  GCPProject
} from '@/components/canary-deployment';
import CanaryOnboarding from '@/components/canary-deployment/CanaryOnboarding';
import { Button } from '@/components/ui/button';
import { Cloud, ArrowRight, Sparkles } from 'lucide-react';

const GCPHeroInitialState = ({ setShowOnboarding }: { setShowOnboarding: (show: boolean) => void; }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [projects, setProjects] = useState<GCPProject[]>([]);
  const [activeProject, setActiveProject] = useState<GCPProject | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Get user ID from Supabase session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Check if user is connected to GCP
  useEffect(() => {
    const checkConnection = async () => {
      if (!userId) return;
      
      try {
        setLoadingProjects(true);
        const data = await apiGet<GCPProjectsResponse>('/gcp/projects');
        setProjects(data.projects || []);
        setActiveProject(data.activeProject || null);
        setIsConnected(true);
      } catch (error) {
        // If 404, user is not connected
        if (error instanceof Error && error.message.includes('404')) {
          setIsConnected(false);
        } else {
          console.error('Error checking GCP connection:', error);
        }
      } finally {
        setLoadingProjects(false);
      }
    };

    if (userId) {
      checkConnection();
    }
  }, [userId]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const data = await apiPost<GCPAuthInitiateResponse>('/gcp/auth/initiate', {
        userId: userId,
        redirectUri: `${window.location.origin}/canary-deployment/callback`
      });
      
      // Store state token for verification (optional)
      localStorage.setItem('gcp_state', data.state);
      
      // Redirect to Google OAuth
      window.location.href = data.authUrl;
      
    } catch (error) {
      console.error('Failed to initiate GCP connection:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to Google Cloud Platform');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = async (project: GCPProject) => {
    try {
      await apiPost('/gcp/projects/select', {
        userId: userId,
        projectId: project.projectId
      });
      setActiveProject(project);
    } catch (error) {
      console.error('Failed to select project:', error);
    }
  };

  const handleDeploy = () => {
    // TODO: Implement deployment logic
    console.log('Deploying canary proxies for project:', activeProject?.projectName);
  };

  if (loadingProjects) {
    return <LoadingSpinner />;
  }

  if (isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <BetaNotice />
        <ConnectedHeader />
        <StatisticsDashboard projects={projects} activeProject={activeProject} />
        <ProjectsGrid 
          projects={projects} 
          activeProject={activeProject} 
          onProjectSelect={handleProjectSelect} 
        />
        {activeProject && (
          <DeployAction activeProject={activeProject} onDeploy={handleDeploy} />
        )}
        
        {/* Onboarding Sneak Peek */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Experience Our New Onboarding Flow
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                See our beautiful, step-by-step setup process in action
              </p>
            </div>
            <Button 
              onClick={() => setShowOnboarding(true)}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Cloud className="mr-2 h-4 w-4" />
              Try the Onboarding Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not connected state
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <BetaNotice />
      <ErrorMessage error={error || ''} />
      <DisconnectedHeader />
      <ConnectionCard loading={loading} onConnect={handleConnect} />
      
      {/* Onboarding Sneak Peek */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Experience Our New Onboarding Flow
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              See our beautiful, step-by-step setup process in action
            </p>
          </div>
          <Button 
            onClick={() => setShowOnboarding(true)}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Cloud className="mr-2 h-4 w-4" />
            Try the Onboarding Demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function CanaryDeploymentPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <GCPHeroInitialState 
        setShowOnboarding={setShowOnboarding}
      />
      
      {/* Onboarding Modal */}
      <CanaryOnboarding 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={(deploymentUrl: string) => {
          console.log('Onboarding completed:', deploymentUrl);
          setShowOnboarding(false);
        }}
      />
    </div>
  );
} 