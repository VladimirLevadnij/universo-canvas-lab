
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as Blockly from 'blockly/core';
import BlocklyComponent from '@/components/Blockly/BlocklyComponent';
import { useI18n } from '@/i18n/i18n';
import { EditorHeader } from '@/components/ProjectEditor/EditorHeader';
import { useBlockly } from '@/hooks/useBlockly';
import { useProject } from '@/hooks/useProject';
import { isFlowContent } from '@/types/project';

const ProjectEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { translations, language, setLanguage } = useI18n();
  const [userId, setUserId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
    });
  }, [navigate]);

  // Initialize Blockly blocks with language support
  useBlockly({ translations, language });

  // Initialize project data and mutations
  const { project, projectContent, isLoading, saveContent } = useProject({
    id: id!,
    translations,
  });

  const handleSaveWorkspace = useCallback(() => {
    if (!workspace) return;

    console.log('Manual saving workspace...');
    
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    
    console.log('XML to save:', xmlText);
    
    saveContent.mutate({
      blocklyXml: xmlText,
    });
  }, [workspace, saveContent]);

  // Обработчик изменений в workspace с учетом перетаскивания
  const handleWorkspaceChange = useCallback((newWorkspace: Blockly.WorkspaceSvg) => {
    console.log('Workspace changed');
    setWorkspace(newWorkspace);
    
    // Добавляем обработчики начала и окончания перетаскивания
    if (!newWorkspace.dragStartListener) {
      newWorkspace.addChangeListener((event) => {
        if (event.type === Blockly.Events.BLOCK_DRAG) {
          setIsDragging(event.isStart);
        }
      });
      newWorkspace.dragStartListener = true;
    }

    // Сохраняем только если это не перетаскивание
    if (!isDragging) {
      const xml = Blockly.Xml.workspaceToDom(newWorkspace);
      const xmlText = Blockly.Xml.domToText(xml);
      console.log('Auto-saving XML:', xmlText);
      
      saveContent.mutate({
        blocklyXml: xmlText,
      });
    }
  }, [saveContent, isDragging]);

  const handleRunCode = useCallback(() => {
    if (!workspace) return;
    toast({
      title: translations.toasts.comingSoon.title,
      description: translations.toasts.comingSoon.description,
    });
  }, [workspace, toast, translations]);

  const handleToggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  }, [language, setLanguage]);

  if (isLoading || !project) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const flowContent = projectContent?.content as unknown;
  const initialXml = isFlowContent(flowContent) ? flowContent.blocklyXml : undefined;

  console.log('Initial XML:', initialXml);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <EditorHeader
        project={project}
        onNavigateBack={() => navigate('/projects')}
        onToggleLanguage={handleToggleLanguage}
        onSave={handleSaveWorkspace}
        onRun={handleRunCode}
        translations={translations.header}
      />

      <div className="flex-1">
        <BlocklyComponent
          initialXml={initialXml}
          onWorkspaceChange={handleWorkspaceChange}
          language={language}
        />
      </div>
    </div>
  );
};

export default ProjectEditor;
