'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Hash, Calendar } from 'lucide-react';

interface GCPProject {
  projectId: string;
  projectName: string;
  projectNumber: string;
  lifecycleState: string;
  createTime: string;
}

interface ProjectSelectionStepProps {
  projects: GCPProject[];
  selectedProject: GCPProject | null;
  onProjectSelect: (project: GCPProject) => void;
}

const ProjectSelectionStep: React.FC<ProjectSelectionStepProps> = ({
  projects,
  selectedProject,
  onProjectSelect
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {projects.map((project, index) => (
          <Card
            key={project.projectId}
            className={`cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-md animate-in slide-in-from-left duration-500 ${
              selectedProject?.projectId === project.projectId
                ? 'ring-2 ring-primary bg-accent scale-[1.01] shadow-md'
                : ''
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => onProjectSelect(project)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{project.projectName}</h3>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Hash className="h-3 w-3" />
                      <code className="bg-muted px-1 py-0.5 rounded">{project.projectId}</code>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(project.createTime)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">{project.lifecycleState}</Badge>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    selectedProject?.projectId === project.projectId
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {selectedProject?.projectId === project.projectId && (
                      <CheckCircle className="h-3 w-3 text-primary-foreground animate-in zoom-in duration-200" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedProject && (
        <div className="text-center animate-in slide-in-from-bottom duration-500">
          <p className="text-sm text-muted-foreground">
            Great choice! Setting up <strong>{selectedProject.projectName}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectSelectionStep; 