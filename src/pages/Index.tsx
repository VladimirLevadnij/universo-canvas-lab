
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Code2, Landmark, BrainCircuit } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative hero-gradient">
        <div className="max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center space-y-8 animate-fade">
            <div className="inline-block">
              <span className="px-3 py-1 text-sm font-medium bg-green-50 text-green-600 rounded-full">
                Beta Release
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              Visual Programming
              <br />
              for Augmented Reality
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Create immersive AR experiences without code. Build, test, and deploy using our intuitive visual programming interface.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                className="px-8 py-6 text-lg bg-black hover:bg-gray-800 text-white transition-all"
                onClick={() => window.location.href = '/login'}
              >
                Start Creating
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
              <h3 className="text-xl font-semibold mb-2">Visual Programming</h3>
              <p className="text-gray-600">
                Create complex AR logic using intuitive drag-and-drop blocks
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all">
              <Landmark className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Infinite Canvas</h3>
              <p className="text-gray-600">
                Organize your projects on an unlimited workspace
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all">
              <BrainCircuit className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AR Integration</h3>
              <p className="text-gray-600">
                Deploy AR experiences instantly with WebXR support
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-600">
        <p>© 2024 Universo Platformo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
