import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Search, Save, Key, Server, ToggleLeft, Link2, Sparkles
} from 'lucide-react';
import { db } from '../mocks/db';
import { PageHeader } from '../components/shared/PageHeader';
import { IntegrationCard } from '../components/shared/IntegrationCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Switch } from '../components/ui/Switch';
import { useToast } from '../context/ToastContext';
import type { Integration } from '../types';

export const Integracoes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [integrations, setIntegrations] = useState<Integration[]>(() => db.integrations);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load integration for details mode
  const integrationDetails = useMemo(() => {
    if (!id) return null;
    return integrations.find(i => i.id === id) || null;
  }, [integrations, id]);

  // Form state for integration connection config
  const [configForm, setConfigForm] = useState({
    apiKey: 'pk_live_51234567890abcdef...',
    webhookUrl: 'https://api.pixelcontas.com.br/v1/webhooks/shopify',
    invoiceType: 'NF-e' as 'NFS-e' | 'NF-e' | 'NFC-e',
    series: '1',
    natureOfOperation: 'Prestação de serviços',
    sendEmailAutomatically: true,
    autoEmit: true
  });

  // Load config form values when integrationDetails changes
  React.useEffect(() => {
    if (integrationDetails?.config) {
      setConfigForm(prev => ({
        ...prev,
        apiKey: integrationDetails.config?.apiKey || '',
        webhookUrl: integrationDetails.config?.webhookUrl || '',
        invoiceType: integrationDetails.config?.invoiceType || 'NFS-e',
        series: integrationDetails.config?.series || '1',
        natureOfOperation: integrationDetails.config?.natureOfOperation || 'Prestação de serviços',
        sendEmailAutomatically: integrationDetails.config?.sendEmailAutomatically !== false,
        autoEmit: integrationDetails.config?.autoEmit !== false
      }));
    }
  }, [integrationDetails]);

  // Categories filter list
  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'infoproduto', label: 'Infoprodutos' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'payment', label: 'Pagamentos' },
    { id: 'marketplace', label: 'Marketplaces' },
    { id: 'api', label: 'API e Webhooks' }
  ];

  // Filtering
  const filteredIntegrations = useMemo(() => {
    return integrations.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [integrations, searchTerm, selectedCategory]);

  // Trigger connect mock
  const handleConnect = (intId: string) => {
    toast.info('Sincronizando canais de conexão...');
    setTimeout(() => {
      const nextInts = integrations.map(item => {
        if (item.id === intId) {
          return {
            ...item,
            status: 'connected' as const,
            lastSync: new Date().toISOString(),
            config: {
              apiKey: 'pk_live_test_key_generated_on_connection',
              webhookUrl: `https://api.pixelcontas.com.br/v1/webhooks/${item.name.toLowerCase()}`,
              invoiceType: item.name === 'Shopify' || item.name === 'WooCommerce' ? 'NF-e' as const : 'NFS-e' as const,
              sendEmailAutomatically: true,
              autoEmit: true
            }
          };
        }
        return item;
      });
      setIntegrations(nextInts);
      db.integrations = nextInts;
      toast.success('Integração conectada! Redirecionando para configurações.');
      navigate(`/app/integracoes/${intId}`);
    }, 600);
  };

  const handleManage = (intId: string) => {
    navigate(`/app/integracoes/${intId}`);
  };

  // Save Config form
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const nextInts = integrations.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'connected' as const,
          config: {
            ...configForm
          }
        };
      }
      return item;
    });

    setIntegrations(nextInts);
    db.integrations = nextInts;
    toast.success('Configurações de integração salvas com sucesso!');
    navigate('/app/integracoes');
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* 1. LIST MODE */}
      {!id && (
        <>
          <PageHeader
            title="Central de Integrações"
            description="Conecte suas plataformas de vendas e gateways de pagamento para automatizar a emissão fiscal."
          />

          {/* Filters Area */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Category selection */}
            <div className="flex items-center gap-1.5 bg-surface p-1 rounded-soft border border-border text-xs overflow-x-auto w-full sm:w-auto shrink-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-soft font-semibold transition-all duration-150 whitespace-nowrap
                    ${selectedCategory === cat.id 
                      ? 'bg-white text-text-primary shadow-sm border border-neutral-borderLight/40' 
                      : 'text-text-secondary hover:text-text-primary'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:max-w-xs">
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar integração..."
                icon={<Search className="h-4.5 w-4.5" />}
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={handleConnect}
                onManage={handleManage}
              />
            ))}
          </div>
        </>
      )}

      {/* 2. CONFIGURATION MODE */}
      {id && integrationDetails && (
        <form onSubmit={handleSaveConfig} className="flex flex-col gap-6">
          <PageHeader
            title={`Configurar Integração com ${integrationDetails.name}`}
            description={`Configure as credenciais e as regras tributárias específicas para a importação de pedidos.`}
            breadcrumbs={[
              { label: 'Integrações', link: '/app/integracoes' },
              { label: integrationDetails.name }
            ]}
            action={
              <div className="flex items-center gap-2">
                <Link to="/app/integracoes">
                  <Button variant="outline" size="sm">Cancelar</Button>
                </Link>
                <Button type="submit" variant="primary" size="sm" icon={<Save className="h-4 w-4" />}>
                  Salvar Regras
                </Button>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column: Config Forms */}
            <div className="lg:col-span-2 border border-border rounded-premium p-6 bg-white shadow-premium flex flex-col gap-6">
              
              {/* Credentials Section */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-1 border-b border-border flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-text-primary" />
                  <span>Credenciais de Conexão</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Chave de API / Token de Acesso"
                    value={configForm.apiKey}
                    onChange={e => setConfigForm(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Chave secreta fornecida pela plataforma"
                  />
                  <Input
                    label="Webhook URL (Destino)"
                    value={configForm.webhookUrl}
                    disabled={true}
                    helperText="Configure esta URL nas definições de webhook da plataforma."
                  />
                </div>
              </div>

              {/* Fiscal Rules Section */}
              <div className="flex flex-col gap-4 mt-2">
                <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-1 border-b border-border flex items-center gap-1.5">
                  <Server className="h-4 w-4 text-text-primary" />
                  <span>Regras Fiscais Padrão</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Tipo de Nota Fiscal"
                    value={configForm.invoiceType}
                    onChange={e => setConfigForm(prev => ({ ...prev, invoiceType: e.target.value as any }))}
                    options={[
                      { value: 'NFS-e', label: 'NFS-e (Serviços)' },
                      { value: 'NF-e', label: 'NF-e (Mercadorias)' },
                      { value: 'NFC-e', label: 'NFC-e (Consumidor)' }
                    ]}
                  />
                  <Input
                    label="Série Padrão"
                    value={configForm.series}
                    onChange={e => setConfigForm(prev => ({ ...prev, series: e.target.value }))}
                    placeholder="Ex: 1"
                  />
                  <Select
                    label="Natureza da Operação"
                    value={configForm.natureOfOperation}
                    onChange={e => setConfigForm(prev => ({ ...prev, natureOfOperation: e.target.value }))}
                    options={[
                      { value: 'Prestação de serviços', label: 'Prestação de serviços' },
                      { value: 'Tributação no município', label: 'Tributação no município' },
                      { value: 'Exportação', label: 'Exportação' }
                    ]}
                  />
                </div>
              </div>

              {/* Automation Toggles */}
              <div className="flex flex-col gap-4 mt-2">
                <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-1 border-b border-border flex items-center gap-1.5">
                  <ToggleLeft className="h-4 w-4 text-text-primary" />
                  <span>Fluxo e Automação</span>
                </h3>
                <div className="flex flex-col gap-4">
                  <Switch
                    label="Ativar emissão automática"
                    description="Emitir a nota fiscal instantaneamente assim que a venda for aprovada e importada."
                    checked={configForm.autoEmit}
                    onChange={() => setConfigForm(prev => ({ ...prev, autoEmit: !prev.autoEmit }))}
                  />
                  <div className="h-px bg-border"></div>
                  <Switch
                    label="Enviar e-mail para o cliente automaticamente"
                    description="Enviar o PDF e o XML da nota por e-mail logo após a autorização da prefeitura/SEFAZ."
                    checked={configForm.sendEmailAutomatically}
                    onChange={() => setConfigForm(prev => ({ ...prev, sendEmailAutomatically: !prev.sendEmailAutomatically }))}
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Connection Details */}
            <div className="flex flex-col gap-6">
              
              {/* Connection Status Card */}
              <div className="border border-border rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4 text-xs">
                <h3 className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border">
                  Status de Conexão
                </h3>
                
                <div className="flex items-center gap-2.5 bg-surface p-3 rounded-soft border border-border">
                  <Link2 className="h-5 w-5 text-text-primary" />
                  <div className="flex flex-col">
                    <span className="font-bold text-text-primary">Canal Vinculado</span>
                    <span className="text-[10px] text-text-secondary">Credenciais ativas e testadas</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 text-text-secondary mt-1">
                  <div className="flex justify-between">
                    <span>Última sincronização:</span>
                    <span className="font-semibold text-text-primary">
                      {integrationDetails.lastSync 
                        ? new Date(integrationDetails.lastSync).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        : 'Nunca sincronizado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Versão da API:</span>
                    <span className="font-semibold text-text-primary">v3.0.2-LTS</span>
                  </div>
                </div>
              </div>

              {/* Advanced Help */}
              <div className="bg-black-soft/30 border border-primary/20 rounded-premium p-5 shadow-premium flex flex-col gap-3 text-xs">
                <h4 className="font-bold text-text-primary font-title flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>Dica Fiscal</span>
                </h4>
                <p className="text-text-secondary leading-relaxed text-[11px]">
                  Configurar o envio automático de e-mails reduz chamados de suporte técnico dos seus clientes pedindo a nota. Caso o e-mail não seja enviado automaticamente, você sempre pode fazer o reenvio manual pela listagem de notas.
                </p>
              </div>

            </div>
          </div>
        </form>
      )}

    </div>
  );
};
export default Integracoes;
