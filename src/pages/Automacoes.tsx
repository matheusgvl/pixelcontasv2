import React, { useState } from 'react';
import { 
  PlusCircle, Sparkles, Save, Cpu
} from 'lucide-react';
import { db } from '../mocks/db';
import { PageHeader } from '../components/shared/PageHeader';
import { AutomationCard } from '../components/shared/AutomationCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToast } from '../context/ToastContext';
import type { Automation } from '../types';

export const Automacoes: React.FC = () => {
  const toast = useToast();

  const [automations, setAutomations] = useState<Automation[]>(() => db.automations);
  
  // Builder view mode
  const [showBuilder, setShowBuilder] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('Venda aprovada');
  const [selectedAction, setSelectedAction] = useState('emit_invoice');
  
  // Form conditions
  const [condPlatform, setCondPlatform] = useState('Hotmart');
  const [condValueMin, setCondValueMin] = useState(0);

  // Toggle active/paused status
  const handleToggleStatus = (id: string, currentStatus: 'active' | 'paused') => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    const nextAuts = automations.map(aut => {
      if (aut.id === id) {
        return {
          ...aut,
          status: nextStatus as any
        };
      }
      return aut;
    });

    setAutomations(nextAuts);
    db.automations = nextAuts;
    toast.success(`Automação ${nextStatus === 'active' ? 'ativada' : 'pausada'} com sucesso!`);
  };

  const handleEdit = (id: string) => {
    toast.info(`Carregando regras da automação ${id} para edição.`);
    setShowBuilder(true);
    const aut = automations.find(a => a.id === id);
    if (aut) {
      setNewRuleName(aut.name);
      setSelectedTrigger(aut.trigger);
      setSelectedAction(aut.actions.type);
      setCondPlatform(aut.conditions.platform || 'Hotmart');
      setCondValueMin(aut.conditions.valueMin || 0);
    }
  };

  // Mock manual trigger test
  const handleExecuteMock = (id: string) => {
    toast.info('Simulando disparo de webhook...');
    setTimeout(() => {
      const nextAuts = automations.map(aut => {
        if (aut.id === id) {
          return {
            ...aut,
            totalExecutions: aut.totalExecutions + 1,
            lastExecution: new Date().toISOString()
          };
        }
        return aut;
      });
      setAutomations(nextAuts);
      db.automations = nextAuts;
      toast.success('Disparo manual simulado! Nota fiscal emitida automaticamente em background.');
    }, 800);
  };

  // Save new rule
  const handleSaveAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName) {
      toast.error('Informe um nome para a regra de automação.');
      return;
    }

    const newAut: Automation = {
      id: `aut-${Date.now()}`,
      name: newRuleName,
      trigger: selectedTrigger,
      conditions: {
        platform: condPlatform,
        valueMin: Number(condValueMin) || undefined
      },
      actions: {
        type: selectedAction as any
      },
      status: 'active',
      totalExecutions: 0,
      successRate: 100.0,
      errorHistory: [],
      lastExecution: undefined
    };

    const nextAuts = [newAut, ...automations];
    setAutomations(nextAuts);
    db.automations = nextAuts;

    toast.success('Regra de automação criada e ativada!');
    setShowBuilder(false);
    
    // Reset forms
    setNewRuleName('');
    setSelectedTrigger('Venda aprovada');
    setSelectedAction('emit_invoice');
    setCondPlatform('Hotmart');
    setCondValueMin(0);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* 1. LIST MODE */}
      {!showBuilder && (
        <>
          <PageHeader
            title="Automações Inteligentes"
            description="Automatize a emissão e o envio de e-mails fiscais a partir de gatilhos nos seus canais de vendas."
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<PlusCircle className="h-4 w-4" />}
                onClick={() => setShowBuilder(true)}
              >
                Nova Automação
              </Button>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automations.map((aut) => (
              <AutomationCard
                key={aut.id}
                automation={aut}
                onToggleStatus={handleToggleStatus}
                onEdit={handleEdit}
                onExecuteMock={handleExecuteMock}
              />
            ))}
          </div>
        </>
      )}

      {/* 2. VISUAL BUILDER MODE */}
      {showBuilder && (
        <form onSubmit={handleSaveAutomation} className="flex flex-col gap-6">
          <PageHeader
            title="Construtor de Automação Visual"
            description="Crie fluxos automatizados do tipo: 'Quando acontecer X → Se atender Y → Execute Z'."
            breadcrumbs={[
              { label: 'Automações', link: '/app/automacoes' },
              { label: 'Novo Fluxo' }
            ]}
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBuilder(false)}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  icon={<Save className="h-4 w-4" />}
                >
                  Ativar Automação
                </Button>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left side visual flowchart editor */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Rule Name Card */}
              <div className="border border-pixel-neutral-200 rounded-premium p-6 bg-white shadow-premium flex flex-col gap-4">
                <Input
                  label="Nome da Regra de Automação *"
                  value={newRuleName}
                  onChange={e => setNewRuleName(e.target.value)}
                  placeholder="Ex: Emissão Automática Hotmart - Produtos Físicos"
                />
              </div>

              {/* Gatilho (Trigger Block) */}
              <div className="border border-pixel-neutral-200 rounded-premium p-6 bg-white shadow-premium flex flex-col gap-4 relative">
                <span className="absolute top-[-10px] left-6 bg-pixel-navy-900 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Passo 1: Gatilho (Trigger)
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Select
                    label="Quando este evento ocorrer na integração:"
                    value={selectedTrigger}
                    onChange={e => setSelectedTrigger(e.target.value)}
                    options={[
                      { value: 'Venda aprovada', label: 'Venda aprovada / Aprovado' },
                      { value: 'Pagamento confirmado', label: 'Pagamento confirmado' },
                      { value: 'Pedido criado', label: 'Pedido criado / Importado' },
                      { value: 'Pedido enviado', label: 'Pedido enviado' },
                      { value: 'Assinatura renovada', label: 'Assinatura renovada' },
                      { value: 'Reembolso solicitado', label: 'Reembolso solicitado' }
                    ]}
                  />
                </div>
              </div>

              {/* Condições (Conditions Block) */}
              <div className="border border-pixel-neutral-200 rounded-premium p-6 bg-white shadow-premium flex flex-col gap-4 relative">
                <span className="absolute top-[-10px] left-6 bg-pixel-gold-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Passo 2: Condições Filtro (Se...)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Select
                    label="Filtrar por canal/plataforma:"
                    value={condPlatform}
                    onChange={e => setCondPlatform(e.target.value)}
                    options={[
                      { value: 'Hotmart', label: 'Hotmart' },
                      { value: 'Kiwify', label: 'Kiwify' },
                      { value: 'Shopify', label: 'Shopify' },
                      { value: 'Asaas', label: 'Asaas' },
                      { value: 'Qualquer Canal', label: 'Qualquer Canal de Integração' }
                    ]}
                  />
                  <Input
                    label="Valor mínimo do pedido (R$)"
                    type="number"
                    value={condValueMin}
                    onChange={e => setCondValueMin(Number(e.target.value))}
                    placeholder="Ex: 100"
                  />
                </div>
              </div>

              {/* Ações (Action Block) */}
              <div className="border border-pixel-neutral-200 rounded-premium p-6 bg-white shadow-premium flex flex-col gap-4 relative">
                <span className="absolute top-[-10px] left-6 bg-pixel-navy-900 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Passo 3: Ação (Execute...)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Select
                    label="Ação do sistema:"
                    value={selectedAction}
                    onChange={e => setSelectedAction(e.target.value)}
                    options={[
                      { value: 'emit_invoice', label: 'Emitir Nota Fiscal (NFS-e / NF-e)' },
                      { value: 'send_email', label: 'Enviar PDF da Nota por E-mail' },
                      { value: 'add_client', label: 'Cadastrar Cliente no Banco' },
                      { value: 'notify', label: 'Enviar Notificação de Alerta' }
                    ]}
                  />
                </div>
              </div>

            </div>

            {/* Right side help panels */}
            <div className="flex flex-col gap-6">
              
              {/* Guidelines card */}
              <div className="border border-pixel-neutral-200 rounded-premium bg-white p-5 shadow-premium flex flex-col gap-3 text-xs">
                <h3 className="font-bold text-pixel-navy-900 font-title uppercase tracking-wider text-[10px] pb-2 border-b border-pixel-neutral-200 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-pixel-navy-900" />
                  <span>Dicas de Fluxo</span>
                </h3>
                <p className="text-pixel-neutral-500 leading-relaxed text-[11px]">
                  Automações ajudam a reduzir faturamentos manuais e otimizam a rotina fiscal. O sistema realiza tentativas automáticas em caso de instabilidade dos servidores da prefeitura ou SEFAZ.
                </p>
                <div className="bg-pixel-neutral-100 p-3 rounded-soft border border-pixel-neutral-200 flex gap-2.5 items-start mt-1">
                  <Sparkles className="h-4 w-4 text-pixel-navy-900 shrink-0" />
                  <span className="text-[10px] text-pixel-neutral-500">
                    As notas fiscais geradas por automações contêm a tag do canal correspondente (ex: Shopify, Hotmart) para facilitar sua conciliação fiscal posterior.
                  </span>
                </div>
              </div>

            </div>
          </div>
        </form>
      )}

    </div>
  );
};
export default Automacoes;
