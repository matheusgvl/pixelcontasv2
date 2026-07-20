import React from 'react';
import type { Integration } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { Settings, RefreshCw, AlertTriangle, Link2 } from 'lucide-react';

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (id: string) => void;
  onManage: (id: string) => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConnect,
  onManage
}) => {
  const isConnected = integration.status === 'connected' || integration.status === 'attention' || integration.status === 'syncing';
  
  const categoryNames = {
    infoproduto: 'Infoprodutos',
    ecommerce: 'E-commerce',
    payment: 'Pagamentos',
    marketplace: 'Marketplace',
    crm: 'CRM',
    api: 'API e Webhooks'
  };

  return (
    <div className="p-5 border border-pixel-neutral-200 rounded-premium bg-white shadow-premium flex flex-col justify-between gap-5 transition-all duration-200 hover:shadow-premium-hover hover:border-brand-teal/20">
      
      {/* Top Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-pixel-navy-900 uppercase tracking-wider font-title bg-pixel-neutral-50 px-2 py-0.5 rounded-full w-fit">
            {categoryNames[integration.category]}
          </span>
          <h3 className="text-base font-bold text-pixel-navy-900 font-title">
            {integration.name}
          </h3>
        </div>
        <StatusBadge status={integration.status} />
      </div>

      {/* Description */}
      <p className="text-xs text-pixel-neutral-500 leading-relaxed flex-1">
        {integration.description}
      </p>

      {/* Connection Meta */}
      {isConnected && (
        <div className="flex items-center gap-1.5 text-[10px] text-pixel-neutral-500 border-t border-pixel-neutral-200 pt-3.5 mt-1">
          {integration.status === 'attention' ? (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
          ) : (
            <RefreshCw className={`h-3.5 w-3.5 text-pixel-navy-900 shrink-0 ${integration.status === 'syncing' ? 'animate-spin' : ''}`} />
          )}
          <span>
            {integration.status === 'attention' 
              ? 'Requer atenção nas configurações' 
              : integration.lastSync 
                ? `Sincronizado: ${new Date(integration.lastSync).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Sincronização pendente'
            }
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2.5 border-t border-pixel-neutral-200 pt-4 mt-auto">
        {isConnected ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManage(integration.id)}
              icon={<Settings className="h-4 w-4" />}
              className="flex-1 text-xs"
            >
              Gerenciar
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConnect(integration.id)}
            icon={<Link2 className="h-4 w-4" />}
            className="w-full text-xs"
          >
            Conectar
          </Button>
        )}
      </div>
    </div>
  );
};
