import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FilePlus2, FileText, Users, ShoppingBag, 
  Layers, Cpu, BarChart3, FolderClosed, ShieldAlert, 
  MessageSquare, Settings, UserSquare2, 
  LogOut, Award
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  profile?: {
    name: string;
    email: string;
    role: string;
    avatar_url: string | null;
  } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  mobileOpen,
  setMobileOpen,
  profile
}) => {
  const location = useLocation();
  const userName = profile?.name || 'Usuario PixelConta';
  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    owner: 'Administrador',
    accountant: 'Contador',
    operator: 'Operador',
  };
  const roleLabel = roleLabels[profile?.role || ''] || 'Usuario';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const menuItems = [
    { label: 'Visão geral', path: '/app/dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Emitir nota', path: '/app/emitir-nota', icon: <FilePlus2 className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Notas fiscais', path: '/app/notas', icon: <FileText className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Clientes', path: '/app/clientes', icon: <Users className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Produtos & Serviços', path: '/app/produtos', icon: <ShoppingBag className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Integrações', path: '/app/integracoes', icon: <Layers className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Automações', path: '/app/automacoes', icon: <Cpu className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Relatórios', path: '/app/relatorios', icon: <BarChart3 className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Documentos', path: '/app/documentos', icon: <FolderClosed className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Pendências', path: '/app/pendencias', icon: <ShieldAlert className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Contabilidade', path: '/app/contabilidade', icon: <MessageSquare className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Usuários', path: '/app/usuarios', icon: <UserSquare2 className="h-4.5 w-4.5 shrink-0" /> },
    { label: 'Configurações', path: '/app/configuracoes', icon: <Settings className="h-4.5 w-4.5 shrink-0" /> },
  ];

  const logoSrc = "/logo-horizontal.jpeg";

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside className={`fixed top-0 bottom-0 left-0 bg-white text-text-primary z-40 transition-all duration-300 flex flex-col justify-between border-r border-border shadow-premium
        ${collapsed ? 'w-20' : 'w-64'} 
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Top Header Logo Area */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link 
            to="/app/dashboard" 
            className="flex items-center gap-3 select-none active:scale-[0.98] transition-transform"
            onClick={() => setMobileOpen(false)}
          >
            <img src={logoSrc} alt="Logo PixelConta" className="h-7 w-auto object-contain" />
          </Link>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1.5 scrollbar-thin">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 py-2.5 px-3.5 rounded-soft text-sm transition-all duration-150 relative group
                  ${isActive 
                    ? 'bg-primary text-white font-semibold shadow-sm' 
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
                
                {/* Collapsed Tooltip fallback */}
                {collapsed && (
                  <span className="absolute left-16 bg-white border border-border text-text-primary text-xs py-1.5 px-3 rounded shadow-premium opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap font-title font-bold">
                    {item.label}
                  </span>
                )}
                

              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Area */}
        <div className="p-4 border-t border-border flex flex-col gap-3 bg-white shrink-0">
          
          {/* Plan Info Card */}
          {!collapsed ? (
            <div className="bg-surface p-3 border border-border rounded-soft flex flex-col gap-2 relative overflow-hidden group">
              <div className="flex justify-between items-center z-10 relative">
                <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">
                  Plano Ativo
                </span>
                <span className="text-[9px] bg-primary text-white font-bold px-1.5 py-0.5 rounded">
                  PREMIUM
                </span>
              </div>
              <div className="z-10 relative">
                <p className="text-xs font-bold text-text-primary font-title">Plano Digital Pro</p>
                <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1">
                  <span>Limite de notas</span>
                  <span className="font-semibold text-text-primary">145 / 500</span>
                </div>
                <div className="w-full bg-border h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '29%' }} />
                </div>
              </div>
              <Link 
                to="/app/plano" 
                className="text-[10px] font-bold text-primary hover:underline z-10 relative mt-0.5"
                onClick={() => setMobileOpen(false)}
              >
                Gerenciar Assinatura →
              </Link>
            </div>
          ) : (
            <Link
              to="/app/plano"
              className="mx-auto p-2 bg-primary/10 rounded-soft text-text-primary hover:bg-primary/20 transition-colors relative group"
              onClick={() => setMobileOpen(false)}
            >
              <Award className="h-5 w-5 shrink-0" />
              <span className="absolute left-16 bg-white border border-border text-text-primary text-xs py-1.5 px-3 rounded shadow-premium opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap font-bold">
                Plano Premium
              </span>
            </Link>
          )}

          {/* User profile brief */}
          <div className="flex items-center gap-3 pt-2">
            <div className="relative shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={userName}
                  className="h-9 w-9 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full border border-border bg-surface text-text-primary flex items-center justify-center text-xs font-bold">
                  {initials || 'PC'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-600 border-2 border-white" />
            </div>
            
            {!collapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-bold truncate text-text-primary">
                  {userName}
                </span>
                <span className="text-[10px] text-text-secondary truncate">
                  {roleLabel}
                </span>
              </div>
            )}

            {!collapsed && (
              <Link 
                to="/login"
                title="Sair do painel" 
                className="p-1.5 rounded text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              >
                <LogOut className="h-4.5 w-4.5" />
              </Link>
            )}
          </div>
        </div>

      </aside>
    </>
  );
};
