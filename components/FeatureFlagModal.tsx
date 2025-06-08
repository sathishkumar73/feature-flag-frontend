"use client";

import React from 'react';
import { X, Calendar, Settings, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  environment: string;
  enabled: boolean;
  rolloutPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface FeatureFlagModalProps {
  flag: FeatureFlag;
  isOpen: boolean;
  onClose: () => void;
}

const FeatureFlagModal: React.FC<FeatureFlagModalProps> = ({ flag, isOpen, onClose }) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            Feature Flag Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flag Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{flag.name}</h3>
              <Badge variant={flag.enabled ? "default" : "secondary"} className="text-sm">
                {flag.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{flag.description}</p>
          </div>

          <Separator />

          {/* Flag Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Flag ID</label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{flag.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Environment</label>
                <div className="mt-1">
                  <Badge variant="outline">{flag.environment}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Rollout Percentage</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        flag.enabled ? 'bg-primary' : 'bg-muted-foreground'
                      }`}
                      style={{ width: `${flag.rolloutPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{flag.rolloutPercentage}%</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created At
                </label>
                <p className="text-sm mt-1">{formatDateTime(flag.createdAt)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Last Updated
                </label>
                <p className="text-sm mt-1">{formatDateTime(flag.updatedAt)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    flag.enabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      flag.enabled ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    {flag.enabled ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Modal Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureFlagModal; 