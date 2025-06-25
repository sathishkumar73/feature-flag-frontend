'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Shield, Zap, Loader2 } from 'lucide-react';
import { GCPService } from '../../types';

interface ServicesStepProps {
  services: GCPService[];
  selectedProject: { projectName: string } | null;
  enablingServices: boolean;
  currentlyEnabling: string | null;
  onEnableServices: () => void;
}

const ServicesStep: React.FC<ServicesStepProps> = ({
  services,
  selectedProject,
  enablingServices,
  currentlyEnabling,
  onEnableServices
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Selected project: <strong>{selectedProject?.projectName}</strong>
        </p>
      </div>
      
      <div className="space-y-3">
        {services.map((service, index) => {
          const isCurrentlyEnabling = currentlyEnabling === service.name;
          const isEnabling = service.status === 'enabling';
          
          return (
            <div
              key={service.name}
              className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-300 animate-in slide-in-from-right ${
                service.enabled 
                  ? 'bg-green-50/50 border-green-200' 
                  : isEnabling 
                    ? 'bg-blue-50/50 border-blue-200' 
                    : 'hover:bg-accent'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  service.enabled 
                    ? 'bg-green-100' 
                    : isEnabling 
                      ? 'bg-blue-100' 
                      : 'bg-muted'
                }`}>
                  {service.enabled ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 animate-in zoom-in duration-200" />
                  ) : isEnabling ? (
                    <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                  ) : (
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{service.displayName}</h4>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={service.enabled ? "default" : isEnabling ? "secondary" : "secondary"}
                  className={`text-xs ${
                    service.enabled 
                      ? "bg-green-100 text-green-800" 
                      : isEnabling 
                        ? "bg-blue-100 text-blue-800" 
                        : ""
                  }`}
                >
                  {service.enabled ? 'Ready' : isEnabling ? 'Enabling...' : 'Pending'}
                </Badge>
                {isCurrentlyEnabling && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {enablingServices && (
        <div className="text-center space-y-3 animate-in fade-in duration-500">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">
              Enabling services...
            </span>
          </div>
          {currentlyEnabling && (
            <p className="text-xs text-muted-foreground">
              Currently enabling: <strong>{services.find(s => s.name === currentlyEnabling)?.displayName}</strong>
            </p>
          )}
        </div>
      )}

      <div className="text-center">
        <Button 
          onClick={onEnableServices} 
          disabled={enablingServices}
          size="lg"
          className="px-6 py-3 hover:scale-105 transition-transform duration-200"
        >
          {enablingServices ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enabling services...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
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