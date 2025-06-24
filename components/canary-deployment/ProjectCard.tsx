import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hash, Building2, Calendar } from 'lucide-react';
import { GCPProject } from './types';

interface ProjectCardProps {
  project: GCPProject;
  isActive: boolean;
  onSelect: (project: GCPProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isActive, onSelect }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(project)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 truncate">
            {project.projectName}
          </CardTitle>
          {isActive && (
            <Badge className="bg-blue-600 text-white">Active</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="w-4 h-4" />
            <span className="font-mono">{project.projectId}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-4 h-4" />
            <span>#{project.projectNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(project.createTime)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant={project.lifecycleState === 'ACTIVE' ? 'default' : 'secondary'}
            className={project.lifecycleState === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
          >
            {project.lifecycleState}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard; 