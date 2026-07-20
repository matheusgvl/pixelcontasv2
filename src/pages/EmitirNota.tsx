import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Plus, 
  Trash, Download, Mail, ExternalLink, RefreshCw
} from 'lucide-react';
import { db } from '../mocks/db';
import { invoiceService } from '../services/api';
import { Stepper } from '../components/shared/Stepper';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Checkbox } from '../components/ui/Checkbox';
import { InvoicePreview } from '../components/shared/InvoicePreview';
import { useToast } from '../context/ToastContext';
import type { Client, InvoiceTaxes, Invoice } from '../types';

export const EmitirNota: React.FC = () => {
  const toast = useToast();

  // Navigation states
  const [currentStep, setCurrentStep] = useState(1);
  const [issuing, setIssuing] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<Invoice | null>(null);
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Sub-modal for creating a new client on the fly
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  // Load clients, products, services
  const [clients, setClients] = useState<Client[]>(() => db.clients);
  const products = useMemo(() => db.products.filter(p => p.status === 'active'), []);
  const services = useMemo(() => db.services.filter(s => s.status === 'active'), []);

  // Set up React Hook Form
  const { register, setValue, watch, getValues, control, reset } = useForm({
    defaultValues: {
      type: 'NFS-e' as 'NFS-e' | 'NF-e' | 'NFC-e',
      clientId: '',
      natureOfOperation: 'Prestação de serviços',
      taxRegime: 'Simples Nacional',
      observations: '',
      
      // Taxes
      issRate: 5, // Default 5%
      icmsRate: 18,
      pisRate: 1.65,
      cofinsRate: 7.6,
      irRate: 1.5,
      csllRate: 1.0,
      inssRate: 11,
      issRetained: false,
      
      // Items list
      items: [
        { description: '', quantity: 1, value: 0, cnae: '6201-5/01', ncm: '', cfop: '' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const selectedType = watch('type');
  const selectedClientId = watch('clientId');
  const itemsList = watch('items');

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  // Stepper labels
  const steps = [
    { title: 'Tipo de Nota', description: 'NFS-e, NF-e ou NFC-e' },
    { title: 'Identificar Cliente', description: 'Tomador fiscal' },
    { title: 'Produtos / Serviços', description: 'Faturamento' },
    { title: 'Tributação', description: 'Alíquotas e retenções' },
    { title: 'Revisar & Emitir', description: 'Visualizar DANFE' }
  ];

  // Helper autofills from products/services selectors
  const handleSelectService = (index: number, serviceId: string) => {
    const srv = services.find(s => s.id === serviceId);
    if (srv) {
      setValue(`items.${index}.description`, srv.name);
      setValue(`items.${index}.value`, srv.defaultValue);
      setValue(`items.${index}.cnae`, srv.cnae);
      setValue('issRate', srv.issRate);
    }
  };

  const handleSelectProduct = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setValue(`items.${index}.description`, prod.name);
      setValue(`items.${index}.value`, prod.value);
      setValue(`items.${index}.ncm`, prod.ncm);
      setValue(`items.${index}.cfop`, prod.cfopDefault);
    }
  };

  // Create Client on the fly form
  const [newClientName, setNewClientName] = useState('');
  const [newClientDoc, setNewClientDoc] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCEP, setNewClientCEP] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const handleCreateClientOnTheFly = () => {
    if (!newClientName || !newClientDoc) {
      toast.error('Preencha pelo menos o Nome e CPF/CNPJ do cliente.');
      return;
    }

    const docClean = newClientDoc.replace(/\D/g, '');
    const isPJ = docClean.length === 14;

    const newClient: Client = {
      id: `cli-fly-${Date.now()}`,
      name: newClientName,
      document: newClientDoc,
      type: isPJ ? 'PJ' : 'PF',
      email: newClientEmail,
      phone: '(81) 99999-8888',
      address: {
        zipCode: newClientCEP || '52020-000',
        street: newClientAddress || 'Rua Nova de Cadastro',
        number: '10',
        neighborhood: 'Centro',
        city: 'Recife',
        state: 'PE'
      },
      totalInvoices: 0,
      totalSpent: 0,
      status: 'active'
    };

    // Update state and mock DB
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    db.clients = updatedClients;

    // Auto-select newly created client
    setValue('clientId', newClient.id);
    setShowNewClientModal(false);
    toast.success('Cliente cadastrado e selecionado com sucesso!');

    // Reset inputs
    setNewClientName('');
    setNewClientDoc('');
    setNewClientEmail('');
    setNewClientCEP('');
    setNewClientAddress('');
  };

  // Calculations for total invoice value
  const invoiceTotalValue = useMemo(() => {
    return itemsList.reduce((sum, item) => {
      return sum + ((Number(item.value) || 0) * (Number(item.quantity) || 1));
    }, 0);
  }, [itemsList]);

  // Construct Preview Invoice Object
  const previewInvoiceData = useMemo(() => {
    const rawForm = getValues();
    const taxes: InvoiceTaxes = {};
    const val = invoiceTotalValue;

    if (rawForm.type === 'NFS-e') {
      taxes.iss = Math.round((val * (Number(rawForm.issRate) / 100)) * 100) / 100;
      taxes.ir = Math.round((val * (Number(rawForm.irRate) / 100)) * 100) / 100;
      taxes.csll = Math.round((val * (Number(rawForm.csllRate) / 100)) * 100) / 100;
      taxes.inss = Math.round((val * (Number(rawForm.inssRate) / 100)) * 100) / 100;
      taxes.issRetained = rawForm.issRetained;
    } else {
      taxes.icms = Math.round((val * (Number(rawForm.icmsRate) / 100)) * 100) / 100;
      taxes.pis = Math.round((val * (Number(rawForm.pisRate) / 100)) * 100) / 100;
      taxes.cofins = Math.round((val * (Number(rawForm.cofinsRate) / 100)) * 100) / 100;
    }

    return {
      type: rawForm.type,
      number: 'RASCUNHO',
      origin: 'Emissão Manual',
      clientName: selectedClient?.name || 'Cliente de Teste',
      clientDocument: selectedClient?.document || '000.000.000-00',
      clientEmail: selectedClient?.email,
      clientAddress: selectedClient?.address,
      value: val,
      items: rawForm.items.map(item => ({
        description: item.description || 'Descrição do item',
        quantity: Number(item.quantity) || 1,
        value: Number(item.value) || 0,
        cnae: item.cnae,
        ncm: item.ncm,
        cfop: item.cfop
      })),
      taxes,
      observations: rawForm.observations,
      taxRegime: rawForm.taxRegime,
      natureOfOperation: rawForm.natureOfOperation,
      status: 'waiting' as const // Show draft state
    };
  }, [getValues, selectedClient, invoiceTotalValue, itemsList]);

  // Main Submit Handler (Step 5 -> Emit Invoice)
  const handleEmitInvoice = async () => {
    setIssuing(true);
    setRejectionError(null);
    try {
      const result = await invoiceService.emitInvoice({
        type: previewInvoiceData.type,
        clientId: selectedClientId,
        items: previewInvoiceData.items,
        taxes: previewInvoiceData.taxes,
        observations: previewInvoiceData.observations,
        taxRegime: previewInvoiceData.taxRegime,
        natureOfOperation: previewInvoiceData.natureOfOperation
      });
      setSuccessInvoice(result);
      toast.success('Nota fiscal emitida com sucesso!');
    } catch (err: any) {
      setRejectionError(err.message || 'Erro de comunicação na prefeitura.');
      toast.error('Não foi possível emitir a nota. Verifique a rejeição.');
    } finally {
      setIssuing(false);
    }
  };

  const handleCorrectError = () => {
    setRejectionError(null);
    setCurrentStep(4); // Go back to Tributação step to allow adjusting ISS rate
  };

  const nextStep = () => {
    if (currentStep === 1 && !selectedType) {
      toast.error('Selecione o tipo de nota.');
      return;
    }
    if (currentStep === 2 && !selectedClientId) {
      toast.error('Escolha um cliente ou cadastre um novo.');
      return;
    }
    if (currentStep === 3) {
      const hasEmptyItem = itemsList.some(item => !item.description || !item.value);
      if (hasEmptyItem) {
        toast.error('Preencha a descrição e o valor de todos os itens.');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Title */}
      <div className="border-b border-pixel-neutral-200 pb-5 mb-2">
        <h1 className="text-xl md:text-2xl font-black text-pixel-navy-900 font-title">
          Emitir Nova Nota Fiscal
        </h1>
        <p className="text-xs text-pixel-neutral-500">
          Crie NFS-e, NF-e ou NFC-e de forma manual no ambiente de homologação.
        </p>
      </div>

      {/* Success Output Screen */}
      {successInvoice ? (
        <div className="bg-white border border-pixel-neutral-200 rounded-premium p-6 md:p-10 shadow-premium flex flex-col gap-8 items-center max-w-3xl mx-auto w-full animate-fade-in">
          <div className="h-14 w-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle className="h-9 w-9 stroke-[2.5]" />
          </div>
          
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-lg font-black text-pixel-navy-900 font-title">
              Nota fiscal emitida com sucesso!
            </h2>
            <p className="text-xs text-pixel-neutral-500 leading-relaxed max-w-sm">
              O documento foi homologado pelo órgão regulador e os arquivos digitais já foram gerados.
            </p>
          </div>

          <div className="border border-pixel-neutral-200 rounded-premium p-5 w-full bg-neutral-bgSecondary/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-pixel-navy-900">Número da Nota: Nº {successInvoice.number}</span>
              <span className="text-[10px] text-pixel-neutral-500 uppercase font-bold">Tipo: {successInvoice.type}</span>
              <span className="text-pixel-neutral-500 font-mono">Chave: {successInvoice.accessKey}</span>
            </div>
            <span className="font-bold text-green-600 bg-green-50 border border-functional-success/30 px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
              Autorizada
            </span>
          </div>

          {/* Quick actions for success */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={() => toast.success('Download do PDF iniciado!')}
            >
              Baixar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={() => toast.success('Download do XML iniciado!')}
            >
              Baixar XML
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Mail className="h-4 w-4" />}
              onClick={() => toast.success(`E-mail reenviado para ${successInvoice.clientEmail || 'cliente'}`)}
            >
              Enviar por E-mail
            </Button>
          </div>

          <div className="border-t border-pixel-neutral-200 pt-6 w-full flex justify-between items-center text-xs">
            <Link to="/app/notas">
              <Button variant="ghost" size="sm" icon={<ExternalLink className="h-4 w-4" />}>
                Visualizar Notas
              </Button>
            </Link>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                reset();
                setSuccessInvoice(null);
                setCurrentStep(1);
              }}
              icon={<Plus className="h-4 w-4" />}
            >
              Emitir Nova Nota
            </Button>
          </div>
        </div>
      ) : rejectionError ? (
        /* Rejection/Error screen */
        <div className="bg-white border border-pixel-neutral-200 rounded-premium p-6 md:p-10 shadow-premium flex flex-col gap-6 items-center max-w-xl mx-auto w-full animate-fade-in">
          <div className="h-14 w-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="h-9 w-9" />
          </div>

          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-lg font-black text-pixel-navy-900 font-title">
              Não foi possível emitir a nota fiscal
            </h2>
            <p className="text-xs text-pixel-neutral-500 leading-relaxed">
              Ocorreu uma rejeição ao transmitir o lote para o servidor municipal/estadual.
            </p>
          </div>

          <div className="p-4 bg-red-600-bg/60 border border-functional-error/20 text-xs text-red-800 leading-relaxed rounded-premium font-medium w-full flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-bold">Motivo da Rejeição:</span>
              <p>{rejectionError}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end w-full border-t border-pixel-neutral-200 pt-5 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRejectionError(null);
                setCurrentStep(1);
              }}
            >
              Cancelar Emissão
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={handleCorrectError}
            >
              Corrigir campos indicados
            </Button>
          </div>
        </div>
      ) : (
        /* Main wizard step builder */
        <div className="flex flex-col gap-6">
          <Stepper steps={steps} currentStep={currentStep} className="mb-2" />

          {/* Steps Contents */}
          <div className="min-h-[300px]">
            
            {/* Step 1: Tipo de Nota */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-6 animate-fade-in text-center items-center py-4">
                <h3 className="text-base font-bold text-pixel-navy-900 font-title">Qual tipo de nota fiscal você deseja emitir?</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full mt-4">
                  {[
                    { id: 'NFS-e', title: 'NFS-e', desc: 'Nota Fiscal de Serviços Eletrônica', details: 'Faturamento de serviços para prefeituras.' },
                    { id: 'NF-e', title: 'NF-e', desc: 'Nota Fiscal de Produto Eletrônica', details: 'Faturamento de produtos físicos para a SEFAZ.' },
                    { id: 'NFC-e', title: 'NFC-e', desc: 'Nota Consumidor Eletrônica', details: 'Cupom fiscal emitido ao consumidor final no varejo.' }
                  ].map((item) => {
                    const active = selectedType === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setValue('type', item.id as any)}
                        className={`p-6 border rounded-premium text-left flex flex-col gap-3 transition-all duration-200 hover:shadow-premium
                          ${active 
                            ? 'border-pixel-navy-900 bg-pixel-navy-900-soft/10 ring-2 ring-brand-teal/20' 
                            : 'border-pixel-neutral-200 bg-white'}`}
                      >
                        <span className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0
                          ${active ? 'border-pixel-navy-900 bg-pixel-navy-900 text-white' : 'border-pixel-neutral-200 bg-white'}`}>
                          {active && <div className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-lg font-black text-pixel-navy-900 font-title">{item.title}</span>
                          <span className="text-xs font-semibold text-pixel-neutral-900 font-title">{item.desc}</span>
                          <span className="text-[10px] text-pixel-neutral-500 leading-normal mt-1">{item.details}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Cliente */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex justify-between items-center gap-4">
                  <h3 className="text-base font-bold text-pixel-navy-900 font-title">Identificar Cliente (Tomador de Serviço)</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => setShowNewClientModal(true)}
                  >
                    Cadastrar Cliente
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Select
                      {...register('clientId')}
                      label="Selecionar Cliente Existente"
                      options={[
                        { value: '', label: '-- Selecione um cliente cadastrado --' },
                        ...clients.map(c => ({ value: c.id, label: `${c.name} (${c.document})` }))
                      ]}
                    />
                  </div>
                </div>

                {/* Show brief summary of selected client */}
                {selectedClient && (
                  <div className="border border-pixel-neutral-200 rounded-premium p-5 bg-white shadow-sm flex flex-col md:flex-row justify-between gap-6 text-xs animate-fade-in">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-pixel-navy-900 text-sm font-title">{selectedClient.name}</span>
                      <span className="text-pixel-neutral-500 font-mono">Documento: {selectedClient.document}</span>
                      <span className="text-pixel-neutral-500">E-mail: {selectedClient.email}</span>
                      <span className="text-pixel-neutral-500">Telefone: {selectedClient.phone}</span>
                    </div>
                    <div className="flex flex-col gap-1 md:items-end">
                      <span className="text-[10px] font-bold text-pixel-navy-900 uppercase tracking-wider">Endereço</span>
                      <span className="text-pixel-neutral-500 text-right">
                        {selectedClient.address.street}, {selectedClient.address.number}<br />
                        {selectedClient.address.neighborhood} - {selectedClient.address.city} / {selectedClient.address.state}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Itens (Produtos/Serviços) */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex justify-between items-center gap-4">
                  <h3 className="text-base font-bold text-pixel-navy-900 font-title">
                    {selectedType === 'NFS-e' ? 'Serviços Faturados' : 'Produtos Vendidos'}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: '', quantity: 1, value: 0, cnae: '6201-5/01', ncm: '', cfop: '' })}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Adicionar Item
                  </Button>
                </div>

                <div className="flex flex-col gap-4">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="border border-pixel-neutral-200 rounded-premium p-5 bg-white shadow-sm flex flex-col gap-4 relative">
                      
                      {/* Delete button for additional items */}
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="absolute top-4 right-4 p-1 rounded-full text-pixel-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}

                      <span className="text-[10px] font-bold text-pixel-navy-900 uppercase tracking-wider font-title">
                        Item #{idx + 1}
                      </span>

                      {/* Autofill helpers drop-down */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedType === 'NFS-e' ? (
                          <div className="md:col-span-2">
                            <Select
                              label="Autopreencher com Serviço Pré-cadastrado"
                              options={[
                                { value: '', label: '-- Escolha um serviço do catálogo para preencher --' },
                                ...services.map(s => ({ value: s.id, label: `${s.name} (R$ ${s.defaultValue})` }))
                              ]}
                              onChange={(e) => handleSelectService(idx, e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="md:col-span-2">
                            <Select
                              label="Autopreencher com Produto Pré-cadastrado"
                              options={[
                                { value: '', label: '-- Escolha um produto do catálogo para preencher --' },
                                ...products.map(p => ({ value: p.id, label: `${p.name} (R$ ${p.value})` }))
                              ]}
                              onChange={(e) => handleSelectProduct(idx, e.target.value)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Manual inputs fields */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          {...register(`items.${idx}.description`)}
                          label="Descrição do item"
                          placeholder={selectedType === 'NFS-e' ? 'Ex: Desenvolvimento de API de Notas' : 'Ex: Planner Físico Executivo'}
                          className="md:col-span-2"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            {...register(`items.${idx}.quantity`)}
                            type="number"
                            min="1"
                            label="Qtd"
                          />
                          <Input
                            {...register(`items.${idx}.value`)}
                            type="number"
                            step="0.01"
                            label="Valor Unitário (R$)"
                          />
                        </div>
                        
                        {selectedType === 'NFS-e' ? (
                          <>
                            <Input {...register(`items.${idx}.cnae`)} label="CNAE do Serviço" placeholder="6201-5/01" />
                          </>
                        ) : (
                          <>
                            <Input {...register(`items.${idx}.ncm`)} label="NCM do Produto" placeholder="4820.10.00" />
                            <Input {...register(`items.${idx}.cfop`)} label="CFOP Padrão" placeholder="5.102" />
                          </>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

                {/* Show subtotal values */}
                <div className="flex justify-end p-4 border-t border-pixel-neutral-200 mt-2">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-pixel-neutral-500 uppercase tracking-wider block">Valor Subtotal da Nota</span>
                    <span className="text-xl font-black text-pixel-navy-900 font-title">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoiceTotalValue)}
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* Step 4: Tributação */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                
                {/* Simulated alert warning message */}
                {selectedClientId === 'cli-5' && (
                  <div className="bg-yellow-50 border border-functional-warning/20 text-xs text-yellow-800 p-4 rounded-premium flex gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <span className="font-bold block">Atenção Fiscal para Studio Criativo ME:</span>
                      Conforme recomendação do atendimento contábil (Helena), reduza o **ISS para 2%** para este cliente a fim de se enquadrar na isenção parcial municipal e evitar rejeição.
                    </div>
                  </div>
                )}

                <h3 className="text-base font-bold text-pixel-navy-900 font-title">Configurações Fiscais e Alíquotas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    {...register('natureOfOperation')}
                    label="Natureza da Operação"
                    options={[
                      { value: 'Prestação de serviços', label: 'Prestação de serviços' },
                      { value: 'Tributação no município', label: 'Tributação no município' },
                      { value: 'Exportação', label: 'Exportação' }
                    ]}
                  />
                  <Select
                    {...register('taxRegime')}
                    label="Regime Tributário"
                    options={[
                      { value: 'Simples Nacional', label: 'Simples Nacional' },
                      { value: 'Lucro Presumido', label: 'Lucro Presumido' },
                      { value: 'MEI', label: 'MEI' }
                    ]}
                  />
                </div>

                <div className="h-px bg-pixel-neutral-200 my-2"></div>

                {selectedType === 'NFS-e' ? (
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold text-pixel-navy-900 uppercase tracking-wider font-title">
                      Alíquotas de Serviços (%)
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <Input {...register('issRate')} type="number" step="0.1" label="ISS (%)" />
                      <Input {...register('irRate')} type="number" step="0.1" label="IRRF (%)" />
                      <Input {...register('csllRate')} type="number" step="0.1" label="CSLL (%)" />
                      <Input {...register('inssRate')} type="number" step="0.1" label="INSS (%)" />
                      <div className="flex items-center mt-6">
                        <Checkbox {...register('issRetained')} label="ISS Retido na fonte" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold text-pixel-navy-900 uppercase tracking-wider font-title">
                      Impostos sobre Mercadorias (%)
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Input {...register('icmsRate')} type="number" step="0.1" label="ICMS (%)" />
                      <Input {...register('pisRate')} type="number" step="0.1" label="PIS (%)" />
                      <Input {...register('cofinsRate')} type="number" step="0.1" label="COFINS (%)" />
                    </div>
                  </div>
                )}

                <div className="h-px bg-pixel-neutral-200 my-2"></div>

                <Textarea
                  {...register('observations')}
                  label="Informações Complementares / Observações da Nota"
                  placeholder="Ex: Empresa optante pelo Simples Nacional. Documento emitido para fins de faturamento..."
                />
              </div>
            )}

            {/* Step 5: Revisão */}
            {currentStep === 5 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <h3 className="text-base font-bold text-pixel-navy-900 font-title">Revisão do Documento Fiscal</h3>
                <p className="text-xs text-pixel-neutral-500 leading-relaxed">
                  Confira as informações estruturadas da sua nota fiscal abaixo antes de enviá-la para autorização.
                </p>
                
                {/* Render full InvoicePreview mock */}
                <InvoicePreview invoice={previewInvoiceData} />
              </div>
            )}

          </div>

          {/* Navigation controls */}
          <div className="flex justify-between items-center border-t border-pixel-neutral-200 pt-6 mt-6">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Voltar
              </Button>
            ) : <div />}

            {currentStep < 5 ? (
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
                onClick={handleEmitInvoice}
                loading={issuing}
                icon={<CheckCircle className="h-4 w-4" />}
              >
                Emitir Nota Fiscal
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Sub-modal Form to create client on the fly */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-pixel-neutral-200 rounded-premium shadow-premium p-6 md:p-8 flex flex-col gap-5">
            <h3 className="text-base font-bold text-pixel-navy-900 font-title">Cadastrar Novo Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                label="Nome completo / Razão Social"
                placeholder="Ex: Gabriel Ferreira"
                className="md:col-span-2"
              />
              <Input
                value={newClientDoc}
                onChange={e => setNewClientDoc(e.target.value)}
                label="CPF ou CNPJ"
                placeholder="000.000.000-00"
              />
              <Input
                value={newClientEmail}
                onChange={e => setNewClientEmail(e.target.value)}
                label="E-mail"
                placeholder="nome@email.com"
              />
              <Input
                value={newClientCEP}
                onChange={e => setNewClientCEP(e.target.value)}
                label="CEP"
                placeholder="52020-000"
              />
              <Input
                value={newClientAddress}
                onChange={e => setNewClientAddress(e.target.value)}
                label="Endereço"
                placeholder="Rua, número e bairro"
              />
            </div>
            
            <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-pixel-neutral-200 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewClientModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateClientOnTheFly}
              >
                Cadastrar e Selecionar
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default EmitirNota;
