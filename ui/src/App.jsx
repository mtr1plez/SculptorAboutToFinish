import React, { useState, useEffect } from 'react';
import { Film, LayoutTemplate } from 'lucide-react';

import { Library } from './components/Library';
import { Projects } from './components/Projects';
import { ProjectDetail } from './components/ProjectDetail';

/* =========================
   Loading Screen
   ========================= */
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 text-zinc-900 select-none z-50">
      
      <div className="flex flex-col items-center space-y-6">
        
        {/* Logo */}
        <div className="relative">
          <img
            src="app-icon.png"
            alt="Sculptor Pro"
            className="h-28 w-28 drop-shadow-xl"
          />
          {/* мягкое свечение */}
          <div className="absolute inset-0 rounded-full blur-2xl bg-blue-500/20 -z-10" />
        </div>

        {/* Title */}
        <div className="flex flex-col items-center space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Sculptor Pro
          </h1>
          <p className="text-sm text-zinc-500 tracking-wide">
            Инициализация AI Engine
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center space-x-3 mt-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
};


/* =========================
   App
   ========================= */
function App() {
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isServerReady, setIsServerReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  /* =========================
     Backend health check
     ========================= */
  useEffect(() => {
    let intervalId;

    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/status', {
          cache: 'no-store',
        });

        if (response.ok) {
          setIsServerReady(true);
          clearInterval(intervalId);
        }
      } catch (error) {
        console.log('Waiting for backend...');
      }
    };

    checkServerStatus();
    intervalId = setInterval(checkServerStatus, 1000);

    // safety timeout — чтобы не висеть вечно
    const timeoutId = setTimeout(() => {
      if (!isServerReady) {
        setHasError(true);
        clearInterval(intervalId);
      }
    }, 60000); // 60 секунд

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isServerReady]);

  /* =========================
     Blocking states
     ========================= */
  if (!isServerReady && !hasError) {
    return <LoadingScreen />;
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black text-white">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Backend недоступен</h2>
          <p className="text-zinc-400 text-sm">
            Не удалось подключиться к AI Core (localhost:8000)
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     Render helpers
     ========================= */
  const renderContent = () => {
    if (selectedProject) {
      return (
        <ProjectDetail
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      );
    }

    if (activeTab === 'library') {
      return <Library />;
    }

    return (
      <Projects
        onOpenProject={(project) => setSelectedProject(project)}
      />
    );
  };

  const getNavClass = (tab) => {
    const base =
      'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200';

    return activeTab === tab
      ? `${base} bg-accent/10 text-accent border border-accent/20`
      : `${base} text-muted hover:bg-white/5 hover:text-gray-200`;
  };

  /* =========================
     Layout
     ========================= */
  return (
    <div className="flex h-screen w-screen bg-background text-primary overflow-hidden">
      {/* Sidebar */}
      {!selectedProject && (
        <aside className="w-64 flex-shrink-0 bg-surface border-r border-border flex flex-col shadow-xl">
          <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-accent">◆</span>
              SCULPTOR PRO
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            <button
              onClick={() => setActiveTab('library')}
              className={getNavClass('library')}
            >
              <Film size={18} />
              Library
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={getNavClass('projects')}
            >
              <LayoutTemplate size={18} />
              Projects
            </button>
          </nav>

          <div className="p-4 border-t border-border bg-black/20">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Core Online: localhost:8000
            </div>
          </div>
        </aside>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden min-w-0">
        {!selectedProject && (
          <div className="absolute top-0 left-0 w-full h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        )}

        {renderContent()}
      </main>
    </div>
  );
}

export default App;
