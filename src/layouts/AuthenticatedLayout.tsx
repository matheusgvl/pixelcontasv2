import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shared/Sidebar';
import { Topbar } from '../components/shared/Topbar';
import { sessionService } from '../services/supabaseApi';

type SessionProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  active_company_id: string | null;
};

type SessionCompany = {
  id: string;
  legal_name: string;
  trade_name: string | null;
  cnpj: string;
  status: string;
  role: string;
};

export const AuthenticatedLayout: React.FC = () => {
  const [collapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [status, setStatus] = useState<'checking' | 'ready' | 'onboarding'>('checking');
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [companies, setCompanies] = useState<SessionCompany[]>([]);

  useEffect(() => {
    let mounted = true;
    sessionService.status()
      .then((sessionStatus) => {
        if (!mounted) return;
        setProfile(sessionStatus.profile);
        setCompanies(sessionStatus.companies);
        setStatus(sessionStatus.hasProfile && sessionStatus.hasActiveCompany ? 'ready' : 'onboarding');
      })
      .catch(() => {
        if (mounted) setStatus('onboarding');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleActiveCompanyChange = async (companyId: string) => {
    const { profile: updatedProfile } = await sessionService.setActiveCompany(companyId);
    setProfile(updatedProfile);
    window.location.reload();
  };

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
        profile={profile}
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
              profile={profile}
              companies={companies}
              onActiveCompanyChange={handleActiveCompanyChange}
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
