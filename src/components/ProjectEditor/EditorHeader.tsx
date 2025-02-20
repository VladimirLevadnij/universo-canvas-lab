
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Globe } from "lucide-react";
import { Project } from '@/types/project';

interface EditorHeaderProps {
  project: Project;
  onNavigateBack: () => void;
  onToggleLanguage: () => void;
  onSave: () => void;
  onRun: () => void;
  translations: {
    backToProjects: string;
    save: string;
    runARScene: string;
  };
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  project,
  onNavigateBack,
  onToggleLanguage,
  onSave,
  onRun,
  translations,
}) => {
  return (
    <header className="bg-white border-b p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onNavigateBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {translations.backToProjects}
          </Button>
          <h1 className="text-xl font-semibold">{project.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onToggleLanguage} variant="ghost">
            <Globe className="h-4 w-4" />
          </Button>
          <Button onClick={onSave}>
            {translations.save}
          </Button>
          <Button onClick={onRun} variant="default">
            <Play className="h-4 w-4 mr-2" />
            {translations.runARScene}
          </Button>
        </div>
      </div>
    </header>
  );
};
