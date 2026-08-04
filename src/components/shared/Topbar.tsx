import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, HelpCircle, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import type { NotificationItem } from './NotificationPanel';
import { Link, useLocation } from 'react-router-dom';
import { notificationService } from '../../services/supabaseApi';

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

interface TopbarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  profile?: {
    name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    active_company_id?: string | null;
  } | null;
  companies?: Array<{
    id: string;
    legal_name: string;
    trade_name: string | null;
    cnpj: string;
    status: string;
    role: string;
  }>;
  onActiveCompanyChange?: (companyId: string) => Promise<void>;
}

export const Topbar: React.FC<TopbarProps> = ({
  mobileOpen,
  setMobileOpen,
  profile,
  companies = [],
  onActiveCompanyChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCompanySelect, setShowCompanySelect] = useState(false);
  const [changingCompanyId, setChangingCompanyId] = useState<string | null>(null);
  const location = useLocation();
  const userName = profile?.name || 'Usuario PixelConta';
  const userEmail = profile?.email || '';
  const activeCompany = companies.find((company) => company.id === profile?.active_company_id) || companies[0];
  const activeCompanyName = activeCompany?.trade_name || activeCompany?.legal_name || 'Empresa ativa';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  
  let pageTitle = '';
  let pageSubtitle = '';
  
  if (location.pathname.includes('/app/dashboard')) {
    pageTitle = `Ola, ${userName}.`;
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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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

  useEffect(() => {
    let mounted = true;
    notificationService.list()
      .then((items) => {
        if (!mounted) return;
        setNotifications(items.map((item) => ({
          ...item,
          date: formatNotificationDate(item.date),
        })));
      })
      .catch(() => {
        if (mounted) setNotifications([]);
      });

    return () => {
      mounted = false;
    };
  }, [profile?.active_company_id]);

  const handleClearAllNotifications = async () => {
    await notificationService.clearAll();
    setNotifications([]);
  };

  const handleCompanyChange = async (companyId: string) => {
    if (!onActiveCompanyChange || companyId === profile?.active_company_id) {
      setShowCompanySelect(false);
      return;
    }

    setChangingCompanyId(companyId);
    try {
      await onActiveCompanyChange(companyId);
      setShowCompanySelect(false);
    } finally {
      setChangingCompanyId(null);
    }
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
            <span className="truncate max-w-[130px] sm:max-w-none">{activeCompanyName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
          </button>
          
          {showCompanySelect && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-premium shadow-premium z-50 py-1.5 animate-fade-in text-xs">
              <span className="px-3 py-1.5 text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                Selecionar Empresa
              </span>
              {companies.length > 0 ? (
                companies.map((company) => {
                  const companyName = company.trade_name || company.legal_name;
                  const isActive = company.id === profile?.active_company_id;
                  const isChanging = changingCompanyId === company.id;

                  return (
                    <button
                      key={company.id}
                      onClick={() => handleCompanyChange(company.id)}
                      disabled={Boolean(changingCompanyId)}
                      className={`w-full text-left px-3 py-2 hover:bg-surface transition-colors font-medium disabled:opacity-60
                        ${isActive ? 'text-text-primary font-bold bg-black-soft/20' : 'text-text-primary'}`}
                    >
                      <span className="block truncate">{companyName}</span>
                      <span className="block text-[10px] text-text-secondary truncate">
                        {isChanging ? 'Trocando...' : company.cnpj}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-text-secondary">
                  Nenhuma empresa encontrada
                </div>
              )}
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
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={userName}
                className="h-8.5 w-8.5 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="h-8.5 w-8.5 rounded-full border border-border bg-surface text-text-primary flex items-center justify-center text-xs font-bold">
                {initials || 'PC'}
              </div>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-text-secondary hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-border rounded-premium shadow-premium-hover z-50 py-1.5 animate-fade-in text-xs">
              <div className="px-3 py-2 border-b border-border">
                <p className="font-bold text-text-primary font-title">{userName}</p>
                <p className="text-[10px] text-text-secondary truncate">{userEmail}</p>
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

