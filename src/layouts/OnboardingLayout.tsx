import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const OnboardingLayout: React.FC = () => {
  const logoSrc = "/logo-horizontal.jpeg";

  return (
    <div className="min-h-screen bg-surface flex flex-col w-full text-text-primary font-sans">
      {/* Onboarding Header */}
      <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
        <Link to="/" className="flex items-center gap-3 select-none active:scale-[0.98] transition-transform">
          <img src={logoSrc} alt="Logo PixelConta" className="h-7 w-auto object-contain" />

        </Link>
        
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="font-semibold">Dúvidas no cadastro?</span>
          <Link to="/app/contabilidade" className="text-text-primary hover:underline font-bold">Fale conosco</Link>
        </div>
      </header>

      {/* Onboarding Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-neutral-bgSecondary/20">
        <div className="w-full max-w-4xl bg-white border border-border rounded-premium shadow-premium p-6 md:p-10 my-4 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default OnboardingLayout;
