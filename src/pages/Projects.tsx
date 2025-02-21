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
import { FolderPlus, Folder, ArrowLeft, LogOut, Globe } from "lucide-react";

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
  const [language, setLanguage] = useState('en');

  const translations = {
    header: {
      backToProjects: 'Back to Projects',
    },
    projects: {
      title: 'My Projects',
      newProject: 'New Project',
      emailVerification: {
        message: 'Please verify your email address to ensure account security.',
        resend: 'Resend verification email',
      },
      createProject: 'Create New Project',
      projectTitle: 'Project Title',
      description: 'Description',
      form: {
        enterTitle: 'Enter project title',
        enterDescription: 'Enter project description',
      },
      actions: {
        creating: 'Creating...',
        create: 'Create Project',
        open: 'Open Project',
      },
      loading: 'Loading projects...',
      empty: {
        title: 'No projects',
        description: 'Get started by creating a new project.',
      },
    },
    auth: {
      signOut: 'Sign Out',
    },
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);
    });

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

  const handleToggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No email address found",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
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
      {user?.email && !user?.email_confirmed_at && (
        <div className="bg-yellow-50 border-b border-yellow-100 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-yellow-800">
              {translations.projects.emailVerification.message}
            </p>
            <Button
              variant="outline"
              onClick={resendVerificationEmail}
              className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
            >
              {translations.projects.emailVerification.resend}
            </Button>
          </div>
        </div>
      )}

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
                {translations.header.backToProjects}
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">{translations.projects.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    {translations.projects.newProject}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>{translations.projects.createProject}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                      <Label htmlFor="title">{translations.projects.projectTitle}</Label>
                      <Input
                        id="title"
                        value={newProject.title}
                        onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={translations.projects.form.enterTitle}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">{translations.projects.description}</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        placeholder={translations.projects.form.enterDescription}
                        rows={3}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createProject.isPending}
                    >
                      {createProject.isPending 
                        ? translations.projects.actions.creating 
                        : translations.projects.actions.create}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {translations.auth.signOut}
              </Button>
              <Button onClick={handleToggleLanguage} variant="ghost">
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">{translations.projects.loading}</div>
        ) : !projects?.length ? (
          <div className="text-center py-12">
            <Folder className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              {translations.projects.empty.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {translations.projects.empty.description}
            </p>
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
                    {translations.projects.actions.open}
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
