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

const GCPHeroInitialState = () => {
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
    </div>
  );
};

export default function CanaryDeploymentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <GCPHeroInitialState />
    </div>
  );
} 