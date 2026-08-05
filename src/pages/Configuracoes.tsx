import React, { useEffect, useState } from 'react';
import { 
  Building2, FileCheck, KeyRound, Users, 
  ShieldCheck, Save, Plus, Trash2, AlertCircle
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { UploadArea } from '../components/shared/UploadArea';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/supabaseApi';
import { mapCompany, mapTaxSettings, realData, toCompanyPayload, toTaxSettingsPayload } from '../services/realData';
import type { CompanySettings, TaxSettings, TeamMemberSettings } from '../services/realData';

export const Configuracoes: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('empresa');

  const [activeCompany, setActiveCompany] = useState<CompanySettings | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [activeTaxSettings, setActiveTaxSettings] = useState<TaxSettings | null>(null);
  const [loadingFiscal, setLoadingFiscal] = useState(true);
  const [savingFiscal, setSavingFiscal] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    razaoSocial: '',
    tradingName: '',
    cnpj: '',
    inscEstadual: '',
    inscMunicipal: '',
    regimeTributario: 'Simples Nacional',
    cnae: '',
    email: '',
    phone: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // Fiscal setting state
  const [fiscalForm, setFiscalForm] = useState({
    tipoNota: 'NFS-e',
    municipioEmissao: '',
    serieNota: '1',
    numeroInicial: '1',
    naturezaOperacao: 'Prestacao de servicos',
    ambiente: 'Homologacao'
  });

  // Digital cert file states
  const [certUploaded, setCertUploaded] = useState(false);
  const [certPassword, setCertPassword] = useState('');
  const [certFilePath, setCertFilePath] = useState('');
  const [certFileName, setCertFileName] = useState('');
  const [uploadingCert, setUploadingCert] = useState(false);
  const [savingCert, setSavingCert] = useState(false);

  // Team users state
  const [team, setTeam] = useState<TeamMemberSettings[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // Modal invite states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMemberSettings['role']>('Operador');

  useEffect(() => {
    let mounted = true;
    realData.activeCompany()
      .then((company) => {
        if (!mounted) return;
        setActiveCompany(company);
        setCompanyForm({
          razaoSocial: company.legalName,
          tradingName: company.tradingName,
          cnpj: company.cnpj,
          inscEstadual: company.stateRegistration,
          inscMunicipal: company.municipalRegistration,
          regimeTributario: company.taxRegime,
          cnae: company.cnaePrimary,
          email: company.email,
          phone: company.phone,
          zipCode: company.address.zipCode,
          street: company.address.street,
          number: company.address.number,
          complement: company.address.complement || '',
          neighborhood: company.address.neighborhood,
          city: company.address.city,
          state: company.address.state,
        });
        setCertUploaded(company.certificateStatus === 'valid');
        setCertFilePath(String(company.settings?.certificateFilePath || ''));
        setCertFileName(String(company.settings?.certificateFileName || ''));
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Erro ao carregar dados da empresa.');
      })
      .finally(() => {
        if (mounted) setLoadingCompany(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || savingCompany) return;

    setSavingCompany(true);
    try {
      const payload = toCompanyPayload({
        legalName: companyForm.razaoSocial,
        tradingName: companyForm.tradingName,
        cnpj: companyForm.cnpj,
        stateRegistration: companyForm.inscEstadual,
        municipalRegistration: companyForm.inscMunicipal,
        taxRegime: companyForm.regimeTributario,
        cnaePrimary: companyForm.cnae,
        email: companyForm.email,
        phone: companyForm.phone,
        address: {
          zipCode: companyForm.zipCode,
          street: companyForm.street,
          number: companyForm.number,
          complement: companyForm.complement,
          neighborhood: companyForm.neighborhood,
          city: companyForm.city,
          state: companyForm.state,
        },
      });
      const updated = await realData.update('companies', activeCompany.id, payload);
      setActiveCompany(mapCompany(updated));
      toast.success('Dados da empresa salvos com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar dados da empresa.');
    } finally {
      setSavingCompany(false);
    }
  };
  useEffect(() => {
    let mounted = true;
    realData.activeTaxSettings()
      .then((settings) => {
        if (!mounted) return;
        setActiveTaxSettings(settings);
        setFiscalForm({
          tipoNota: settings.invoiceType,
          municipioEmissao: settings.serviceCity,
          serieNota: settings.series,
          numeroInicial: settings.initialNumber,
          naturezaOperacao: settings.natureOfOperation,
          ambiente: settings.environment,
        });
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Erro ao carregar dados fiscais.');
      })
      .finally(() => {
        if (mounted) setLoadingFiscal(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  const handleSaveFiscal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaxSettings || savingFiscal) return;

    setSavingFiscal(true);
    try {
      const payload = toTaxSettingsPayload({
        name: activeTaxSettings.name,
        invoiceType: fiscalForm.tipoNota as TaxSettings['invoiceType'],
        taxRegime: activeCompany?.taxRegime || activeTaxSettings.taxRegime,
        natureOfOperation: fiscalForm.naturezaOperacao,
        serviceCity: fiscalForm.municipioEmissao,
        series: fiscalForm.serieNota,
        initialNumber: fiscalForm.numeroInicial,
        environment: fiscalForm.ambiente,
        status: activeTaxSettings.status,
      });
      const updated = await realData.update('tax_settings', activeTaxSettings.id, payload);
      setActiveTaxSettings(mapTaxSettings(updated));
      toast.success('Configuracoes fiscais atualizadas!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar dados fiscais.');
    } finally {
      setSavingFiscal(false);
    }
  };

  const handleUploadCert = async (file: File) => {
    if (!activeCompany || uploadingCert) return;

    setUploadingCert(true);
    try {
      const upload = await storageService.createUploadUrl({
        bucket: 'company-certificates',
        fileName: file.name,
        recordId: activeCompany.id,
      });
      await storageService.uploadWithSignedUrl({
        bucket: upload.bucket,
        path: upload.path,
        token: upload.token,
        file,
      });
      setCertFilePath(upload.path);
      setCertFileName(file.name);
      setCertUploaded(true);
      toast.success('Certificado enviado com sucesso. Salve para ativar na empresa.');
    } catch (error) {
      setCertUploaded(false);
      setCertFilePath('');
      setCertFileName('');
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar certificado digital.');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || savingCert) return;
    if (!certUploaded || !certFilePath) {
      toast.error('Envie um certificado digital antes de salvar.');
      return;
    }

    setSavingCert(true);
    try {
      const updated = await realData.update('companies', activeCompany.id, {
        certificate_status: 'valid',
        settings: {
          ...activeCompany.settings,
          certificateFilePath: certFilePath,
          certificateFileName: certFileName,
          certificateUploadedAt: new Date().toISOString(),
        },
      });
      setActiveCompany(mapCompany(updated));
      setCertPassword('');
      toast.success('Certificado digital A1 atualizado com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar certificado digital.');
    } finally {
      setSavingCert(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    realData.teamMembers()
      .then((members) => {
        if (mounted) setTeam(members);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Erro ao carregar usuarios da empresa.');
      })
      .finally(() => {
        if (mounted) setLoadingTeam(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  // Invite user member action
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('Operador');
    toast.info('Convite real de usuarios sera conectado no proximo passo.');
  };

  const handleArchiveMember = (id: string, name: string) => {
    void id;
    void name;
    toast.info('Desativacao real de usuarios sera conectada no proximo passo.');
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Configurações do Sistema"
        description="Gerencie as informações cadastrais da sua empresa, parâmetros fiscais, certificado A1 e controle de acessos da equipe."
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'empresa', label: 'Dados da Empresa', icon: <Building2 className="h-4 w-4" /> },
          { id: 'fiscais', label: 'Dados Fiscais', icon: <FileCheck className="h-4 w-4" /> },
          { id: 'certificado', label: 'Certificado Digital', icon: <KeyRound className="h-4 w-4" /> },
          { id: 'usuarios', label: 'Usuários e Permissões', icon: <Users className="h-4 w-4" /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-2 min-h-[350px]">
        
        {/* 1. DADOS DA EMPRESA */}
        {activeTab === 'empresa' && (
          <form onSubmit={handleSaveCompany} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            
            {/* Form Fields Card */}
            <div className="lg:col-span-2 border border-border rounded-premium p-6 bg-white shadow-premium flex flex-col gap-5">
              <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border">
                Cadastro da Empresa
              </h3>

              {loadingCompany && (
                <div className="text-xs font-semibold text-text-secondary bg-surface border border-border rounded-soft p-3">
                  Carregando dados da empresa...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="CNPJ"
                  value={companyForm.cnpj}
                  onChange={e => setCompanyForm(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />
                <Input
                  label="Razão Social"
                  value={companyForm.razaoSocial}
                  onChange={e => setCompanyForm(prev => ({ ...prev, razaoSocial: e.target.value }))}
                  placeholder="Razão social"
                  className="md:col-span-2"
                />
                <Input
                  label="Nome Fantasia"
                  value={companyForm.tradingName}
                  onChange={e => setCompanyForm(prev => ({ ...prev, tradingName: e.target.value }))}
                  placeholder="Nome comercial"
                />
                <Input
                  label="Inscrição Estadual"
                  value={companyForm.inscEstadual}
                  onChange={e => setCompanyForm(prev => ({ ...prev, inscEstadual: e.target.value }))}
                  placeholder="Inscrição estadual"
                />
                <Input
                  label="Inscrição Municipal"
                  value={companyForm.inscMunicipal}
                  onChange={e => setCompanyForm(prev => ({ ...prev, inscMunicipal: e.target.value }))}
                  placeholder="Inscrição municipal"
                />
                <Select
                  label="Regime Tributário"
                  value={companyForm.regimeTributario}
                  onChange={e => setCompanyForm(prev => ({ ...prev, regimeTributario: e.target.value }))}
                  options={[
                    { value: 'Simples Nacional', label: 'Simples Nacional' },
                    { value: 'Lucro Presumido', label: 'Lucro Presumido' },
                    { value: 'MEI', label: 'MEI' }
                  ]}
                />
                <Input
                  label="CNAE Principal"
                  value={companyForm.cnae}
                  onChange={e => setCompanyForm(prev => ({ ...prev, cnae: e.target.value }))}
                  placeholder="6201-5/01"
                  className="md:col-span-2"
                />
                <Input
                  label="E-mail fiscal"
                  type="email"
                  value={companyForm.email}
                  onChange={e => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  label="Telefone"
                  value={companyForm.phone}
                  onChange={e => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border mt-4">
                Endereço da Sede
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="CEP"
                  value={companyForm.zipCode}
                  onChange={e => setCompanyForm(prev => ({ ...prev, zipCode: e.target.value }))}
                />
                <Input
                  label="Endereço"
                  value={companyForm.street}
                  onChange={e => setCompanyForm(prev => ({ ...prev, street: e.target.value }))}
                  className="md:col-span-2"
                />
                <Input
                  label="Número"
                  value={companyForm.number}
                  onChange={e => setCompanyForm(prev => ({ ...prev, number: e.target.value }))}
                />
                <Input
                  label="Complemento"
                  value={companyForm.complement}
                  onChange={e => setCompanyForm(prev => ({ ...prev, complement: e.target.value }))}
                />
                <Input
                  label="Bairro"
                  value={companyForm.neighborhood}
                  onChange={e => setCompanyForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                />
                <Input
                  label="Cidade"
                  value={companyForm.city}
                  onChange={e => setCompanyForm(prev => ({ ...prev, city: e.target.value }))}
                  className="md:col-span-2"
                />
                <Input
                  label="Estado"
                  value={companyForm.state}
                  onChange={e => setCompanyForm(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Save className="h-4 w-4" />}
                  loading={savingCompany}
                  disabled={loadingCompany || !activeCompany}
                >
                  Salvar Alteracoes
                </Button>
              </div>
            </div>

            {/* Sidebar help Card */}
            <div className="border border-border rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4 text-xs text-text-secondary leading-relaxed">
              <h3 className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border">
                Dados cadastrais e Fisco
              </h3>
              <p>
                Os dados desta tela são utilizados para preencher as seções de "Emitente" nas notas fiscais eletrônicas geradas. Lembre-se de manter o endereço fiscal sempre de acordo com o cadastrado na prefeitura ou no CNPJ Receita Federal.
              </p>
            </div>

          </form>
        )}

        {/* 2. DADOS FISCAIS */}
        {activeTab === 'fiscais' && (
          <form onSubmit={handleSaveFiscal} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            <div className="lg:col-span-2 border border-border rounded-premium p-6 bg-white shadow-premium flex flex-col gap-5">
              <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border">
                Parâmetros Fiscais da Emissão
                            </h3>

              {loadingFiscal && (
                <div className="text-xs font-semibold text-text-secondary bg-surface border border-border rounded-soft p-3">
                  Carregando dados fiscais...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Tipo de Nota Fiscal Principal"
                  value={fiscalForm.tipoNota}
                  onChange={e => setFiscalForm(prev => ({ ...prev, tipoNota: e.target.value }))}
                  options={[
                    { value: 'NFS-e', label: 'NFS-e (Serviços)' },
                    { value: 'NF-e', label: 'NF-e (Produtos)' },
                    { value: 'NFC-e', label: 'NFC-e (Consumidor)' }
                  ]}
                />
                <Input
                  label="Município de Emissão"
                  value={fiscalForm.municipioEmissao}
                  onChange={e => setFiscalForm(prev => ({ ...prev, municipioEmissao: e.target.value }))}
                />
                <Input
                  label="Série Fiscal"
                  value={fiscalForm.serieNota}
                  onChange={e => setFiscalForm(prev => ({ ...prev, serieNota: e.target.value }))}
                />
                <Input
                  label="Número Inicial da Emissão"
                  value={fiscalForm.numeroInicial}
                  onChange={e => setFiscalForm(prev => ({ ...prev, numeroInicial: e.target.value }))}
                  helperText="Próxima nota gerada utilizará este número."
                />
                <Select
                  label="Natureza da Operação"
                  value={fiscalForm.naturezaOperacao}
                  onChange={e => setFiscalForm(prev => ({ ...prev, naturezaOperacao: e.target.value }))}
                  options={[
                    { value: 'Prestacao de servicos', label: 'Prestacao de servicos' },
                    { value: 'Tributacao no municipio', label: 'Tributacao no municipio' },
                    { value: 'Exportacao', label: 'Exportacao' }
                  ]}
                />
                <Select
                  label="Ambiente Fiscal"
                  value={fiscalForm.ambiente}
                  onChange={e => setFiscalForm(prev => ({ ...prev, ambiente: e.target.value }))}
                  options={[
                    { value: 'Homologacao', label: 'Homologacao (Sem valor fiscal)' },
                    { value: 'Producao', label: 'Producao (Valido juridicamente)' }
                  ]}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Save className="h-4 w-4" />}
                  loading={savingFiscal}
                  disabled={loadingFiscal || !activeTaxSettings}
                >
                  Atualizar Dados Fiscais
                </Button>
              </div>
            </div>

            {/* Sidebar warning */}
            <div className="bg-yellow-50 border border-functional-warning/20 rounded-premium p-5 shadow-premium flex gap-3 text-xs leading-relaxed text-yellow-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <span className="font-bold block">Atenção em Produção:</span>
                Mudar o ambiente fiscal de Homologação para Produção exige que o certificado digital A1 esteja ativo e validado.
              </div>
            </div>
          </form>
        )}

        {/* 3. CERTIFICADO DIGITAL */}
        {activeTab === 'certificado' && (
          <form onSubmit={handleSaveCert} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            <div className="lg:col-span-2 border border-border rounded-premium p-6 bg-white shadow-premium flex flex-col gap-5">
              <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-text-primary" />
                <span>Upload de Certificado A1</span>
              </h3>

              <UploadArea
                onFileSelect={handleUploadCert}
                accept=".pfx,.p12"
                maxSizeMB={20}
                label="Arraste seu novo arquivo de certificado digital A1 (.pfx ou .p12) aqui"
              />

              {uploadingCert && (
                <div className="text-xs font-semibold text-text-secondary bg-surface border border-border rounded-soft p-3">
                  Enviando certificado para o armazenamento seguro...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Senha do arquivo"
                  type="password"
                  value={certPassword}
                  onChange={e => setCertPassword(e.target.value)}
                  disabled={!certUploaded || uploadingCert}
                />
              </div>

              {certUploaded && (
                <div className="bg-green-50 border border-functional-success/20 text-xs text-green-800 p-4 rounded-soft flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-bold block">Certificado Digital Ativo:</span>
                    {certFileName || 'Certificado enviado'} armazenado para {activeCompany?.tradingName || activeCompany?.legalName || 'empresa ativa'}.
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Save className="h-4 w-4" />}
                  loading={savingCert}
                  disabled={!activeCompany || !certUploaded || uploadingCert}
                  >
                  Atualizar Certificado
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* 4. USUARIOS E PERMISSOES */}
        {activeTab === 'usuarios' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-center gap-4">
              <h3 className="text-sm font-bold text-text-primary font-title uppercase tracking-wider text-[10px]">
                Membros da Equipe com Acesso
              </h3>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowInviteModal(true)}
              >
                Convidar Usuário
              </Button>
            </div>

            {/* Members table */}
            <div className="w-full overflow-x-auto border border-border rounded-premium bg-white shadow-premium">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-border text-text-primary font-bold">
                    <th className="p-4">Nome completo</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Função / Papel</th>
                    <th className="p-4">Situação</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pixel-neutral-200 text-text-primary">
                  {loadingTeam && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-text-secondary font-semibold">
                        Carregando usuarios da empresa...
                      </td>
                    </tr>
                  )}
                  {!loadingTeam && team.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-text-secondary font-semibold">
                        Nenhum usuario encontrado para a empresa ativa.
                      </td>
                    </tr>
                  )}
                  {team.map((member) => (
                    <tr key={member.id} className="hover:bg-neutral-bgSecondary/20">
                      <td className="p-4 font-bold text-text-primary flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-brand-lightBlue/30 text-text-primary flex items-center justify-center font-bold text-[11px] uppercase">
                          {member.name.charAt(0)}
                        </div>
                        <span>{member.name}</span>
                      </td>
                      <td className="p-4 text-text-secondary">{member.email}</td>
                      <td className="p-4">
                        <span className="font-semibold">{member.role}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={member.status} />
                      </td>
                      <td className="p-4 text-right">
                        {member.id !== '1' && member.status === 'active' && (
                          <button
                            onClick={() => handleArchiveMember(member.id, member.name)}
                            className="text-text-secondary hover:text-red-600 hover:bg-red-600-bg/60 p-1.5 rounded transition-all"
                            title="Desativar acesso"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Invite Member modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleInviteMember} className="relative w-full max-w-md bg-white border border-border rounded-premium shadow-premium p-6 md:p-8 flex flex-col gap-5">
            <h3 className="text-base font-bold text-text-primary font-title">Convidar Membro da Equipe</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Nome completo *"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                placeholder="Ex: Pedro Santos"
              />
              <Input
                label="E-mail de acesso *"
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="nome@empresa.com"
              />
              <Select
                label="Funcao no sistema (Papel)"
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as TeamMemberSettings['role'])}
                options={[
                  { value: 'Administrador', label: 'Administrador (Acesso Total)' },
                  { value: 'Contador', label: 'Contador (Acesso Contabil e Guias)' },
                  { value: 'Operador', label: 'Operador (Emissao manual)' }
                ]}
              />
            </div>

            <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-border text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInviteModal(false)}
                type="button"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                icon={<Plus className="h-4 w-4" />}
              >
                Enviar Convite
              </Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
export default Configuracoes;










