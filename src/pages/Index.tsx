
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Code2, Landmark, BrainCircuit, LogOut, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useI18n } from '@/i18n/i18n';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { translations, language, setLanguage } = useI18n();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/projects');
      }
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate('/projects');
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: translations.toasts.auth.loggedOut.title,
        description: translations.toasts.auth.loggedOut.description,
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: translations.toasts.error.title,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-4 z-10 flex items-center gap-2">
        {user ? (
          <>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {translations.auth.signOut}
            </Button>
            <Button onClick={handleToggleLanguage} variant="ghost">
              <Globe className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="ghost"
              onClick={() => navigate('/auth')}
            >
              {translations.auth.signIn}
            </Button>
            <Button onClick={handleToggleLanguage} variant="ghost">
              <Globe className="h-4 w-4" />
            </Button>
          </>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative hero-gradient">
        <div className="max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center space-y-8 animate-fade">
            <div className="inline-block">
              <span className="px-3 py-1 text-sm font-medium bg-green-50 text-green-600 rounded-full">
                {translations.home.beta}
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              {translations.home.title}
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              {translations.home.subtitle}
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                className="px-8 py-6 text-lg bg-black hover:bg-gray-800 text-white transition-all"
                onClick={() => user ? navigate('/projects') : navigate('/auth')}
              >
                {user ? translations.home.startCreating : translations.home.signInToCreate}
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-all">
              <Code2 className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {translations.home.features.visualProgramming.title}
              </h3>
              <p className="text-gray-600">
                {translations.home.features.visualProgramming.description}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all">
              <Landmark className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {translations.home.features.infiniteCanvas.title}
              </h3>
              <p className="text-gray-600">
                {translations.home.features.infiniteCanvas.description}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all">
              <BrainCircuit className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {translations.home.features.arIntegration.title}
              </h3>
              <p className="text-gray-600">
                {translations.home.features.arIntegration.description}
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-600">
        <p>{translations.home.footer.copyright}</p>
      </footer>
    </div>
  );
};

export default Index;
