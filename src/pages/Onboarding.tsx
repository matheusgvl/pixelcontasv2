import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Building2, CheckCircle, ArrowRight, ArrowLeft, Search
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Stepper } from '../components/shared/Stepper';
import { UploadArea } from '../components/shared/UploadArea';
import { useToast } from '../context/ToastContext';
import { cepService, cnpjService } from '../services/api';
 
export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [certificateUploaded, setCertificateUploaded] = useState(false);
  
  // Selection states
  const [operationTypes, setOperationTypes] = useState<string[]>([]);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
 
  const { register, setValue, getValues, watch } = useForm({
    defaultValues: {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      inscEstadual: '',
      inscMunicipal: '',
      regimeTributario: 'Simples Nacional',
      cnae: '',
      email: '',
      telefone: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      
      tipoNota: 'NFS-e',
      municipioEmissao: 'Recife',
      serieNota: '1',
      numeroInicial: '1',
      naturezaOperacao: 'Prestação de serviços',
      ambiente: 'Homologação',
      
      senhaCertificado: ''
    }
  });

  const steps = [
    { title: 'Dados da Empresa', description: 'CNPJ e Contatos' },
    { title: 'Tipo de Operação', description: 'Como você vende' },
    { title: 'Ajuste Fiscal', description: 'Série e Tipo de Nota' },
    { title: 'Certificado A1', description: 'Upload de arquivo' },
    { title: 'Integrações', description: 'Canais de Vendas' },
    { title: 'Finalização', description: 'Resumo e Acesso' }
  ];

  // Helper CNPJ Autofill simulation
  const handleCNPJAutofill = async () => {
    const rawCnpj = getValues('cnpj').replace(/\D/g, '');
    if (rawCnpj.length !== 14) {
      toast.error('Insira um CNPJ válido com 14 dígitos para testar o preenchimento automático.');
      return;
    }
    
    setLoadingCNPJ(true);
    try {
      const data = await cnpjService.fetchCompanyData(rawCnpj);
      setValue('razaoSocial', data.companyName);
      setValue('nomeFantasia', data.tradingName || '');
      setValue('inscEstadual', data.stateRegistration || '');
      setValue('inscMunicipal', data.municipalRegistration || '');
      setValue('cnae', data.cnaePrimary);
      setValue('email', data.email);
      setValue('telefone', data.phone);
      setValue('cep', data.address.zipCode);
      setValue('endereco', data.address.street);
      setValue('numero', data.address.number);
      setValue('complemento', data.address.complement || '');
      setValue('bairro', data.address.neighborhood);
      setValue('cidade', data.address.city);
      setValue('estado', data.address.state);
      
      toast.success('Dados da empresa preenchidos automaticamente com sucesso!');
    } catch (e) {
      toast.error('Erro ao preencher dados do CNPJ.');
    } finally {
      setLoadingCNPJ(false);
    }
  };

  // Helper CEP Autofill simulation
  const handleCEPAutofill = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const rawCep = getValues('cep').replace(/\D/g, '');
      if (rawCep.length !== 8) {
        toast.error('CEP inválido. Digite 8 números e aperte Enter.');
        return;
      }

      setLoadingCEP(true);
      try {
        const address = await cepService.fetchAddress(rawCep);
        if (address) {
          setValue('endereco', address.street);
          setValue('bairro', address.neighborhood);
          setValue('cidade', address.city);
          setValue('estado', address.state);
          toast.success('Endereço localizado e preenchido!');
        }
      } catch (err) {
        toast.error('Erro ao buscar o CEP.');
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  const toggleOperationType = (type: string) => {
    if (operationTypes.includes(type)) {
      setOperationTypes(operationTypes.filter(t => t !== type));
    } else {
      setOperationTypes([...operationTypes, type]);
    }
  };

  const toggleIntegration = (name: string) => {
    if (connectedIntegrations.includes(name)) {
      setConnectedIntegrations(connectedIntegrations.filter(n => n !== name));
      toast.info(`Integração com ${name} desconectada.`);
    } else {
      setConnectedIntegrations([...connectedIntegrations, name]);
      toast.success(`Integração com ${name} conectada com sucesso!`);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!watch('razaoSocial') || !watch('cnpj')) {
        toast.error('Preencha a Razão Social e o CNPJ da empresa para prosseguir.');
        return;
      }
    }
    if (step === 2) {
      if (operationTypes.length === 0) {
        toast.error('Selecione pelo menos um tipo de operação que a sua empresa realiza.');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinish = () => {
    toast.success('Configuração inicial concluída com sucesso! Bem-vindo à PixelContas.');
    navigate('/app/dashboard');
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Onboarding Header Title */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="text-xl md:text-2xl font-black text-text-primary font-title">
          Configuração da sua empresa
        </h1>
        <p className="text-xs text-text-secondary">
          Siga as etapas abaixo para habilitar a emissão de notas no sistema.
        </p>
      </div>

      {/* Stepper Progress bar */}
      <Stepper steps={steps} currentStep={step} className="my-2" />

      {/* Step Contents */}
      <div className="mt-4 min-h-[350px]">
        
        {/* Step 1: Dados da Empresa */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="bg-brand-lightBlue/20 p-4 border border-border rounded-soft text-xs text-text-primary flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="font-bold block">Dica para demonstração:</span>
                Digite o CNPJ <strong className="font-mono text-text-primary select-all">12.345.678/0001-90</strong> e clique ao lado para preenchimento completo automático.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCNPJAutofill}
                loading={loadingCNPJ}
                type="button"
                className="shrink-0 text-xs"
              >
                Autopreencher Dados
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input {...register('cnpj')} label="CNPJ da Empresa" placeholder="00.000.000/0000-00" />
              <Input {...register('razaoSocial')} label="Razão Social" placeholder="Ex: Pixel Digital Ltda" className="md:col-span-2" />
              <Input {...register('nomeFantasia')} label="Nome Fantasia" placeholder="Nome comercial" />
              <Input {...register('inscEstadual')} label="Inscrição Estadual (se houver)" placeholder="Isento ou numeração" />
              <Input {...register('inscMunicipal')} label="Inscrição Municipal" placeholder="Numeração municipal" />
              <Select
                {...register('regimeTributario')}
                label="Regime Tributário"
                options={[
                  { value: 'Simples Nacional', label: 'Simples Nacional' },
                  { value: 'Lucro Presumido', label: 'Lucro Presumido' },
                  { value: 'Lucro Real', label: 'Lucro Real' },
                  { value: 'MEI', label: 'Microempreendedor Individual (MEI)' }
                ]}
              />
              <Input {...register('cnae')} label="CNAE Principal" placeholder="Ex: 6201-5/01" className="md:col-span-2" />
              <Input {...register('email')} label="E-mail de Contato Fiscal" placeholder="fiscal@empresa.com" />
              <Input {...register('telefone')} label="Telefone" placeholder="(81) 3322-4455" />
              
              <Input 
                {...register('cep')} 
                label="CEP" 
                placeholder="Pressione ENTER após digitar" 
                onKeyDown={handleCEPAutofill}
                suffix={loadingCEP ? (
                  <svg className="animate-spin h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : <Search className="h-4 w-4 text-white/60" />}
              />
              
              <Input {...register('endereco')} label="Endereço" placeholder="Avenida, Rua, etc." className="md:col-span-2" />
              <Input {...register('numero')} label="Número" placeholder="Nº" />
              <Input {...register('complemento')} label="Complemento" placeholder="Sala, Apto, etc." />
              <Input {...register('bairro')} label="Bairro" placeholder="Bairro" />
              <Input {...register('cidade')} label="Cidade" placeholder="Cidade" />
              <Input {...register('estado')} label="Estado" placeholder="UF" />
            </div>
          </div>
        )}

        {/* Step 2: Tipo de Operação */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-fade-in text-center items-center py-4">
            <div className="max-w-md flex flex-col gap-1.5">
              <h2 className="text-base font-bold text-text-primary font-title">
                Como você vende seus produtos ou serviços?
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Selecione as opções abaixo para que o PixelContas configure as regras corretas de faturamento.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full mt-4">
              {[
                { id: 'servico', label: 'Prestação de Serviços', desc: 'Consultoria, desenvolvimento, etc.' },
                { id: 'produto', label: 'Venda de Produtos', desc: 'Mercadorias físicas em geral' },
                { id: 'infoproduto', label: 'Infoprodutos', desc: 'Cursos, e-books e mentorias' },
                { id: 'ecommerce', label: 'Loja Virtual / E-commerce', desc: 'Vendas via Shopify, WooCommerce' },
                { id: 'assinatura', label: 'Assinaturas / Recorrência', desc: 'Mensalidades e clubes de benefícios' },
                { id: 'outro', label: 'Outro Modelo', desc: 'Outras formas de faturamento' }
              ].map((op) => {
                const selected = operationTypes.includes(op.id);
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => toggleOperationType(op.id)}
                    className={`p-5 border rounded-premium text-left flex flex-col gap-2 transition-all duration-200 hover:shadow-premium
                      ${selected 
                        ? 'border-black bg-black-soft/10 ring-2 ring-primary/20' 
                        : 'border-border bg-white'}`}
                  >
                    <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0
                      ${selected ? 'border-black bg-black text-white' : 'border-border bg-white'}`}>
                      {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <span className="text-xs font-bold text-text-primary font-title">{op.label}</span>
                      <span className="text-[10px] text-text-secondary leading-normal">{op.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Configuração Fiscal */}
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="max-w-md flex flex-col gap-1">
              <h2 className="text-base font-bold text-text-primary font-title">
                Definições Fiscais Padrão
              </h2>
              <p className="text-xs text-text-secondary">
                Parâmetros básicos de comunicação com as prefeituras e secretarias de fazenda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                {...register('tipoNota')}
                label="Tipo de Nota Fiscal Principal"
                options={[
                  { value: 'NFS-e', label: 'NFS-e (Nota de Serviços)' },
                  { value: 'NF-e', label: 'NF-e (Nota de Produtos/Mercadoria)' },
                  { value: 'NFC-e', label: 'NFC-e (Nota Consumidor - Varejo)' }
                ]}
              />
              <Input {...register('municipioEmissao')} label="Município de Emissão" placeholder="Ex: Recife" />
              <Input {...register('serieNota')} label="Série da Nota" placeholder="Ex: 1" />
              <Input {...register('numeroInicial')} label="Número Inicial de Emissão" placeholder="Ex: 100" />
              <Select
                {...register('naturezaOperacao')}
                label="Natureza da Operação"
                options={[
                  { value: 'Prestação de serviços', label: 'Prestação de serviços' },
                  { value: 'Tributação no município', label: 'Tributação no município' },
                  { value: 'Exportação', label: 'Exportação de serviços' },
                  { value: 'Isento', label: 'Isenção de impostos' }
                ]}
              />
              <Select
                {...register('ambiente')}
                label="Ambiente de Emissão"
                options={[
                  { value: 'Homologação', label: 'Homologação (Testes sem valor fiscal)' },
                  { value: 'Produção', label: 'Produção (Válido juridicamente)' }
                ]}
              />
            </div>
          </div>
        )}

        {/* Step 4: Certificado Digital */}
        {step === 4 && (
          <div className="flex flex-col gap-6 animate-fade-in max-w-xl mx-auto py-2">
            <div className="flex flex-col gap-1 text-center items-center">
              <Building2 className="h-10 w-10 text-text-primary mb-2" />
              <h2 className="text-base font-bold text-text-primary font-title">
                Cadastre seu Certificado Digital A1
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
                O certificado digital A1 (.pfx) é obrigatório para assinar eletronicamente as notas perante o governo.
              </p>
            </div>

            <UploadArea
              onFileSelect={(file) => {
                setCertificateUploaded(true);
                toast.success(`Certificado ${file.name} carregado.`);
              }}
              accept=".pfx"
              label="Arraste seu certificado A1 (.pfx) aqui ou clique para selecionar"
            />

            <Input
              {...register('senhaCertificado')}
              type="password"
              label="Senha do Certificado Digital"
              placeholder="Digite a senha de proteção do arquivo"
              disabled={!certificateUploaded}
            />

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-xs">
              <span className="text-text-secondary font-medium">Você pode pular esta etapa se preferir.</span>
              <button
                type="button"
                onClick={() => {
                  setCertificateUploaded(false);
                  setValue('senhaCertificado', '');
                  nextStep();
                }}
                className="text-text-primary hover:underline font-bold"
              >
                Configurar depois
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Integrações */}
        {step === 5 && (
          <div className="flex flex-col gap-6 animate-fade-in text-center items-center py-2">
            <div className="max-w-md flex flex-col gap-1">
              <h2 className="text-base font-bold text-text-primary font-title">
                Conecte seus canais de vendas
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Selecione as plataformas que você utiliza para que possamos importar seus pedidos.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl mt-4">
              {[
                { id: 'Hotmart', desc: 'Infoprodutos' },
                { id: 'Kiwify', desc: 'Infoprodutos' },
                { id: 'Shopify', desc: 'E-commerce' },
                { id: 'Asaas', desc: 'Pagamentos' },
                { id: 'WooCommerce', desc: 'E-commerce' },
                { id: 'Stripe', desc: 'Pagamentos' },
                { id: 'Eduzz', desc: 'Infoprodutos' },
                { id: 'Mercado Pago', desc: 'Pagamentos' }
              ].map((item) => {
                const isConnected = connectedIntegrations.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-premium bg-white flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-premium
                      ${isConnected ? 'border-black bg-black-soft/10' : 'border-border'}`}
                  >
                    <span className="h-9 w-9 bg-surface rounded-full flex items-center justify-center font-black text-text-primary text-xs select-none">
                      {item.id.charAt(0)}
                    </span>
                    <div className="flex flex-col gap-0.5 text-center">
                      <span className="text-xs font-bold text-text-primary font-title">{item.id}</span>
                      <span className="text-[9px] text-text-secondary uppercase font-semibold">{item.desc}</span>
                    </div>
                    <Button
                      type="button"
                      variant={isConnected ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => toggleIntegration(item.id)}
                      className="!py-1 !px-2.5 text-[10px]"
                    >
                      {isConnected ? 'Desconectar' : 'Conectar'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Finalização */}
        {step === 6 && (
          <div className="flex flex-col gap-6 animate-fade-in max-w-lg mx-auto py-2">
            <div className="flex flex-col gap-1.5 text-center items-center">
              <div className="h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-1">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-text-primary font-title">
                Tudo pronto para começar!
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
                Sua conta foi criada e as configurações iniciais da empresa foram salvas com sucesso.
              </p>
            </div>

            {/* Config summary card */}
            <div className="border border-border rounded-premium p-5 bg-white flex flex-col gap-4 shadow-sm text-xs">
              <h4 className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border">
                Resumo da Configuração
              </h4>
              <div className="flex flex-col gap-2.5 text-text-secondary">
                <div className="flex justify-between">
                  <span>Razão Social:</span>
                  <span className="font-semibold text-text-primary">{watch('razaoSocial')}</span>
                </div>
                <div className="flex justify-between">
                  <span>CNPJ da empresa:</span>
                  <span className="font-semibold text-text-primary font-mono">{watch('cnpj')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ambiente de Emissão:</span>
                  <span className="font-semibold text-text-primary">{watch('ambiente')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo de Nota:</span>
                  <span className="font-semibold text-text-primary">{watch('tipoNota')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Certificado Digital:</span>
                  <span className="font-semibold text-text-primary">
                    {certificateUploaded ? 'Arquivo A1 Carregado' : 'Configurar Depois'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Integrações conectadas:</span>
                  <span className="font-semibold text-text-primary">
                    {connectedIntegrations.length > 0 ? connectedIntegrations.join(', ') : 'Nenhuma conectada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px]">
                Próximos Passos recomendados
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Importar as primeiras notas do mês', done: true },
                  { label: 'Homologar emissão fiscal de teste', done: certificateUploaded },
                  { label: 'Convidar sua contabilidade ou financeiro', done: false }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-text-secondary">
                    <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 border
                      ${item.done ? 'bg-functional-success/10 border-green-600 text-green-600' : 'border-border bg-white'}`}>
                      {item.done && <CheckCircle className="h-3 w-3 stroke-[3px]" />}
                    </span>
                    <span className={item.done ? 'line-through text-white/60 font-medium' : 'text-text-primary font-semibold'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Onboarding Bottom Action buttons */}
      <div className="flex justify-between items-center border-t border-border pt-6 mt-4">
        {step > 1 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Voltar
          </Button>
        ) : <div />}

        {step < 6 ? (
          <Button
            variant="primary"
            size="sm"
            onClick={nextStep}
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Avançar
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleFinish}
            icon={<CheckCircle className="h-4 w-4 animate-pulse" />}
          >
            Acessar meu painel
          </Button>
        )}
      </div>

    </div>
  );
};
export default Onboarding;
