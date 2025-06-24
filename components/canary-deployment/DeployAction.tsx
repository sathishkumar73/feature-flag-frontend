import React from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, ArrowRight } from 'lucide-react';
import { GCPProject } from './types';

interface DeployActionProps {
  activeProject: GCPProject;
  onDeploy?: () => void;
}

const DeployAction: React.FC<DeployActionProps> = ({ activeProject, onDeploy }) => {
  return (
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
          onClick={onDeploy}
        >
          <Cloud className="w-5 h-5 mr-2" />
          Deploy Canary Proxies
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default DeployAction; 