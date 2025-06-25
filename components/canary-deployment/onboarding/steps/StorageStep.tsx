'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, ArrowRight, Loader2 } from 'lucide-react';
import { GCPProject } from '../../types';

interface StorageStepProps {
  selectedProject: GCPProject | null;
  loading: boolean;
  onCreateBucket: () => void;
}

const StorageStep: React.FC<StorageStepProps> = ({
  selectedProject,
  loading,
  onCreateBucket
}) => {
  return (
    <div className="space-y-6">
      <Card className="animate-in slide-in-from-bottom duration-500">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Folder className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Storage Configuration</h3>
                <p className="text-sm text-muted-foreground">Perfect setup for your builds</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Bucket:</span>
                <code className="text-xs">canary-assets-{selectedProject?.projectId}</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Structure:</span>
                <div className="flex space-x-1">
                  <code className="text-xs">stable/</code>
                  <code className="text-xs">canary/</code>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Region:</span>
                <span className="text-xs">us-central1</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          onClick={onCreateBucket} 
          disabled={loading}
          size="lg"
          className="px-6 py-3 hover:scale-105 transition-transform duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating storage...
            </>
          ) : (
            <>
              <Folder className="mr-2 h-4 w-4" />
              Create storage bucket
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StorageStep; 