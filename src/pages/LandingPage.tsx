import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Shield, Zap, FileText, CheckCircle2, ChevronDown, 
  RefreshCw, BarChart4, MessageSquare
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BusinessSegmentsSection } from '../components/shared/BusinessSegmentsSection';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const benefits = [
    { title: 'Notas em poucos passos', desc: 'Emissão descomplicada de NFS-e, NF-e e NFC-e em segundos com preenchimento automático.', icon: <FileText className="h-6 w-6" /> },
    { title: 'Automação após cada venda', desc: 'Emissão instantânea logo após a confirmação de pagamento do seu cliente.', icon: <Zap className="h-6 w-6" /> },
    { title: 'XML e PDF organizados', desc: 'Armazenamento seguro em nuvem de todos os arquivos fiscais da sua empresa.', icon: <Shield className="h-6 w-6" /> },
    { title: 'Painel e Relatórios simples', desc: 'Acompanhe seu faturamento, impostos acumulados e notas por canal de venda.', icon: <BarChart4 className="h-6 w-6" /> },
    { title: 'Suporte de Contadores', desc: 'Fale diretamente com o seu contador dedicado através da nossa plataforma.', icon: <MessageSquare className="h-6 w-6" /> },
    { title: 'Múltiplas Integrações', desc: 'Conecte sua loja, gateway de pagamento ou plataforma de infoproduto em minutos.', icon: <RefreshCw className="h-6 w-6" /> },
  ];

  const integrationsList = [
    { name: 'Hotmart', cat: 'Infoprodutos' },
    { name: 'Kiwify', cat: 'Infoprodutos' },
    { name: 'Eduzz', cat: 'Infoprodutos' },
    { name: 'Shopify', cat: 'E-commerce' },
    { name: 'Asaas', cat: 'Pagamentos' },
    { name: 'WooCommerce', cat: 'E-commerce' },
    { name: 'Mercado Pago', cat: 'Pagamentos' },
    { name: 'Stripe', cat: 'Pagamentos' },
    { name: 'PagSeguro', cat: 'Pagamentos' },
    { name: 'Nuvemshop', cat: 'E-commerce' },
  ];

  const faqs = [
    { q: 'O que é a PixelContas?', a: 'A PixelContas é uma plataforma completa de contabilidade digital e emissão automatizada de notas fiscais (NFS-e, NF-e e NFC-e) desenvolvida especialmente para negócios digitais, prestadores de serviços, e-commerces e infoprodutores.' },
    { q: 'Como funciona a emissão automática?', a: 'Você conecta a sua plataforma de vendas (como Hotmart, Shopify ou Asaas). Assim que o pagamento é aprovado, nossa plataforma recebe o pedido, valida os dados fiscais e emite a nota na prefeitura ou SEFAZ de forma 100% automatizada, enviando o PDF e XML por e-mail para o cliente.' },
    { q: 'Preciso de certificado digital?', a: 'Sim, para emitir notas fiscais eletrônicas com validade jurídica, você precisará de um Certificado Digital A1. Nós auxiliamos no upload do arquivo .pfx de forma rápida durante o onboarding ou configurações do painel.' },
    { q: 'Posso testar antes de assinar?', a: 'Com certeza! Você pode criar sua conta gratuitamente e testar nossa plataforma no ambiente de homologação por até 7 dias sem qualquer compromisso.' },
    { q: 'O suporte contábil está incluso?', a: 'Nos planos superiores, sim! Você conta com atendimento de contadores reais integrados diretamente na plataforma para tirar suas dúvidas e garantir que a sua empresa esteja sempre em dia com o fisco.' }
  ];

  const plans = [
    { name: 'Plano Start', price: 'R$ 89', desc: 'Ideal para prestadores de serviços iniciantes e freelancers.', limit: 'Até 30 notas/mês', btn: 'Começar agora', highlight: false },
    { name: 'Plano Pro', price: 'R$ 189', desc: 'A melhor escolha para e-commerces, infoprodutores e agências.', limit: 'Até 500 notas/mês', btn: 'Testar gratuitamente', highlight: true },
    { name: 'Plano Advanced', price: 'R$ 349', desc: 'Para empresas consolidadas com alto volume de faturamento.', limit: 'Notas ilimitadas', btn: 'Falar com especialista', highlight: false }
  ];

  const logoSrc = "/logo-horizontal.jpeg";

  return (
    <div className="flex flex-col w-full bg-pixel-neutral-50">
      {/* Cabeçalho */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-50 border-b border-pixel-neutral-200 flex items-center justify-between px-6 md:px-12">
        <Link to="/" className="flex items-center gap-3 select-none">
          <img src={logoSrc} alt="Logo PixelConta" className="h-8 w-auto object-contain" />
          <span className="text-xl font-extrabold text-pixel-navy-900 font-title tracking-tight">
            Pixel<span className="text-pixel-navy-900">Contas</span>
          </span>
        </Link>

        {/* Menu Items */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-pixel-neutral-900">
          <a href="#funcionalidades" className="hover:text-pixel-navy-900 transition-colors">Funcionalidades</a>
          <a href="#integracoes" className="hover:text-pixel-navy-900 transition-colors">Integrações</a>
          <a href="#contabilidade" className="hover:text-pixel-navy-900 transition-colors">Contabilidade</a>
          <a href="#planos" className="hover:text-pixel-navy-900 transition-colors">Planos</a>
          <a href="#faq" className="hover:text-pixel-navy-900 transition-colors">Ajuda</a>
        </nav>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3.5">
          <Link to="/login">
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </Link>
          <Link to="/cadastro" className="hidden sm:block">
            <Button variant="primary" size="sm">
              Começar agora
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 md:px-12 lg:px-24 flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto w-full">
        {/* Left text */}
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-pixel-navy-900 font-title leading-tight">
            Venda mais. A <span className="text-pixel-navy-900">PixelContas</span> cuida das suas notas fiscais.
          </h1>
          <p className="text-base md:text-lg text-pixel-neutral-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Emita e automatize notas fiscais, organize sua empresa e acompanhe sua contabilidade em um único lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/cadastro" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full">
                Testar gratuitamente
              </Button>
            </Link>
            <a href="#funcionalidades" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                Conhecer a plataforma
              </Button>
            </a>
          </div>
          {/* Explanatory Line */}
          <div className="pt-4 text-xs font-semibold text-pixel-navy-900 flex items-center justify-center lg:justify-start gap-2">
            <span>Conecte sua loja</span>
            <ArrowRight className="h-3 w-3" />
            <span>Receba seus pedidos</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-pixel-gold-500 font-bold">Emita notas automaticamente</span>
          </div>
        </div>

        {/* Right illustration / Mockup */}
        <div className="flex-1 w-full flex flex-col items-center relative select-none">
          {/* Laptop mock */}
          <div className="bg-white border-8 border-pixel-navy-900 rounded-premium shadow-premium p-4 w-full max-w-lg aspect-video flex flex-col gap-3 relative z-10">
            {/* Window bar */}
            <div className="flex gap-1.5 pb-2 border-b border-pixel-neutral-200">
              <span className="h-3 w-3 rounded-full bg-functional-error/80" />
              <span className="h-3 w-3 rounded-full bg-functional-warning/80" />
              <span className="h-3 w-3 rounded-full bg-functional-success/80" />
            </div>
            {/* Mocked dashboard overview */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="h-6 bg-brand-lightBlue/30 rounded w-1/3"></div>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="h-14 bg-pixel-neutral-100 rounded p-2 flex flex-col justify-between">
                  <span className="text-[7px] text-pixel-neutral-500 uppercase font-bold">Faturamento</span>
                  <span className="h-4 bg-brand-navy/10 rounded w-2/3"></span>
                </div>
                <div className="h-14 bg-pixel-neutral-100 rounded p-2 flex flex-col justify-between">
                  <span className="text-[7px] text-pixel-neutral-500 uppercase font-bold">Notas Emitidas</span>
                  <span className="h-4 bg-brand-teal/10 rounded w-2/3"></span>
                </div>
                <div className="h-14 bg-pixel-neutral-100 rounded p-2 flex flex-col justify-between">
                  <span className="text-[7px] text-pixel-neutral-500 uppercase font-bold">Impostos</span>
                  <span className="h-4 bg-brand-copper/10 rounded w-2/3"></span>
                </div>
              </div>
              <div className="flex-1 bg-neutral-bgSecondary/60 border border-pixel-neutral-200 rounded p-2.5 flex flex-col gap-2">
                <div className="h-3 bg-brand-navy/15 rounded w-1/4"></div>
                <div className="h-2.5 bg-pixel-neutral-200 rounded w-full"></div>
                <div className="h-2.5 bg-pixel-neutral-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>

          {/* Floating Mobile notification mock */}
          <div className="absolute bottom-[-20px] right-[20px] md:right-[50px] bg-pixel-navy-900 border border-brand-blue/30 text-white p-4 rounded-premium shadow-premium-hover flex items-center gap-3 max-w-[260px] z-20 animate-bounce">
            <div className="p-2.5 bg-pixel-navy-900 rounded-soft text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase font-bold text-pixel-navy-900 tracking-wider">Nota Fiscal Emitida</span>
              <p className="text-xs font-bold font-title">Sua nota fiscal foi emitida com sucesso</p>
            </div>
          </div>

          {/* Background decoration blur */}
          <div className="absolute inset-0 bg-brand-teal/5 filter blur-3xl rounded-full scale-75 -z-10" />
        </div>
      </section>

      {/* Benefícios */}
      <section id="funcionalidades" className="py-20 bg-white border-y border-pixel-neutral-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12 w-full">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2.5">
            <span className="text-xs font-bold text-pixel-navy-900 uppercase tracking-wider font-title">
              Nossas Vantagens
            </span>
            <h2 className="text-3xl font-black text-pixel-navy-900 font-title">
              Tudo que seu negócio precisa para crescer sem burocracia
            </h2>
            <p className="text-sm text-pixel-neutral-500">
              Simplifique sua gestão tributária com ferramentas completas de automação fiscal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b, idx) => (
              <div key={idx} className="p-6 border border-pixel-neutral-200 rounded-premium hover:shadow-premium transition-all duration-200 flex flex-col gap-3.5 group">
                <div className="p-3 bg-pixel-neutral-50 text-pixel-navy-900 rounded-soft w-fit group-hover:bg-pixel-navy-900 group-hover:text-white transition-colors duration-200">
                  {b.icon}
                </div>
                <h3 className="text-base font-bold text-pixel-navy-900 font-title">
                  {b.title}
                </h3>
                <p className="text-xs text-pixel-neutral-500 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 bg-neutral-bgSecondary/20">
        <div className="max-w-5xl mx-auto px-6 md:px-12 flex flex-col gap-12 w-full text-center items-center">
          <div className="max-w-xl flex flex-col gap-2.5">
            <span className="text-xs font-bold text-pixel-navy-900 uppercase tracking-wider font-title">Fluxo de automação</span>
            <h2 className="text-3xl font-black text-pixel-navy-900 font-title">Como funciona a emissão automática?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-pixel-navy-900 text-white flex items-center justify-center font-bold font-title">1</div>
              <h3 className="text-sm font-bold text-pixel-navy-900 font-title">Conecte sua Plataforma</h3>
              <p className="text-xs text-pixel-neutral-500">Integre sua loja ou gateway de pagamentos com poucos cliques.</p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-pixel-navy-900 text-white flex items-center justify-center font-bold font-title">2</div>
              <h3 className="text-sm font-bold text-pixel-navy-900 font-title">Receba seus Pedidos</h3>
              <p className="text-xs text-pixel-neutral-500">Suas vendas são importadas automaticamente pelo nosso sistema em tempo real.</p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-pixel-gold-500 text-white flex items-center justify-center font-bold font-title">3</div>
              <h3 className="text-sm font-bold text-pixel-navy-900 font-title">Emissão Automática</h3>
              <p className="text-xs text-pixel-neutral-500">A nota é gerada, autorizada na prefeitura/SEFAZ e entregue ao seu cliente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrações */}
      <section id="integracoes" className="py-20 bg-white border-y border-pixel-neutral-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12 w-full">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2.5">
            <span className="text-xs font-bold text-pixel-navy-900 uppercase tracking-wider font-title">Ecosistema Conectado</span>
            <h2 className="text-3xl font-black text-pixel-navy-900 font-title">Compatível com as plataformas que você já usa</h2>
            <p className="text-sm text-pixel-neutral-500">Conecte facilmente seu canal de vendas e automatize seus fluxos.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {integrationsList.map((int, idx) => (
              <div key={idx} className="p-5 border border-pixel-neutral-200 rounded-premium hover:border-brand-teal/20 text-center flex flex-col items-center justify-center gap-2 hover:shadow-premium transition-all duration-200">
                <span className="h-10 w-10 rounded-full bg-pixel-neutral-100 flex items-center justify-center text-pixel-navy-900 font-black text-sm select-none">
                  {int.name.charAt(0)}
                </span>
                <span className="text-sm font-bold text-pixel-navy-900 font-title">{int.name}</span>
                <span className="text-[9px] uppercase font-bold text-pixel-neutral-500 tracking-wider">{int.cat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BusinessSegmentsSection />

      {/* Planos */}
      <section id="planos" className="py-20 bg-neutral-bgSecondary/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12 w-full">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2.5">
            <span className="text-xs font-bold text-pixel-navy-900 uppercase tracking-wider font-title">Preços Claros</span>
            <h2 className="text-3xl font-black text-pixel-navy-900 font-title">Escolha o plano ideal para a sua jornada</h2>
            <p className="text-sm text-pixel-neutral-500">Planos simples e transparentes. Mude de plano a qualquer momento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p, idx) => (
              <div 
                key={idx} 
                className={`p-8 border rounded-premium bg-white shadow-premium flex flex-col justify-between gap-6 transition-all duration-200 hover:shadow-premium-hover relative
                  ${p.highlight ? 'border-pixel-navy-900 ring-2 ring-brand-teal/30 scale-105 z-10' : 'border-pixel-neutral-200'}`}
              >
                {p.highlight && (
                  <span className="absolute top-[-14px] left-1/2 transform -translate-x-1/2 bg-pixel-gold-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Mais Escolhido
                  </span>
                )}

                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-pixel-navy-900 font-title">{p.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-pixel-navy-900 font-title">{p.price}</span>
                    <span className="text-xs text-pixel-neutral-500">/mês</span>
                  </div>
                  <p className="text-xs text-pixel-neutral-500 leading-relaxed">{p.desc}</p>
                  <div className="h-px bg-pixel-neutral-200 my-2"></div>
                  <ul className="flex flex-col gap-3 text-xs">
                    <li className="flex items-center gap-2 text-pixel-neutral-900 font-semibold">
                      <CheckCircle2 className="h-4.5 w-4.5 text-pixel-navy-900 shrink-0" />
                      <span>{p.limit}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-pixel-navy-900 shrink-0" />
                      <span>NFS-e, NF-e e NFC-e inclusas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-pixel-navy-900 shrink-0" />
                      <span>Integração de pedidos em lote</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-pixel-navy-900 shrink-0" />
                      <span>Download de XML e PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-pixel-navy-900 shrink-0" />
                      <span>Suporte técnico prioritário</span>
                    </li>
                  </ul>
                </div>

                <Link to="/cadastro" className="mt-4">
                  <Button 
                    variant={p.highlight ? 'primary' : 'outline'} 
                    className="w-full"
                  >
                    {p.btn}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white border-t border-pixel-neutral-200">
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex flex-col gap-12 w-full">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2.5">
            <span className="text-xs font-bold text-pixel-navy-900 uppercase tracking-wider font-title">FAQ</span>
            <h2 className="text-3xl font-black text-pixel-navy-900 font-title">Dúvidas Frequentes</h2>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-pixel-neutral-200 rounded-premium overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-pixel-navy-900 font-title text-sm bg-neutral-bg/20 hover:bg-neutral-bgSecondary/20 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4.5 w-4.5 text-pixel-neutral-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 border-t border-pixel-neutral-200 text-xs text-pixel-neutral-500 leading-relaxed bg-white animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chamada final */}
      <section className="py-20 bg-pixel-navy-900 text-white relative overflow-hidden">
        {/* Background gradient decoration */}
        <div className="absolute inset-0 bg-grad-inst opacity-90 z-0"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-4xl font-black font-title">Pronto para simplificar sua gestão fiscal?</h2>
          <p className="text-sm text-brand-lightBlue/80 max-w-lg leading-relaxed">
            Abra sua conta na PixelContas hoje mesmo. Comece a emitir notas com automação total e tenha foco absoluto no seu crescimento.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link to="/cadastro" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full">
                Começar agora gratuitamente
              </Button>
            </Link>
            <a href="#planos" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-white border-white/20 hover:bg-white/10">
                Ver tabela de planos
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-pixel-navy-950 py-12 px-6 md:px-12 lg:px-24 border-t border-brand-navy/30 text-xs text-brand-lightBlue/50 w-full shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Logo & description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="Logo PixelConta" className="h-8 w-auto object-contain" />
              <span className="text-lg font-black font-title tracking-tight text-white">
                Pixel<span className="text-pixel-navy-900">Contas</span>
              </span>
            </div>
            <p className="leading-relaxed">
              Plataforma de contabilidade digital e automação de documentos fiscais eletrônicos para negócios modernos.
            </p>
          </div>

          {/* Links col 1 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white font-title text-xs tracking-wider uppercase">Plataforma</h4>
            <a href="#funcionalidades" className="hover:text-pixel-navy-900 transition-colors">Funcionalidades</a>
            <a href="#integracoes" className="hover:text-pixel-navy-900 transition-colors">Integrações</a>
            <a href="#planos" className="hover:text-pixel-navy-900 transition-colors">Planos e Preços</a>
          </div>

          {/* Links col 2 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white font-title text-xs tracking-wider uppercase">Contabilidade</h4>
            <Link to="/login" className="hover:text-pixel-navy-900 transition-colors">Digitalização de Guias</Link>
            <Link to="/login" className="hover:text-pixel-navy-900 transition-colors">Atendimento Exclusivo</Link>
            <Link to="/login" className="hover:text-pixel-navy-900 transition-colors">Calendário de Obrigações</Link>
          </div>

          {/* Links col 3 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white font-title text-xs tracking-wider uppercase">Legal</h4>
            <a href="#" className="hover:text-pixel-navy-900 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-pixel-navy-900 transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-pixel-navy-900 transition-colors">Termos de Emissão Reguladora</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-brand-navy/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 PixelContas Contabilidade Digital LTDA. Todos os direitos reservados. CNPJ: 12.345.678/0001-90</span>
          <span>Recife - PE</span>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
