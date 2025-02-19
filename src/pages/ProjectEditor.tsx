import React, { useCallback, useEffect, useState } from 'react';
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
import { ArrowLeft, Plus } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
}

interface FlowContent {
  nodes: Node[];
  edges: Edge[];
}

const ProjectEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
    });
  }, [navigate]);

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

  const addNode = useCallback(() => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: `Node ${nodes.length + 1}` },
    };
    
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    saveContent.mutate({ nodes: updatedNodes, edges });
  }, [nodes, edges, setNodes, saveContent]);

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
          <Button onClick={addNode}>
            <Plus className="h-4 w-4 mr-2" />
            Add Node
          </Button>
        </div>
      </header>

      <div className="flex-1">
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
    </div>
  );
};

export default ProjectEditor;
