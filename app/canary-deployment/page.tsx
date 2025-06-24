'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  ArrowRight,
  Loader2,
  CheckCircle,
  Building2,
  Calendar,
  Hash,
  Globe
} from 'lucide-react';
import { apiPost, apiGet } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';

interface GCPAuthInitiateResponse {
  authUrl: string;
  state: string;
  expiresAt: string;
}

interface GCPProject {
  projectId: string;
  projectName: string;
  projectNumber: string;
  lifecycleState: string;
  createTime: string;
  isActive?: boolean;
}

interface GCPProjectsResponse {
  projects: GCPProject[];
  activeProject?: GCPProject;
}

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loadingProjects) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading your Google Cloud projects...</p>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Beta Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Beta
            </Badge>
            <span className="text-sm font-medium text-yellow-800">Under Active Development</span>
          </div>
          <p className="text-sm text-yellow-700">
            This feature is currently in beta and under active development. 
            Please use test projects only for now.
          </p>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Connected to Google Cloud Platform</h1>
          </div>
          <p className="text-gray-600">
            Your GCP account is connected. Select a project to start deploying canary proxies.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Projects</p>
                  <p className="text-2xl font-bold text-blue-900">{projects.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active Projects</p>
                  <p className="text-2xl font-bold text-green-900">
                    {projects.filter(p => p.lifecycleState === 'ACTIVE').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Selected Project</p>
                  <p className="text-lg font-semibold text-purple-900 truncate">
                    {activeProject?.projectName || 'None'}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Your GCP Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card 
                key={project.projectId}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  activeProject?.projectId === project.projectId 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleProjectSelect(project)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                      {project.projectName}
                    </CardTitle>
                    {activeProject?.projectId === project.projectId && (
                      <Badge className="bg-blue-600 text-white">Active</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Hash className="w-4 h-4" />
                      <span className="font-mono">{project.projectId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>#{project.projectNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(project.createTime)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={project.lifecycleState === 'ACTIVE' ? 'default' : 'secondary'}
                      className={project.lifecycleState === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {project.lifecycleState}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {activeProject && (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Ready to Deploy Canary Proxies
              </h3>
              <p className="text-green-700 mb-4">
                Selected project: <strong>{activeProject.projectName}</strong>
              </p>
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Cloud className="w-5 h-5 mr-2" />
                Deploy Canary Proxies
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not connected state
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Beta Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Beta
          </Badge>
          <span className="text-sm font-medium text-yellow-800">Under Active Development</span>
        </div>
        <p className="text-sm text-yellow-700">
          This feature is currently in beta and under active development. 
          Please use test projects only for now.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Connect to Google Cloud Platform</h1>
        <p className="text-black">
          Connect your GCP account to enable zero-setup canary deployments with Cloud Run
        </p>
      </div>

      {/* Connection Status Card */}
      <Card className="border-2 border-dashed border-muted">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Cloud className="w-6 h-6 mr-2 text-accent" />
              GCP Connection Status
            </div>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              Disconnected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Cloud className="w-10 h-10 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Connect</h3>
              <p className="text-gray-600 mb-4">
                Connect your Google Cloud Platform account to deploy canary proxies in minutes
              </p>
              <Button 
                onClick={handleConnect}
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
            </div>
          </div>
        </CardContent>
      </Card>
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