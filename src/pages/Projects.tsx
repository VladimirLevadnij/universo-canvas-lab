
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { FolderPlus, Folder, ArrowLeft } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  is_public: boolean;
}

const Projects = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get and monitor user session
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!userId,
  });

  // Create project mutation
  const createProject = useMutation({
    mutationFn: async (projectData: { title: string; description: string }) => {
      if (!userId) throw new Error("You must be logged in to create a project");
      
      const { data, error } = await supabase
        .from('projects')
        .insert([
          { 
            title: projectData.title,
            description: projectData.description || null,
            owner_id: userId,
            is_public: false
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', userId] });
      setIsDialogOpen(false);
      setNewProject({ title: '', description: '' });
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate(newProject, {
      onSuccess: (data) => {
        setIsDialogOpen(false);
        setNewProject({ title: '', description: '' });
        // Redirect to the new project
        navigate(`/projects/${data.id}`);
        toast({
          title: "Project created",
          description: "Your new project has been created successfully.",
        });
      },
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "Come back soon!",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle email verification
  const resendVerificationEmail = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup'
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email sent",
        description: "Please check your inbox for the verification link.",
      });
    }
  };

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Email verification banner */}
      {user?.email && !user?.email_confirmed_at && (
        <div className="bg-yellow-50 border-b border-yellow-100 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-yellow-800">
              Please verify your email address to ensure account security.
            </p>
            <Button
              variant="outline"
              onClick={resendVerificationEmail}
              className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
            >
              Resend verification email
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">My Projects</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createProject.isPending}
                  >
                    {createProject.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Project Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : !projects?.length ? (
          <div className="text-center py-12">
            <Folder className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    Open Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
