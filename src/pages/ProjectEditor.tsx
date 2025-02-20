import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ReactFlow,
  Background, 
  Controls,
  Connection,
  Edge, 
  Node,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Play } from "lucide-react";
import * as Blockly from 'blockly';
import 'blockly/blocks';
import 'blockly/javascript';

interface Project {
  id: string;
  title: string;
  description: string | null;
}

interface FlowContent {
  nodes: Node[];
  edges: Edge[];
  blocklyXml?: string;
}

const ProjectEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error("Project ID is required");
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { data: projectContent } = useQuery({
    queryKey: ['project-content', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('project_content')
        .select('*')
        .eq('project_id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
        const content = data.content as unknown as FlowContent;
        if (content.nodes && content.edges) {
          setNodes(content.nodes);
          setEdges(content.edges);
        }
      }
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
    });
  }, [navigate]);

  useEffect(() => {
    console.log('Initializing Blockly workspace...');
    if (blocklyDiv.current && !workspace) {
      console.log('Container exists, creating workspace...');
      try {
        // Configure custom blocks
        Blockly.Blocks['ar_run'] = {
          init: function() {
            this.appendDummyInput()
                .appendField("Run AR Application");
            this.appendStatementInput("BLOCKS")
                .setCheck(null);
            this.setColour(230);
            this.setTooltip("Start the AR application");
            this.setHelpUrl("");
          }
        };

        Blockly.Blocks['ar_3d_model'] = {
          init: function() {
            this.appendDummyInput()
                .appendField("3D Model")
                .appendField(new Blockly.FieldDropdown([
                  ["Cube", "CUBE"],
                  ["Sphere", "SPHERE"],
                  ["Cylinder", "CYLINDER"]
                ]), "MODEL");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
            this.setTooltip("Add a 3D model to the scene");
            this.setHelpUrl("");
          }
        };

        const toolboxConfiguration = {
          kind: 'categoryToolbox',
          contents: [
            {
              kind: 'category',
              name: 'AR Components',
              colour: '230',
              contents: [
                {
                  kind: 'block',
                  type: 'ar_run'
                },
                {
                  kind: 'block',
                  type: 'ar_3d_model'
                }
              ]
            }
          ]
        };

        console.log('Creating new workspace...');
        const newWorkspace = Blockly.inject(blocklyDiv.current, {
          toolbox: toolboxConfiguration,
          grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true,
          },
          zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2,
          },
          trashcan: true,
          move: {
            scrollbars: true,
            drag: true,
            wheel: true,
          },
        });

        console.log('Workspace created successfully');
        setWorkspace(newWorkspace);

        // Load saved workspace if it exists
        if (projectContent?.content) {
          const content = projectContent.content as unknown as FlowContent;
          if (content?.blocklyXml) {
            try {
              const xml = Blockly.utils.xml.textToDom(content.blocklyXml);
              Blockly.Xml.domToWorkspace(xml, newWorkspace);
            } catch (e) {
              console.error('Failed to load Blockly workspace:', e);
            }
          }
        }

        // Ensure the workspace is properly sized
        const resizeBlockly = () => {
          if (blocklyDiv.current && newWorkspace) {
            console.log('Resizing Blockly workspace...');
            Blockly.svgResize(newWorkspace);
          }
        };

        window.addEventListener('resize', resizeBlockly);
        // Initial resize
        setTimeout(resizeBlockly, 100);

        return () => {
          window.removeEventListener('resize', resizeBlockly);
          newWorkspace.dispose();
        };
      } catch (error) {
        console.error('Error initializing Blockly:', error);
      }
    }
  }, [blocklyDiv, workspace, projectContent]);

  const saveContent = useMutation({
    mutationFn: async (content: FlowContent) => {
      if (!id) throw new Error("Project ID is required");
      
      const { error } = await supabase
        .from('project_content')
        .upsert({
          project_id: id,
          content: content as unknown as Json,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-content', id] });
      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(connection, edges);
      setEdges(newEdges);
      saveContent.mutate({ nodes, edges: newEdges });
    },
    [edges, nodes, saveContent]
  );

  const handleSaveWorkspace = useCallback(() => {
    if (workspace) {
      const xml = Blockly.Xml.workspaceToDom(workspace);
      const xmlText = Blockly.Xml.domToText(xml);
      saveContent.mutate({
        nodes,
        edges,
        blocklyXml: xmlText,
      });
    }
  }, [workspace, nodes, edges, saveContent]);

  const handleRunCode = useCallback(() => {
    if (!workspace) return;

    // TODO: Implement AR scene generation based on Blockly workspace
    toast({
      title: "Coming Soon",
      description: "AR scene generation will be implemented in the next update.",
    });
  }, [workspace, toast]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <h1 className="text-xl font-semibold">{project?.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSaveWorkspace}>
              Save
            </Button>
            <Button onClick={handleRunCode} variant="default">
              <Play className="h-4 w-4 mr-2" />
              Run AR Scene
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-2 overflow-hidden">
        <div className="h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <div 
          ref={blocklyDiv} 
          style={{
            height: 'calc(100vh - 73px)',
            backgroundColor: '#fff',
            zIndex: 10
          }}
        />
      </div>
    </div>
  );
};

export default ProjectEditor;
