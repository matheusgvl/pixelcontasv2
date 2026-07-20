import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shared/Sidebar';
import { Topbar } from '../components/shared/Topbar';

export const AuthenticatedLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <div className="p-4 md:p-8 pt-6 flex-1">
              <Outlet />
            </div>
          </div>
        </main>
        
      </div>
    </div>
  );
};
export default AuthenticatedLayout;
