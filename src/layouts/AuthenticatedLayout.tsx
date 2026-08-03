import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shared/Sidebar';
import { Topbar } from '../components/shared/Topbar';
import { sessionService } from '../services/supabaseApi';

export const AuthenticatedLayout: React.FC = () => {
  const [collapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [status, setStatus] = useState<'checking' | 'ready' | 'onboarding'>('checking');

  useEffect(() => {
    let mounted = true;
    sessionService.status()
      .then((sessionStatus) => {
        if (!mounted) return;
        setStatus(sessionStatus.hasProfile && sessionStatus.hasActiveCompany ? 'ready' : 'onboarding');
      })
      .catch(() => {
        if (mounted) setStatus('onboarding');
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-xs font-semibold text-text-secondary">
        Carregando sua empresa...
      </div>
    );
  }

  if (status === 'onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-surface flex w-full text-text-primary font-sans">
      
      {/* Navigation Sidebar */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Workspace Wrapper */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Dynamic Page Workspace Content */}
        <main className={`flex-1 transition-all duration-300 min-h-screen flex flex-col
          ${collapsed ? 'md:pl-24' : 'md:pl-68'}`}>
          <div className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col">
            {/* Topbar Panel now inside main workspace */}
            <Topbar
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />
            <div className="px-4 md:px-8 pb-8 pt-2 flex-1">
              <Outlet />
            </div>
          </div>
        </main>
        
      </div>
    </div>
  );
};
export default AuthenticatedLayout;
