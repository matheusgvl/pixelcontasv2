import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Download, Mail, Eye, Ban, Search, 
  Filter, FileSpreadsheet, PlusCircle
} from 'lucide-react';
import { db } from '../mocks/db';
import { invoiceService } from '../services/api';
import { DataTable } from '../components/shared/DataTable';
import type { Column } from '../components/shared/DataTable';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import type { Invoice } from '../types';

export const GestaoNotas: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [invoices, setInvoices] = useState<Invoice[]>(() => db.invoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrigin, setFilterOrigin] = useState('all');
  
  // Dialogs
  const [cancelingInvoiceId, setCancelingInvoiceId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  // Active filters list
  const filteredData = useMemo(() => {
    return invoices.filter(inv => {
      // Search search term
      const matchesSearch = 
        inv.number.includes(searchTerm) ||
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.clientDocument.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''));
      
      // Filter Type
      const matchesType = filterType === 'all' || inv.type === filterType;
      
      // Filter Status
      const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;

      // Filter Origin
      const matchesOrigin = filterOrigin === 'all' || inv.origin === filterOrigin;

      return matchesSearch && matchesType && matchesStatus && matchesOrigin;
    });
  }, [invoices, searchTerm, filterType, filterStatus, filterOrigin]);

  // Handle Cancel Invoice
  const handleOpenCancelDialog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCancelingInvoiceId(id);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelingInvoiceId) return;
    if (!cancelReason) {
      toast.error('Justificativa de cancelamento é obrigatória.');
      return;
    }
    
    setIsCancelLoading(true);
    try {
      const updated = await invoiceService.cancelInvoice(cancelingInvoiceId, cancelReason);
      setInvoices(prev => prev.map(inv => inv.id === cancelingInvoiceId ? updated : inv));
      toast.success(`Nota fiscal nº ${updated.number} cancelada com sucesso!`);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cancelar nota.');
    } finally {
      setIsCancelLoading(false);
      setCancelingInvoiceId(null);
    }
  };

  const handleResendEmail = (email: string | undefined, number: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Arquivos da NF-e nº ${number} enviados para o e-mail: ${email || 'do cliente'}.`);
  };

  const handleDownloadFile = (type: 'PDF' | 'XML', number: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Download do arquivo ${type} da NF-e nº ${number} iniciado.`);
  };

  // Bulk Actions
  const handleBulkDownload = (type: 'PDF' | 'XML', selected: Invoice[]) => {
    toast.success(`Download em lote de ${selected.length} arquivos ${type} iniciado.`);
  };

  const handleBulkResend = (selected: Invoice[]) => {
    toast.success(`Envio automático em lote de e-mails para ${selected.length} notas finalizado.`);
  };

  const handleBulkExport = (selected: Invoice[]) => {
    toast.success(`Relatório em Excel exportado com sucesso para ${selected.length} notas.`);
  };

  // Define Columns
  const columns: Column<Invoice>[] = [
    {
      header: 'Número',
      accessor: 'number',
      sortable: true,
      sortKey: 'number',
      className: 'font-mono font-semibold text-text-primary'
    },
    {
      header: 'Cliente',
      accessor: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-text-primary">{row.clientName}</span>
          <span className="text-[10px] text-text-secondary">{row.clientDocument}</span>
        </div>
      )
    },
    {
      header: 'Tipo',
      accessor: 'type',
      sortable: true,
      sortKey: 'type'
    },
    {
      header: 'Emissão',
      accessor: (row) => new Date(row.issueDate).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sortable: true,
      sortKey: 'issueDate'
    },
    {
      header: 'Valor',
      accessor: (row) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.value),
      sortable: true,
      sortKey: 'value',
      className: 'text-right font-bold text-text-primary'
    },
    {
      header: 'Origem',
      accessor: (row) => (
        <span className="bg-surface text-text-primary font-semibold px-2 py-0.5 rounded text-[10px]">
          {row.origin}
        </span>
      )
    },
    {
      header: 'Situação',
      accessor: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Ações',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
          <Link to={`/app/notas/${row.id}`} title="Visualizar detalhes">
            <Button variant="ghost" size="sm" className="!p-1.5 text-text-primary">
              <Eye className="h-4.5 w-4.5" />
            </Button>
          </Link>
          <button 
            onClick={(e) => handleDownloadFile('PDF', row.number, e)} 
            title="Baixar PDF"
            className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-neutral-bgSecondary/60 transition-colors"
          >
            <Download className="h-4.5 w-4.5" />
          </button>
          <button 
            onClick={(e) => handleResendEmail(row.clientEmail, row.number, e)} 
            title="Reenviar por e-mail"
            className="p-1.5 text-text-secondary hover:text-text-primary rounded hover:bg-neutral-bgSecondary/60 transition-colors"
          >
            <Mail className="h-4.5 w-4.5" />
          </button>
          {row.status === 'authorized' && (
            <button 
              onClick={(e) => handleOpenCancelDialog(row.id, e)} 
              title="Cancelar nota"
              className="p-1.5 text-text-secondary hover:text-red-600 rounded hover:bg-red-600-bg/60 transition-colors"
            >
              <Ban className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Notas Fiscais Emitidas"
        description="Gestão, monitoramento, download e cancelamento de NFS-e, NF-e e NFC-e."
        action={
          <Link to="/app/emitir-nota">
            <Button variant="primary" size="sm" icon={<PlusCircle className="h-4 w-4" />}>
              Emitir Nota Manual
            </Button>
          </Link>
        }
      />

      {/* Advanced Filters */}
      <div className="border border-border rounded-premium p-5 bg-white shadow-premium flex flex-col gap-4">
        <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-2 border-b border-border">
          <Filter className="h-4 w-4 text-text-primary" />
          <span>Filtros Avançados</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            label="Buscar por cliente, documento ou número"
            placeholder="Ex: Mariana, 00002041..."
            icon={<Search className="h-4 w-4 text-text-secondary" />}
          />
          <Select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            label="Tipo de Nota"
            options={[
              { value: 'all', label: 'Todos os tipos' },
              { value: 'NFS-e', label: 'NFS-e' },
              { value: 'NF-e', label: 'NF-e' },
              { value: 'NFC-e', label: 'NFC-e' }
            ]}
          />
          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            label="Situação da Nota"
            options={[
              { value: 'all', label: 'Todas as situações' },
              { value: 'authorized', label: 'Autorizada' },
              { value: 'processing', label: 'Processando' },
              { value: 'waiting', label: 'Aguardando' },
              { value: 'rejected', label: 'Rejeitada' },
              { value: 'canceled', label: 'Cancelada' }
            ]}
          />
          <Select
            value={filterOrigin}
            onChange={e => setFilterOrigin(e.target.value)}
            label="Canal / Integração"
            options={[
              { value: 'all', label: 'Todos os canais' },
              { value: 'Hotmart', label: 'Hotmart' },
              { value: 'Kiwify', label: 'Kiwify' },
              { value: 'Shopify', label: 'Shopify' },
              { value: 'Asaas', label: 'Asaas' },
              { value: 'Emissão Manual', label: 'Emissão Manual' }
            ]}
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={filteredData}
        columns={columns}
        onRowClick={(row) => navigate(`/app/notas/${row.id}`)}
        bulkActions={[
          { label: 'Baixar XMLs', icon: <Download className="h-3.5 w-3.5" />, action: (sel) => handleBulkDownload('XML', sel) },
          { label: 'Baixar PDFs', icon: <Download className="h-3.5 w-3.5" />, action: (sel) => handleBulkDownload('PDF', sel) },
          { label: 'Reenviar E-mails', icon: <Mail className="h-3.5 w-3.5" />, action: handleBulkResend },
          { label: 'Exportar Relatório', icon: <FileSpreadsheet className="h-3.5 w-3.5" />, action: handleBulkExport, variant: 'outline' }
        ]}
      />

      {/* Cancel dialog modal */}
      <ConfirmDialog
        isOpen={cancelingInvoiceId !== null}
        onClose={() => setCancelingInvoiceId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Nota Fiscal"
        description="Atenção: A prefeitura/SEFAZ exige que o cancelamento de uma nota fiscal autorizada seja acompanhado de uma justificativa. Essa ação não pode ser desfeita."
        confirmText="Confirmar Cancelamento"
        cancelText="Voltar"
        variant="danger"
        loading={isCancelLoading}
      >
        <div className="mt-2 w-full flex flex-col gap-1.5 text-xs text-text-primary">
          <label className="font-semibold">Justificativa do Cancelamento (Mínimo 15 caracteres)</label>
          <textarea
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Ex: Devolução de mercadoria pelo cliente ou erro tributário..."
            className="w-full border border-border rounded p-2 text-xs h-16 outline-none focus:border-black"
          />
        </div>
      </ConfirmDialog>

    </div>
  );
};
export default GestaoNotas;
