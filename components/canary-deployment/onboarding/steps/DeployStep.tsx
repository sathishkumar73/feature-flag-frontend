'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Play, Loader2 } from 'lucide-react';

interface DeployStepProps {
  selectedProjectName?: string;
  bucketName: string;
  loading: boolean;
  onDeploy: () => void;
}

const DeployStep: React.FC<DeployStepProps> = ({
  selectedProjectName,
  bucketName,
  loading,
  onDeploy
}) => {
  return (
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
                <div className="font-medium text-xs">{selectedProjectName}</div>
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
          onClick={onDeploy} 
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
  );
};

export default DeployStep; 