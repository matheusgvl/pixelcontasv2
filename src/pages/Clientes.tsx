import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Search, PlusCircle, User, Mail, Phone, MapPin, 
  FileText, TrendingUp, Save, Trash2, Calendar
} from 'lucide-react';
import { cepService } from '../services/api';
import { realData } from '../services/realData';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable } from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../context/ToastContext';
import type { Client, Invoice } from '../types';

export const Clientes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();

  // Route modes: 'list' | 'create' | 'details'
  const mode = useMemo(() => {
    if (location.pathname.endsWith('/novo')) return 'create';
    if (id) return 'details';
    return 'list';
  }, [id, location.pathname]);

  // Load clients and invoices
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingCEP, setLoadingCEP] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [nextClients, nextInvoices] = await Promise.all([
          realData.clients(),
          realData.invoices(),
        ]);
        if (!mounted) return;
        setClients(nextClients);
        setInvoices(nextInvoices);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao carregar clientes.');
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [toast]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    tradingName: '',
    document: '',
    type: 'PJ' as 'PF' | 'PJ',
    stateRegistration: '',
    municipalRegistration: '',
    email: '',
    phone: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    notes: ''
  });

  // Load client details if mode is details
  const clientDetails = useMemo(() => {
    if (!id) return null;
    return clients.find(c => c.id === id) || null;
  }, [clients, id]);

  const clientInvoices = useMemo(() => {
    if (!clientDetails) return [];
    return invoices.filter(inv => inv.clientDocument === clientDetails.document);
  }, [clientDetails, invoices]);

  // CEP autofill trigger
  const handleCEPBlur = async () => {
    const cleanCep = formData.zipCode.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCEP(true);
    try {
      const address = await cepService.fetchAddress(cleanCep);
      if (address) {
        setFormData(prev => ({
          ...prev,
          street: address.street,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state
        }));
        toast.success('Endereço preenchido por CEP!');
      }
    } catch {
      toast.error('Erro ao buscar o CEP.');
    } finally {
      setLoadingCEP(false);
    }
  };

  // Submit Client create
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.document || !formData.email) {
      toast.error('Preencha os campos obrigatórios: Nome, Documento e E-mail.');
      return;
    }

    try {
      const newClient = await realData.createClient({
        name: formData.name,
        tradingName: formData.tradingName || undefined,
        document: formData.document,
        type: formData.type,
        stateRegistration: formData.stateRegistration || undefined,
        municipalRegistration: formData.municipalRegistration || undefined,
        email: formData.email,
        phone: formData.phone,
        address: {
          zipCode: formData.zipCode,
          street: formData.street,
          number: formData.number,
          complement: formData.complement || undefined,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state
        },
        notes: formData.notes || undefined,
        status: 'active'
      });
      setClients(prev => [newClient, ...prev]);
      toast.success('Cliente cadastrado com sucesso!');
      navigate('/app/clientes');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar cliente.');
    }
  };

  // Delete Client mock action
  const handleDeleteClient = async (idToDelete: string, name: string) => {
    const conf = window.confirm(`Deseja realmente arquivar o cliente ${name}?`);
    if (conf) {
      try {
        await realData.update('clients', idToDelete, { status: 'inactive' });
        setClients(prev => prev.map(c => c.id === idToDelete ? { ...c, status: 'inactive' as const } : c));
        toast.success(`Cliente ${name} arquivado com sucesso.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao arquivar cliente.');
      }
    }
  };

  // Filter clients list
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // List View columns definition
  const columns: Column<Client>[] = [
    {
      header: 'Nome / Razão Social',
      accessor: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-text-primary">{row.name}</span>
          {row.tradingName && <span className="text-[10px] text-text-secondary">{row.tradingName}</span>}
        </div>
      ),
      sortable: true,
      sortKey: 'name'
    },
    {
      header: 'Documento',
      accessor: 'document',
      sortable: true,
      sortKey: 'document',
      className: 'font-mono'
    },
    {
      header: 'Tipo',
      accessor: (row) => row.type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'
    },
    {
      header: 'E-mail',
      accessor: 'email'
    },
    {
      header: 'Cidade',
      accessor: (row) => `${row.address.city} - ${row.address.state}`
    },
    {
      header: 'Notas',
      accessor: 'totalInvoices',
      sortable: true,
      sortKey: 'totalInvoices',
      className: 'text-center'
    },
    {
      header: 'Faturamento',
      accessor: (row) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.totalSpent),
      sortable: true,
      sortKey: 'totalSpent',
      className: 'text-right font-bold text-text-primary'
    },
    {
      header: 'Situação',
      accessor: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Ações',
      accessor: (row) => (
        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
          <Link to={`/app/clientes/${row.id}`} title="Visualizar ficha">
            <Button variant="ghost" size="sm" className="!p-1 text-text-primary">Detalhes</Button>
          </Link>
          <button
            onClick={() => handleDeleteClient(row.id, row.name)}
            title="Arquivar cliente"
            className="p-1.5 text-text-secondary hover:text-red-600 rounded hover:bg-red-600-bg/60 transition-colors"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* 1. LIST MODE */}
      {mode === 'list' && (
        <>
          <PageHeader
            title="Clientes Cadastrados"
            description="Visualize e gerencie a base de tomadores e compradores do seu negócio."
            action={
              <Link to="/app/clientes/novo">
                <Button variant="primary" size="sm" icon={<PlusCircle className="h-4 w-4" />}>
                  Cadastrar Cliente
                </Button>
              </Link>
            }
          />

          <div className="flex items-center w-full sm:max-w-sm mb-2">
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, documento ou e-mail..."
              icon={<Search className="h-4.5 w-4.5" />}
            />
          </div>

          <DataTable
            data={filteredClients}
            columns={columns}
            onRowClick={(row) => navigate(`/app/clientes/${row.id}`)}
          />
        </>
      )}

      {/* 2. CREATE MODE */}
      {mode === 'create' && (
        <form onSubmit={handleSaveClient} className="flex flex-col gap-6">
          <PageHeader
            title="Cadastrar Novo Cliente"
            description="Adicione tomadores de serviço ou compradores no cadastro fiscal."
            breadcrumbs={[
              { label: 'Clientes', link: '/app/clientes' },
              { label: 'Novo Cliente' }
            ]}
            action={
              <div className="flex items-center gap-2">
                <Link to="/app/clientes">
                  <Button variant="outline" size="sm">Cancelar</Button>
                </Link>
                <Button type="submit" variant="primary" size="sm" icon={<Save className="h-4 w-4" />}>
                  Salvar Cliente
                </Button>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-2 border border-border rounded-premium p-6 bg-white shadow-premium flex flex-col gap-5">
              
              <div className="flex flex-col gap-1 border-b border-border pb-3">
                <h3 className="text-sm font-bold text-text-primary font-title uppercase tracking-wider text-[10px]">
                  Dados Gerais
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Tipo de Pessoa"
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  options={[
                    { value: 'PJ', label: 'Pessoa Jurídica (CNPJ)' },
                    { value: 'PF', label: 'Pessoa Física (CPF)' }
                  ]}
                />
                <Input
                  label={formData.type === 'PJ' ? 'Razão Social *' : 'Nome Completo *'}
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do cliente"
                  className="md:col-span-2"
                />
                <Input
                  label="Nome Fantasia (se houver)"
                  value={formData.tradingName}
                  onChange={e => setFormData(prev => ({ ...prev, tradingName: e.target.value }))}
                  placeholder="Nome comercial"
                />
                <Input
                  label={formData.type === 'PJ' ? 'CNPJ *' : 'CPF *'}
                  value={formData.document}
                  onChange={e => setFormData(prev => ({ ...prev, document: e.target.value }))}
                  placeholder="Numeração limpa ou formatada"
                />
                <Input
                  label="Inscrição Estadual (se houver)"
                  value={formData.stateRegistration}
                  onChange={e => setFormData(prev => ({ ...prev, stateRegistration: e.target.value }))}
                  placeholder="Inscrição estadual"
                />
                <Input
                  label="Inscrição Municipal"
                  value={formData.municipalRegistration}
                  onChange={e => setFormData(prev => ({ ...prev, municipalRegistration: e.target.value }))}
                  placeholder="Inscrição municipal"
                />
                <Input
                  label="E-mail principal *"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@cliente.com"
                />
                <Input
                  label="Telefone de contato"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="flex flex-col gap-1 border-b border-border pb-3 mt-4">
                <h3 className="text-sm font-bold text-text-primary font-title uppercase tracking-wider text-[10px]">
                  Endereço do Tomador
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="CEP"
                  value={formData.zipCode}
                  onChange={e => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  onBlur={handleCEPBlur}
                  placeholder="Digite 8 dígitos"
                  suffix={loadingCEP && (
                    <svg className="animate-spin h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                />
                <Input
                  label="Endereço"
                  value={formData.street}
                  onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Avenida, rua, etc."
                  className="md:col-span-2"
                />
                <Input
                  label="Número"
                  value={formData.number}
                  onChange={e => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="Nº"
                />
                <Input
                  label="Complemento"
                  value={formData.complement}
                  onChange={e => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                  placeholder="Apto, sala, bloco..."
                />
                <Input
                  label="Bairro"
                  value={formData.neighborhood}
                  onChange={e => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  placeholder="Bairro"
                />
                <Input
                  label="Cidade"
                  value={formData.city}
                  onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Cidade"
                  className="md:col-span-2"
                />
                <Input
                  label="Estado"
                  value={formData.state}
                  onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="UF"
                />
              </div>

            </div>

            {/* Notes Column */}
            <div className="border border-border rounded-premium p-6 bg-white shadow-premium flex flex-col gap-4">
              <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border">
                Observações Adicionais
              </h3>
              <Textarea
                label="Anotações internas"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Insira notas internas como horário de atendimento fiscal do cliente ou detalhes de faturamento específicos."
                rows={5}
              />
            </div>

          </div>
        </form>
      )}

      {/* 3. DETAILS MODE */}
      {mode === 'details' && clientDetails && (
        <div className="flex flex-col gap-6">
          <PageHeader
            title={clientDetails.name}
            description={`Cadastro e histórico fiscal de ${clientDetails.name}.`}
            breadcrumbs={[
              { label: 'Clientes', link: '/app/clientes' },
              { label: clientDetails.name }
            ]}
            action={
              <Link to="/app/clientes">
                <Button variant="outline" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
                  Voltar
                </Button>
              </Link>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Client Info Briefing Card */}
            <div className="border border-border rounded-premium bg-white p-6 shadow-premium flex flex-col gap-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px]">
                  Ficha Cadastral
                </span>
                <StatusBadge status={clientDetails.status} />
              </div>

              <div className="flex flex-col gap-3.5 text-text-secondary">
                <div className="flex gap-2.5">
                  <User className="h-4.5 w-4.5 text-text-primary shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-text-primary">Documento Fiscal</span>
                    <span className="font-mono">{clientDetails.document}</span>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Mail className="h-4.5 w-4.5 text-text-primary shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-text-primary">E-mail</span>
                    <span>{clientDetails.email}</span>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Phone className="h-4.5 w-4.5 text-text-primary shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-text-primary">Telefone</span>
                    <span>{clientDetails.phone}</span>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-text-primary shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-text-primary">Endereço Completo</span>
                    <span>
                      {clientDetails.address.street}, {clientDetails.address.number} {clientDetails.address.complement ? `- ${clientDetails.address.complement}` : ''}<br />
                      {clientDetails.address.neighborhood} - {clientDetails.address.city} / {clientDetails.address.state} (CEP: {clientDetails.address.zipCode})
                    </span>
                  </div>
                </div>
              </div>

              {clientDetails.notes && (
                <div className="bg-surface p-3.5 rounded-soft border border-border flex flex-col gap-1.5 mt-2">
                  <span className="font-bold text-text-primary font-title uppercase tracking-wider text-[9px]">Anotações internas</span>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{clientDetails.notes}</p>
                </div>
              )}
            </div>

            {/* Financial indicators & Invoice List Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Metric Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-border rounded-premium shadow-premium flex flex-col gap-2">
                  <div className="flex justify-between items-center text-text-secondary">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-title">Total Faturado</span>
                    <TrendingUp className="h-4.5 w-4.5 text-text-primary" />
                  </div>
                  <span className="text-xl font-black text-text-primary font-title">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(clientDetails.totalSpent)}
                  </span>
                </div>

                <div className="p-5 bg-white border border-border rounded-premium shadow-premium flex flex-col gap-2">
                  <div className="flex justify-between items-center text-text-secondary">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-title">Notas Fiscais Emitidas</span>
                    <FileText className="h-4.5 w-4.5 text-text-primary" />
                  </div>
                  <span className="text-xl font-black text-text-primary font-title">
                    {clientDetails.totalInvoices} nota(s)
                  </span>
                </div>
              </div>

              {/* Invoices list */}
              <div className="border border-border rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4">
                <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-text-primary" />
                  <span>Histórico de Notas Fiscais do Cliente</span>
                </h3>

                <div className="w-full overflow-x-auto rounded-soft border border-border">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface border-b border-border text-text-primary font-bold">
                        <th className="p-3.5">Número</th>
                        <th className="p-3.5">Tipo</th>
                        <th className="p-3.5">Emissão</th>
                        <th className="p-3.5 text-right">Valor</th>
                        <th className="p-3.5">Origem</th>
                        <th className="p-3.5">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pixel-neutral-200">
                      {clientInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-text-secondary text-xs">
                            Nenhuma nota faturada para este cliente ainda.
                          </td>
                        </tr>
                      ) : (
                        clientInvoices.map((inv) => (
                          <tr 
                            key={inv.id} 
                            onClick={() => navigate(`/app/notas/${inv.id}`)}
                            className="hover:bg-black-soft/30 transition-colors duration-150 cursor-pointer animate-fade-in"
                          >
                            <td className="p-3.5 font-mono text-text-primary font-semibold">{inv.number}</td>
                            <td className="p-3.5 text-text-secondary">{inv.type}</td>
                            <td className="p-3.5 text-text-secondary">
                              {new Date(inv.issueDate).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3.5 text-right font-bold text-text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.value)}
                            </td>
                            <td className="p-3.5">
                              <span className="bg-surface text-text-primary font-semibold px-2 py-0.5 rounded text-[10px]">
                                {inv.origin}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <StatusBadge status={inv.status} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default Clientes;
