'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { apiPost } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';

interface GCPAuthInitiateResponse {
  authUrl: string;
  state: string;
  expiresAt: string;
}

const GCPHeroInitialState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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