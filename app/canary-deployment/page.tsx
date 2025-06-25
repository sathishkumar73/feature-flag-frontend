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
  GCPProjectsResponse,
  GCPProject
} from '@/components/canary-deployment';
import CanaryOnboarding from '@/components/canary-deployment/CanaryOnboarding';
import { Button } from '@/components/ui/button';
import Loader3DCube from '@/components/ui/loader';
import { Cloud, ArrowRight } from 'lucide-react';

const GCPHeroInitialState = ({ setShowOnboarding }: { setShowOnboarding: (show: boolean, initialStep?: number) => void; }) => {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [projects, setProjects] = useState<GCPProject[]>([]);
  const [activeProject, setActiveProject] = useState<GCPProject | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

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

  // Check onboarding completion status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboardingComplete = localStorage.getItem('canaryOnboardingComplete');
      const selectedProjectData = localStorage.getItem('canarySelectedProject');
      
      setHasCompletedOnboarding(onboardingComplete === 'true');
      
      // If we have a selected project in localStorage, set it
      if (selectedProjectData) {
        try {
          const project = JSON.parse(selectedProjectData);
          setActiveProject(project);
        } catch (error) {
          console.error('Error parsing saved project:', error);
        }
      }
    }
  }, []);

  // Check if user is connected to GCP
  useEffect(() => {
    const checkConnection = async () => {
      if (!userId) return;
      
      try {
        setLoadingProjects(true);
        const data = await apiGet<GCPProjectsResponse>('/gcp/projects');
        setProjects(data.projects || []);
        
        // If we have an active project from API, use it (overrides localStorage)
        if (data.activeProject) {
          setActiveProject(data.activeProject);
          // Update localStorage with the API project
          localStorage.setItem('canarySelectedProject', JSON.stringify(data.activeProject));
          localStorage.setItem('canarySelectedProjectId', data.activeProject.projectId);
        }
        
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

  // Determine connection status
  const getConnectionStatus = () => {
    if (isConnected) {
      return 'connected';
    } else if (hasCompletedOnboarding === false) {
      return 'disconnected';
    } else {
      return 'not-connected';
    }
  };

  const handleConnect = async () => {
    // Start onboarding flow at step 1 (authentication) for first-time users
    setShowOnboarding(true, 1);
  };

  const handleProjectSelect = async (project: GCPProject) => {
    try {
      await apiPost('/gcp/projects/select', {
        userId: userId,
        projectId: project.projectId
      });
      setActiveProject(project);
      
      // Persist project selection
      localStorage.setItem('canarySelectedProject', JSON.stringify(project));
      localStorage.setItem('canarySelectedProjectId', project.projectId);
    } catch (error) {
      console.error('Failed to select project:', error);
    }
  };

  const handleDeploy = () => {
    // TODO: Implement deployment logic
    console.log('Deploying canary proxies for project:', activeProject?.projectName);
  };

  if (loadingProjects) {
    return <div className="min-h-screen flex items-center justify-center text-xl"><Loader3DCube/></div>;
  }

  // Show connected state with selected project (returning user)
  if (isConnected && hasCompletedOnboarding && activeProject) {
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
      </div>
    );
  }

  // Show connected state but no project selected (user connected but needs to select project)
  if (isConnected && !activeProject) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <BetaNotice />
        <ConnectedHeader />
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            You&apos;re connected to GCP! Let&apos;s select a project to get started.
          </p>
          <Button 
            onClick={() => setShowOnboarding(true, 2)}
            size="lg"
            className="px-6 py-3"
          >
            <Cloud className="mr-2 h-4 w-4" />
            Select Project
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Not connected state (first-time user)
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <BetaNotice />
      <ErrorMessage error={error || ''} />
      <DisconnectedHeader />
      <ConnectionCard 
        loading={loading} 
        onConnect={handleConnect} 
        connectionStatus={getConnectionStatus()}
        currentStep={0}
        isConnected={isConnected}
      />
    </div>
  );
};

export default function CanaryDeploymentPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialStep, setInitialStep] = useState(0);

  const handleShowOnboarding = (show: boolean, step?: number) => {
    setShowOnboarding(show);
    setInitialStep(step || 0);
  };

  const handleOnboardingComplete = (deploymentUrl: string) => {
    console.log('Onboarding completed:', deploymentUrl);
    setShowOnboarding(false);
    
    // Refresh the page to show the updated state
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <GCPHeroInitialState 
        setShowOnboarding={handleShowOnboarding}
      />
      
      {/* Onboarding Modal */}
      <CanaryOnboarding 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        initialStep={initialStep}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
} 