import React from 'react';
import type { Automation } from '../../types';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { Play, Settings, ArrowRight } from 'lucide-react';

interface AutomationCardProps {
  automation: Automation;
  onToggleStatus: (id: string, currentStatus: 'active' | 'paused') => void;
  onEdit: (id: string) => void;
  onExecuteMock?: (id: string) => void;
}

export const AutomationCard: React.FC<AutomationCardProps> = ({
  automation,
  onToggleStatus,
  onEdit,
  onExecuteMock
}) => {
  const isActive = automation.status === 'active';

  return (
    <div className={`p-5 border rounded-premium bg-white shadow-premium flex flex-col gap-4 transition-all duration-200 hover:shadow-premium-hover
      ${isActive ? 'border-primary/20' : 'border-border'}`}>
      
      {/* Header with Switch */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-text-primary font-title">
            {automation.name}
          </h3>
          <span className="text-[10px] text-text-secondary">
            Código: {automation.id}
          </span>
        </div>
        <Switch
          checked={isActive}
          onChange={() => onToggleStatus(automation.id, automation.status)}
        />
      </div>

      {/* Visual Flow diagram blocks */}
      <div className="flex items-center gap-2 p-3 bg-surface rounded-soft border border-border text-xs">
        <div className="flex flex-col gap-0.5 min-w-[70px]">
          <span className="text-[9px] uppercase font-bold text-text-primary">Gatilho</span>
          <span className="font-semibold text-text-primary">{automation.trigger}</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-white/40 shrink-0" />
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-[9px] uppercase font-bold text-primary">Ações</span>
          <span className="font-semibold text-text-primary">
            {automation.actions.type === 'emit_invoice' && 'Emitir Nota Fiscal'}
            {automation.actions.type === 'send_email' && 'Enviar PDF por E-mail'}
            {automation.actions.type === 'add_client' && 'Cadastrar Cliente'}
            {automation.actions.type === 'notify' && 'Notificar Administrador'}
          </span>
        </div>
      </div>

      {/* Execution Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center bg-neutral-bgSecondary/30 p-2.5 rounded-soft text-[10px] text-text-secondary border border-border">
        <div className="flex flex-col gap-0.5">
          <span>Execuções</span>
          <span className="font-bold text-text-primary text-xs">{automation.totalExecutions}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-x border-border">
          <span>Sucesso</span>
          <span className="font-bold text-green-600 text-xs">{automation.successRate}%</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span>Último Status</span>
          <span className={`font-bold text-xs ${isActive ? 'text-green-600' : 'text-text-secondary'}`}>
            {isActive ? 'Ativa' : 'Pausada'}
          </span>
        </div>
      </div>

      {/* Trigger platforms/filters label */}
      <div className="flex flex-wrap gap-1.5 mt-1">
        {automation.conditions.platform && (
          <span className="text-[9px] bg-brand-lightBlue/30 text-text-primary border border-border font-bold px-2 py-0.5 rounded-full">
            Plataforma: {automation.conditions.platform}
          </span>
        )}
        {automation.conditions.valueMin !== undefined && (
          <span className="text-[9px] bg-primary text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full">
            Valor Min: R$ {automation.conditions.valueMin}
          </span>
        )}
      </div>

      {/* Bottom Action buttons */}
      <div className="flex gap-2.5 border-t border-border pt-3.5 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(automation.id)}
          icon={<Settings className="h-4 w-4" />}
          className="flex-1 text-xs"
        >
          Editar Regra
        </Button>
        {onExecuteMock && isActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExecuteMock(automation.id)}
            icon={<Play className="h-4 w-4" />}
            className="text-xs"
            title="Simular disparo manual"
          >
            Testar
          </Button>
        )}
      </div>

    </div>
  );
};
