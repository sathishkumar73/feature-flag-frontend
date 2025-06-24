'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Settings, Zap, Loader2 } from 'lucide-react';

interface GCPService {
  name: string;
  displayName: string;
  required: boolean;
  enabled: boolean;
  status: string;
  description: string;
  estimatedTime: string;
}

interface ServicesStepProps {
  services: GCPService[];
  selectedProjectName?: string;
  loading: boolean;
  onEnableServices: () => void;
}

const ServicesStep: React.FC<ServicesStepProps> = ({
  services,
  selectedProjectName,
  loading,
  onEnableServices
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Selected project: <strong>{selectedProjectName}</strong>
        </p>
      </div>
      
      <div className="space-y-3">
        {services.map((service, index) => (
          <div
            key={service.name}
            className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-300 animate-in slide-in-from-right ${
              service.enabled ? 'bg-green-50/50 border-green-200' : 'hover:bg-accent'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                service.enabled ? 'bg-green-100' : 'bg-muted'
              }`}>
                {service.enabled ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 animate-in zoom-in duration-200" />
                ) : (
                  <Clock className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm">{service.displayName}</h4>
                <p className="text-xs text-muted-foreground">{service.description}</p>
              </div>
            </div>
            <Badge 
              variant={service.enabled ? "default" : "secondary"}
              className={`text-xs ${service.enabled ? "bg-green-100 text-green-800" : ""}`}
            >
              {service.enabled ? 'Ready' : 'Pending'}
            </Badge>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button 
          onClick={onEnableServices} 
          disabled={loading}
          size="lg"
          className="px-6 py-3 hover:scale-105 transition-transform duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enabling services...
            </>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Enable all services
              <Zap className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ServicesStep; 