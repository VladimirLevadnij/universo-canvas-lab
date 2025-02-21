
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Project, FlowContent } from '@/types/project';
import { Json } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

interface UseProjectProps {
  id: string;
  translations: {
    toasts: {
      saved: {
        title: string;
        description: string;
      };
      error: {
        title: string;
        description: string;
      };
    };
  };
}

export const useProject = ({ id, translations }: UseProjectProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      return data;
    },
    enabled: !!id,
  });

  const saveContent = useMutation({
    mutationFn: async (content: FlowContent) => {
      if (!id) throw new Error("Project ID is required");
      
      // Проверяем существование записи перед upsert
      const { data: existingContent } = await supabase
        .from('project_content')
        .select('*')
        .eq('project_id', id)
        .maybeSingle();

      // Если запись не существует, создаем новую
      if (!existingContent) {
        const { error } = await supabase
          .from('project_content')
          .insert([{
            project_id: id,
            content: content as unknown as Json,
          }]);

        if (error) throw error;
      } else {
        // Если запись существует, обновляем её
        const { error } = await supabase
          .from('project_content')
          .update({
            content: content as unknown as Json,
          })
          .eq('project_id', id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-content', id] });
      toast({
        title: translations.toasts.saved.title,
        description: translations.toasts.saved.description,
      });
    },
    onError: (error: any) => {
      toast({
        title: translations.toasts.error.title,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    project,
    projectContent,
    isLoading,
    saveContent,
  };
};
