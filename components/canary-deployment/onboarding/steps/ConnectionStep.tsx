'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cloud, ArrowRight, Shield, Loader2, Sparkles } from 'lucide-react';

interface ConnectionStepProps {
  loading: boolean;
  onConnect: () => void;
}

const ConnectionStep: React.FC<ConnectionStepProps> = ({ loading, onConnect }) => {
  return (
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
          onClick={onConnect}
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
  );
};

export default ConnectionStep; 