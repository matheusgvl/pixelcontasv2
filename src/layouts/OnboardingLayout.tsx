import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const OnboardingLayout: React.FC = () => {
  const logoSrc = "/brand/pixelconta-logo-dark.png";

  return (
    <div className="min-h-screen bg-pixel-neutral-50 flex flex-col w-full text-pixel-neutral-900 font-sans">
      {/* Onboarding Header */}
      <header className="h-16 border-b border-pixel-neutral-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
        <Link to="/" className="flex items-center gap-3 select-none active:scale-[0.98] transition-transform">
          <img src={logoSrc} alt="Logo PixelConta" className="h-7 w-auto object-contain" />
          <span className="text-lg font-black font-title tracking-tight text-pixel-navy-900">
            Pixel<span className="text-pixel-navy-900">Contas</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-2 text-xs text-pixel-neutral-500">
          <span className="font-semibold">Dúvidas no cadastro?</span>
          <Link to="/app/contabilidade" className="text-pixel-navy-900 hover:underline font-bold">Fale conosco</Link>
        </div>
      </header>

      {/* Onboarding Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-neutral-bgSecondary/20">
        <div className="w-full max-w-4xl bg-white border border-pixel-neutral-200 rounded-premium shadow-premium p-6 md:p-10 my-4 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default OnboardingLayout;
