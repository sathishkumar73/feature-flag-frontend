import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, CheckCircle, Globe } from 'lucide-react';
import { GCPProject } from './types';

interface StatisticsDashboardProps {
  projects: GCPProject[];
  activeProject: GCPProject | null;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ projects, activeProject }) => {
  const activeProjectsCount = projects.filter(p => p.lifecycleState === 'ACTIVE').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Projects</p>
              <p className="text-2xl font-bold text-blue-900">{projects.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Projects</p>
              <p className="text-2xl font-bold text-green-900">{activeProjectsCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Selected Project</p>
              <p className="text-lg font-semibold text-purple-900 truncate">
                {activeProject?.projectName || 'None'}
              </p>
            </div>
            <Globe className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsDashboard; 