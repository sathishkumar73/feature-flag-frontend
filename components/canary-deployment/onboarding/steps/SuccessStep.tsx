'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { GCPProject } from '../../types';

interface SuccessStepProps {
  selectedProject: GCPProject | null;
  bucketName: string;
  deploymentUrl: string;
  onComplete: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  selectedProject,
  bucketName,
  deploymentUrl,
  onComplete
}) => {
  return (
    <div className="text-center space-y-6">
      <div className="animate-in zoom-in duration-700">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary animate-in zoom-in duration-500 delay-200" />
        </div>
      </div>

      <Card className="animate-in slide-in-from-bottom duration-500 delay-300">
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">🎯 Your Setup Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-muted-foreground">Project:</span>
              <span className="font-medium text-xs">{selectedProject?.projectName}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-muted-foreground">Storage:</span>
              <code className="text-xs">{bucketName}</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="text-muted-foreground">Service URL:</span>
              <code className="text-xs max-w-48 truncate">{deploymentUrl}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-3 animate-in slide-in-from-bottom duration-500 delay-500">
        <Button className="px-4 hover:scale-105 transition-transform duration-200">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open GCP Console
        </Button>
        <Button 
          variant="outline" 
          className="px-4 hover:scale-105 transition-transform duration-200"
          onClick={onComplete}
        >
          Close & Continue
        </Button>
      </div>

      <p className="text-xs text-muted-foreground animate-in fade-in duration-500 delay-700">
        🚀 Ready to start deploying with confidence!
      </p>
    </div>
  );
};

export default SuccessStep; 