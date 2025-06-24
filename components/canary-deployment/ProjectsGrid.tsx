import React from 'react';
import ProjectCard from './ProjectCard';
import { GCPProject } from './types';

interface ProjectsGridProps {
  projects: GCPProject[];
  activeProject: GCPProject | null;
  onProjectSelect: (project: GCPProject) => void;
}

const ProjectsGrid: React.FC<ProjectsGridProps> = ({ 
  projects, 
  activeProject, 
  onProjectSelect 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Your GCP Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.projectId}
            project={project}
            isActive={activeProject?.projectId === project.projectId}
            onSelect={onProjectSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectsGrid; 