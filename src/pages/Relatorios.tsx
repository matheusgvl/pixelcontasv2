import React, { useEffect, useState, useMemo } from 'react';
import { 
  FileSpreadsheet, Download, Filter, 
  TrendingUp, FileCheck, Landmark, ShieldAlert, Ban, BarChart4
} from 'lucide-react';
import { realData } from '../services/realData';
import { PageHeader } from '../components/shared/PageHeader';
import { MetricCard } from '../components/shared/MetricCard';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useToast } from '../context/ToastContext';
import type { Invoice } from '../types';

export const Relatorios: React.FC = () => {
  const toast = useToast();

  // Filters state
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrigin, setFilterOrigin] = useState('all');

  // Load database invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    let mounted = true;
    realData.invoices()
      .then((nextInvoices) => {
        if (mounted) setInvoices(nextInvoices);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  // Filtered invoices logic
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    return invoices.filter(inv => {
      // Period filter
      const invDate = new Date(inv.issueDate);
      const diffTime = Math.abs(now.getTime() - invDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let matchesPeriod = true;
      if (filterPeriod === '7d') matchesPeriod = diffDays <= 7;
      else if (filterPeriod === '30d') matchesPeriod = diffDays <= 30;
      else if (filterPeriod === 'month') matchesPeriod = invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();

      // Type filter
      const matchesType = filterType === 'all' || inv.type === filterType;

      // Status filter
      const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;

      // Origin filter
      const matchesOrigin = filterOrigin === 'all' || inv.origin === filterOrigin;

      return matchesPeriod && matchesType && matchesStatus && matchesOrigin;
    });
  }, [invoices, filterPeriod, filterType, filterStatus, filterOrigin]);

  // Totals calculations
  const totals = useMemo(() => {
    const activeInvoices = filteredInvoices.filter(i => i.status === 'authorized' || i.status === 'processing');
    const faturamento = activeInvoices.reduce((sum, i) => sum + i.value, 0);
    const emitidas = filteredInvoices.filter(i => i.status === 'authorized').length;
    
    // Simulating tax calculation totals
    const impostos = activeInvoices.reduce((sum, i) => {
      const issVal = i.taxes.iss || 0;
      const icmsVal = i.taxes.icms || 0;
      const pisVal = i.taxes.pis || 0;
      const cofinsVal = i.taxes.cofins || 0;
      const irVal = i.taxes.ir || 0;
      const csllVal = i.taxes.csll || 0;
      return sum + issVal + icmsVal + pisVal + cofinsVal + irVal + csllVal;
    }, 0) || (faturamento * 0.06); // fallback average Simples Nacional

    const rejeitadas = filteredInvoices.filter(i => i.status === 'rejected').length;
    const canceladas = filteredInvoices.filter(i => i.status === 'canceled').length;

    return { faturamento, emitidas, impostos, rejeitadas, canceladas };
  }, [filteredInvoices]);

  // Export mock handler
  const handleExport = (format: 'PDF' | 'Excel' | 'CSV') => {
    toast.info(`Processando dados para exportação em ${format}...`);
    setTimeout(() => {
      toast.success(`Relatório exportado em formato ${format} com sucesso! Verifique a pasta de downloads.`);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Relatórios Fiscais & Financeiros"
        description="Gere demonstrativos de faturamento, análise de impostos e exporte planilhas fiscais."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={() => handleExport('PDF')}
            >
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<FileSpreadsheet className="h-4 w-4" />}
              onClick={() => handleExport('Excel')}
            >
              Exportar Planilha (XLSX)
            </Button>
          </div>
        }
      />

      {/* Filter Options */}
      <div className="border border-border rounded-premium p-5 bg-white shadow-premium flex flex-col gap-4">
        <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-2 border-b border-border">
          <Filter className="h-4 w-4 text-text-primary" />
          <span>Filtros do Relatório</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            value={filterPeriod}
            onChange={e => setFilterPeriod(e.target.value)}
            label="Período"
            options={[
              { value: 'month', label: 'Este mês' },
              { value: '30d', label: 'Últimos 30 dias' },
              { value: '7d', label: 'Últimos 7 dias' }
            ]}
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
              { value: 'canceled', label: 'Cancelada' },
              { value: 'rejected', label: 'Rejeitada' }
            ]}
          />
          <Select
            value={filterOrigin}
            onChange={e => setFilterOrigin(e.target.value)}
            label="Origem da Venda"
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

      {/* Metrics Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Faturamento Bruto"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.faturamento)}
          icon={<TrendingUp className="h-5 w-5" />}
          highlight={true}
        />
        <MetricCard
          title="Notas Emitidas"
          value={totals.emitidas}
          icon={<FileCheck className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Impostos"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.impostos)}
          icon={<Landmark className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Rejeições"
          value={totals.rejeitadas}
          icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
        />
        <MetricCard
          title="Cancelamentos"
          value={totals.canceladas}
          icon={<Ban className="h-5 w-5 text-text-secondary" />}
        />
      </div>

      {/* Structured report spreadsheet simulation details */}
      <div className="border border-border rounded-premium bg-white p-6 shadow-premium flex flex-col gap-4">
        <h3 className="text-sm font-bold text-text-primary font-title flex items-center gap-2">
          <BarChart4 className="h-4.5 w-4.5 text-text-primary" />
          <span>Demostrativo de Notas Emitidas no Período</span>
        </h3>
        
        <div className="w-full overflow-x-auto rounded-soft border border-border">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface border-b border-border text-text-primary font-bold">
                <th className="p-3.5">Mês de Emissão</th>
                <th className="p-3.5">Faturamento Bruto</th>
                <th className="p-3.5">Impostos Acumulados</th>
                <th className="p-3.5">Notas Emitidas</th>
                <th className="p-3.5 text-center">Taxa de Sucesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pixel-neutral-200 text-text-primary">
              <tr className="hover:bg-neutral-bgSecondary/20 font-medium">
                <td className="p-3.5">Julho / 2026</td>
                <td className="p-3.5 font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.faturamento)}
                </td>
                <td className="p-3.5 font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.impostos)}
                </td>
                <td className="p-3.5">{totals.emitidas} notas</td>
                <td className="p-3.5 text-center text-green-600 font-bold">
                  {totals.emitidas + totals.rejeitadas > 0 
                    ? `${Math.round((totals.emitidas / (totals.emitidas + totals.rejeitadas)) * 100)}%` 
                    : '100%'}
                </td>
              </tr>
              <tr className="hover:bg-neutral-bgSecondary/20 text-white/70">
                <td className="p-3.5">Junho / 2026</td>
                <td className="p-3.5">R$ 45.000,00</td>
                <td className="p-3.5">R$ 2.700,00</td>
                <td className="p-3.5">38 notas</td>
                <td className="p-3.5 text-center font-semibold">97%</td>
              </tr>
              <tr className="hover:bg-neutral-bgSecondary/20 text-white/70">
                <td className="p-3.5">Maio / 2026</td>
                <td className="p-3.5">R$ 38.000,00</td>
                <td className="p-3.5">R$ 2.280,00</td>
                <td className="p-3.5">30 notas</td>
                <td className="p-3.5 text-center font-semibold">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default Relatorios;
