import React from 'react';
import {
  UserRound,
  Truck,
  Store,
  Glasses,
  Car,
  Megaphone,
  Printer,
  BriefcaseBusiness,
  PawPrint,
  Laptop,
  Wrench,
  Hammer,
  Armchair,
  Utensils,
  Shirt,
  Wheat,
  Fuel,
  HandHelping
} from 'lucide-react';
import { Button } from '../ui/Button';

const businessSegments = [
  { name: 'MEI', icon: UserRound },
  { name: 'Transportadoras', icon: Truck },
  { name: 'Comércio', icon: Store },
  { name: 'Óticas', icon: Glasses },
  { name: 'Autopeças', icon: Car },
  { name: 'Publicidade e Marketing', icon: Megaphone },
  { name: 'Gráficas', icon: Printer },
  { name: 'Consultoria empresarial', icon: BriefcaseBusiness },
  { name: 'Pet shops', icon: PawPrint },
  { name: 'Tecnologia', icon: Laptop },
  { name: 'Oficinas', icon: Wrench },
  { name: 'Material de construção', icon: Hammer },
  { name: 'Móveis', icon: Armchair },
  { name: 'Alimentos e bebidas', icon: Utensils },
  { name: 'Roupas e acessórios', icon: Shirt },
  { name: 'Produtor rural', icon: Wheat },
  { name: 'Postos de combustível', icon: Fuel },
  { name: 'Prestadores de serviços', icon: HandHelping },
];

export const BusinessSegmentsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12 w-full">
        {/* Header da seção */}
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest font-title">
            Gestão inteligente para diferentes tipos de negócio
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-text-primary font-title leading-tight">
            A PixelConta acompanha o crescimento do seu negócio
          </h2>
          <p className="text-base text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Centralize a emissão de notas fiscais, o controle financeiro, os clientes, produtos e vendas em uma plataforma preparada para diferentes tipos de empresa.
          </p>
          
          <div className="flex items-center justify-center mt-2">
            <span className="text-sm font-semibold text-primary flex items-center gap-2">
              <span className="h-px w-8 bg-primary"></span>
              Atendemos diversos segmentos
              <span className="h-px w-8 bg-primary"></span>
            </span>
          </div>
        </div>

        {/* Grade de segmentos */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {businessSegments.map(({ name, icon: Icon }) => (
            <article 
              key={name} 
              className="flex items-center gap-4 min-h-[80px] p-4 border border-border rounded-xl bg-white shadow-sm hover:-translate-y-1 hover:border-primary hover:shadow-premium transition-all duration-200"
            >
              <div 
                className="flex items-center justify-center w-12 h-12 shrink-0 rounded-lg bg-surface text-text-primary" 
                aria-hidden="true"
              >
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <span className="text-text-primary text-[15px] sm:text-[16px] font-medium leading-tight">
                {name}
              </span>
            </article>
          ))}
        </div>

        {/* CTA comercial */}
        <div className="flex flex-col items-center justify-center gap-5 mt-4 text-center">
          <p className="text-sm text-text-secondary max-w-md">
            Não encontrou o seu segmento? A PixelConta também pode se adaptar às necessidades da sua empresa.
          </p>
          <a href="#planos">
            <Button variant="primary" size="lg">
              Conhecer a PixelConta
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};
