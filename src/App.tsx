import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';

// Views
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { GeneratorView } from './components/GeneratorView';
import { ReelGeneratorView } from './components/ReelGeneratorView';
import { HookGeneratorView } from './components/HookGeneratorView';
import { CaptionGeneratorView } from './components/CaptionGeneratorView';
import { YouTubeGeneratorView } from './components/YouTubeGeneratorView';
import { SeoGeneratorView } from './components/SeoGeneratorView';
import { IdeasGeneratorView } from './components/IdeasGeneratorView';
import { BrandVoiceView } from './components/BrandVoiceView';
import { MyContentView } from './components/MyContentView';
import { TemplatesView } from './components/TemplatesView';
import { UsageView } from './components/UsageView';
import { SettingsView } from './components/SettingsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ContentTemplate } from './types';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [pageParams, setPageParams] = useState<any>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const handleNavigate = (page: string, params?: any) => {
    setActivePage(page);
    if (params) {
      setPageParams(params);
    } else {
      setPageParams({});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUseTemplate = (template: ContentTemplate) => {
    if (template.type === 'reel') {
      handleNavigate('reels', { topic: template.topic_template });
    } else if (template.type === 'hook') {
      handleNavigate('hooks', { topic: template.topic_template });
    } else if (template.type === 'caption') {
      handleNavigate('captions', { topic: template.topic_template });
    } else if (template.type === 'youtube') {
      handleNavigate('youtube', { topic: template.topic_template });
    } else if (template.type === 'seo') {
      handleNavigate('seo', { topic: template.topic_template });
    } else {
      handleNavigate('generate', { topic: template.topic_template, type: template.type });
    }
  };

  // If user navigated to landing page view explicitly
  if (activePage === 'landing') {
    return (
      <LandingPage
        onStartCreating={() => handleNavigate('dashboard')}
        onNavigate={handleNavigate}
      />
    );
  }

  // If user navigated to login / signup page view explicitly
  if (activePage === 'login' || activePage === 'signup') {
    return (
      <LoginPage
        initialMode={activePage === 'signup' ? 'signup' : 'login'}
        onNavigate={handleNavigate}
        onSuccess={() => handleNavigate('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Fixed Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Layout (Pushed by sidebar width) */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Top Navbar */}
        <Navbar
          activePage={activePage}
          onNavigate={handleNavigate}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />

        {/* Page Content Container */}
        <main className="flex-1 pb-16">
          {activePage === 'dashboard' && (
            <DashboardView onNavigate={handleNavigate} />
          )}

          {activePage === 'generate' && (
            <GeneratorView 
              initialTopic={pageParams.topic} 
              initialType={pageParams.type} 
            />
          )}

          {activePage === 'reels' && (
            <ReelGeneratorView />
          )}

          {activePage === 'hooks' && (
            <HookGeneratorView />
          )}

          {activePage === 'captions' && (
            <CaptionGeneratorView />
          )}

          {activePage === 'youtube' && (
            <YouTubeGeneratorView />
          )}

          {activePage === 'seo' && (
            <SeoGeneratorView />
          )}

          {activePage === 'ideas' && (
            <IdeasGeneratorView 
              onSelectIdeaToGenerate={(topic) => handleNavigate('generate', { topic })}
            />
          )}

          {activePage === 'my-content' && (
            <MyContentView initialSelectId={pageParams.selectId} />
          )}

          {activePage === 'brand-voice' && (
            <BrandVoiceView />
          )}

          {activePage === 'templates' && (
            <TemplatesView onUseTemplate={handleUseTemplate} />
          )}

          {activePage === 'usage' && (
            <UsageView />
          )}

          {activePage === 'settings' && (
            <SettingsView />
          )}

          {activePage === 'admin' && (
            <AdminDashboardView />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <UpgradeModal />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
