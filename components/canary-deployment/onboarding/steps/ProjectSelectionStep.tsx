'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Hash } from 'lucide-react';
import { GCPProject } from '../../types';

interface ProjectSelectionStepProps {
  projects: GCPProject[];
  selectedProject: GCPProject | null;
  loading: boolean;
  onProjectSelect: (project: GCPProject) => void;
}

const ProjectSelectionStep: React.FC<ProjectSelectionStepProps> = ({
  projects,
  selectedProject,
  loading,
  onProjectSelect
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <div className="text-lg text-muted-foreground">Loading your GCP projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <div className="text-6xl">🚧</div>
        <h2 className="text-2xl font-semibold">No projects found</h2>
        <p className="text-gray-500 text-center max-w-md">
          We couldn&apos;t find any GCP projects for your account.<br />
          Please create a project in your Google Cloud Console and try again.
        </p>
        <Button
          onClick={() => window.location.reload()}
          size="lg"
          className="px-6 py-3 mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

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