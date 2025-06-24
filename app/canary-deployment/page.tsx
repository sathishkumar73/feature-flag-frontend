'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  ArrowRight
} from 'lucide-react';

const GCPHeroInitialState = () => {
  const handleConnect = () => {
    // In real implementation, this would redirect to Google OAuth
    console.log('Initiating GCP OAuth flow...');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
                className="primary hover:bg-blue-700 text-white px-8 py-3"
                size="lg"
              >
                <Cloud className="w-5 h-5 mr-2" />
                Connect with Google Cloud
                <ArrowRight className="w-4 h-4 ml-2" />
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