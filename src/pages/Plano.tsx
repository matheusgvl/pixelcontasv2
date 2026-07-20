import React, { useState } from 'react';
import { CheckCircle2, TrendingUp, HelpCircle, Star } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export const Plano: React.FC = () => {
  const toast = useToast();
  const [activePlan, setActivePlan] = useState('Pro');

  const plans = [
    { id: 'Start', name: 'Plano Start', price: 'R$ 89', limit: 30, desc: 'Ideal para prestadores de serviços no início de carreira.' },
    { id: 'Pro', name: 'Plano Pro (Atual)', price: 'R$ 189', limit: 500, desc: 'A melhor escolha para e-commerce, infoprodutores e agências de marketing.' },
    { id: 'Advanced', name: 'Plano Advanced', price: 'R$ 349', limit: 9999, desc: 'Faturamento ilimitado com suporte fiscal por contadores especializados.' }
  ];

  const handleUpgrade = (planName: string) => {
    if (planName === activePlan) {
      toast.info('Você já está utilizando este plano.');
      return;
    }
    setActivePlan(planName);
    toast.success(`Plano alterado com sucesso! Sua assinatura agora é o ${planName}.`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Assinatura & Plano Contratado"
        description="Acompanhe o consumo do limite de emissões de notas fiscais do seu plano e faça upgrades de pacotes."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Plan Consumption Progress Card (Left 2 cols) */}
        <div className="lg:col-span-2 border border-border rounded-premium bg-white p-6 shadow-premium flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider font-title bg-surface px-2.5 py-0.5 rounded-full w-fit">
              Consumo do Limite Mensal
            </span>
            <h3 className="text-base font-bold text-text-primary font-title">
              Faturamento de Notas Fiscais Eletrônicas
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Sua cota reiniciará automaticamente em 01/08/2026. Notas excedentes em homologação não consomem cota real.
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-baseline text-xs font-semibold">
              <span className="text-text-primary font-bold text-base">145 de 500 notas emitidas</span>
              <span className="text-text-primary font-black text-sm">29% utilizado</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-surface h-3.5 rounded-full overflow-hidden border border-border">
              <div 
                className="bg-black h-full rounded-full transition-all duration-500" 
                style={{ width: '29%' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-6 mt-2 text-xs">
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-text-primary">Volume médio de emissão</span>
                <span className="text-text-secondary">Aproximadamente 4.8 notas por dia útel</span>
              </div>
            </div>
            <div className="flex gap-3">
              <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-text-primary">O que acontece se exceder o limite?</span>
                <span className="text-text-secondary">Cada nota extra custa R$ 0,50 no faturamento final do mês ou você pode fazer upgrade automático abaixo.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Plan Overview Card (Right 1 col) */}
        <div className="border border-border rounded-premium bg-grad-premium text-white p-6 shadow-premium flex flex-col justify-between gap-6 relative overflow-hidden">
          {/* Decorative Sparkle */}
          <Star className="absolute right-[-20px] top-[-20px] h-32 w-32 text-white/5 pointer-events-none transform rotate-12" />
          
          <div className="flex flex-col gap-4 relative z-10">
            <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider font-title bg-white/10 px-2 py-0.5 rounded-full w-fit border border-white/15">
              Assinatura Ativa
            </span>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-xl font-black font-title">Plano Digital Pro</h3>
              <p className="text-xs text-white/70">Indicado para prestação de serviços e e-commerce.</p>
            </div>

            <div className="h-px bg-white/10 my-1"></div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-title text-text-primary">R$ 189</span>
              <span className="text-xs text-white/60">/mês</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 relative z-10 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-text-primary shrink-0" />
              <span className="font-medium">NFS-e, NF-e e NFC-e ilimitadas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-text-primary shrink-0" />
              <span className="font-medium">Importação de webhooks ativa</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-text-primary shrink-0" />
              <span className="font-medium">Acesso prioritário contábil</span>
            </div>
          </div>
        </div>

      </div>

      {/* Upgrade Options Pricing Grid */}
      <h3 className="text-sm font-bold text-text-primary font-title uppercase tracking-wider text-[10px] mt-6 mb-1">
        Alterar Plano de Cobrança
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = activePlan === p.id;
          return (
            <div 
              key={p.id}
              className={`p-6 border rounded-premium bg-white shadow-premium flex flex-col justify-between gap-5 transition-all duration-200 hover:shadow-premium-hover
                ${isCurrent 
                  ? 'border-black ring-2 ring-primary/20 scale-[1.01]' 
                  : 'border-border'}`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-text-primary font-title text-sm">{p.name}</h4>
                  {isCurrent && (
                    <span className="text-[9px] bg-surface text-text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{p.desc}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-text-primary font-title">{p.price}</span>
                  <span className="text-[10px] text-text-secondary">/mês</span>
                </div>
              </div>

              <Button
                variant={isCurrent ? 'outline' : 'primary'}
                size="sm"
                onClick={() => handleUpgrade(p.id)}
                className="w-full text-xs"
                disabled={isCurrent}
              >
                {isCurrent ? 'Plano Atual' : 'Alterar Assinatura'}
              </Button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
export default Plano;
