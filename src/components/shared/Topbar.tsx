import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, HelpCircle, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import type { NotificationItem } from './NotificationPanel';
import { Link, useLocation } from 'react-router-dom';

interface TopbarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  mobileOpen,
  setMobileOpen
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('Pixel Comércio Digital LTDA');
  const [showCompanySelect, setShowCompanySelect] = useState(false);
  const location = useLocation();
  
  let pageTitle = '';
  let pageSubtitle = '';
  
  if (location.pathname.includes('/app/dashboard')) {
    pageTitle = 'Olá, Ricardo Almeida.';
    pageSubtitle = 'Aqui está o resumo fiscal e financeiro da sua empresa hoje.';
  } else if (location.pathname.includes('/app/notas')) {
    pageTitle = 'Notas Fiscais';
    pageSubtitle = 'Gerencie todas as suas notas.';
  } else if (location.pathname.includes('/app/clientes')) {
    pageTitle = 'Clientes';
    pageSubtitle = 'Gestão de carteira de clientes.';
  }

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const companySelectRef = useRef<HTMLDivElement>(null);

  // Mock notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'not-1',
      title: 'Nota fiscal nº 2045 rejeitada',
      description: 'Erro 403: Alíquota de ISS de 5% diverge do cadastro municipal para este CNAE.',
      type: 'error',
      date: 'Hoje, 09:15'
    },
    {
      id: 'not-2',
      title: 'Certificado digital expira em breve',
      description: 'O seu certificado A1 expira em 15 dias. Lembre-se de renovar e fazer o upload.',
      type: 'warning',
      date: 'Hoje, 08:00'
    },
    {
      id: 'not-3',
      title: 'Automação executada com sucesso',
      description: 'NFS-e emitida automaticamente para Gabriel Ferreira via integração Kiwify.',
      type: 'success',
      date: 'Ontem, 18:22'
    },
    {
      id: 'not-4',
      title: 'Guia Simples Nacional (DAS) disponível',
      description: 'A guia de pagamento do DAS com vencimento em 20/07/2026 já está disponível para download.',
      type: 'info',
      date: '05/07/2026'
    }
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (companySelectRef.current && !companySelectRef.current.contains(event.target as Node)) {
        setShowCompanySelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <header className="w-full flex items-center justify-between px-4 md:px-8 pt-6 pb-2 z-30">
      
      {/* Left controls: Mobile menu trigger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 rounded-full text-text-primary hover:bg-surface transition-colors"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>

        {pageTitle && (
          <div className="hidden md:flex flex-col gap-0.5">
            <h1 className="text-lg md:text-xl font-black text-text-primary font-title tracking-tight">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-[10px] md:text-xs text-text-secondary font-medium">
                {pageSubtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right controls: Company Select, Help, notifications, user profile */}
      <div className="flex items-center gap-3">
        {/* Company Dropdown Selector */}
        <div className="relative" ref={companySelectRef}>
          <button
            onClick={() => setShowCompanySelect(!showCompanySelect)}
            className="flex items-center gap-2 px-3 py-1.5 border border-border bg-white rounded-soft hover:bg-white/60 transition-colors text-xs font-semibold text-text-primary font-title"
          >
            <span className="truncate max-w-[130px] sm:max-w-none">{selectedCompany}</span>
            <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
          </button>
          
          {showCompanySelect && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-premium shadow-premium z-50 py-1.5 animate-fade-in text-xs">
              <span className="px-3 py-1.5 text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                Selecionar Empresa
              </span>
              {['Pixel Comércio Digital LTDA', 'Pixel Academy ME', 'Ricardo Almeida Consultor'].map((comp) => (
                <button
                  key={comp}
                  onClick={() => {
                    setSelectedCompany(comp);
                    setShowCompanySelect(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-surface transition-colors font-medium
                    ${selectedCompany === comp ? 'text-text-primary font-bold bg-black-soft/20' : 'text-text-primary'}`}
                >
                  {comp}
                </button>
              ))}
              <div className="border-t border-border my-1"></div>
              <button
                onClick={() => setShowCompanySelect(false)}
                className="w-full text-left px-3 py-2 text-text-primary hover:underline font-bold"
              >
                + Adicionar nova empresa
              </button>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="hidden sm:block h-6 w-px bg-border mx-1"></div>
        
        {/* Help Link */}
        <Link
          to="/app/contabilidade"
          title="Atendimento contábil"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-black-soft/30 rounded-soft transition-all"
        >
          <HelpCircle className="h-4.5 w-4.5" />
          <span className="font-semibold">Suporte</span>
        </Link>

        {/* Notifications Icon Button */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-text-primary hover:bg-surface transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-600 border border-white rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          <NotificationPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
            onClearAll={handleClearAllNotifications}
          />
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-border"></div>

        {/* User avatar dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 select-none active:scale-[0.98] transition-transform"
          >
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" 
              alt="Ricardo Almeida" 
              className="h-8.5 w-8.5 rounded-full object-cover border border-border"
            />
            <ChevronDown className="h-3.5 w-3.5 text-text-secondary hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-border rounded-premium shadow-premium-hover z-50 py-1.5 animate-fade-in text-xs">
              <div className="px-3 py-2 border-b border-border">
                <p className="font-bold text-text-primary font-title">Ricardo Almeida</p>
                <p className="text-[10px] text-text-secondary truncate">ricardo@pixelcontas.com.br</p>
              </div>
              
              <Link
                to="/app/configuracoes"
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-text-primary hover:bg-surface transition-colors"
              >
                <User className="h-4 w-4 text-text-secondary" />
                <span>Meu Perfil</span>
              </Link>
              
              <Link
                to="/app/configuracoes"
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-text-primary hover:bg-surface transition-colors"
              >
                <Settings className="h-4 w-4 text-text-secondary" />
                <span>Configurações</span>
              </Link>

              <div className="border-t border-border my-1.5"></div>
              
              <Link
                to="/login"
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-600-bg/30 transition-colors font-bold"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair do sistema</span>
              </Link>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
