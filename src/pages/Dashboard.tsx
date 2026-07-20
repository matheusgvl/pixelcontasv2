import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, FileText, Landmark, ShieldAlert, Users,
  PlusCircle, FileSpreadsheet, MessageSquareCode, CalendarDays,
  Plus, ArrowRight
} from 'lucide-react';
import { db } from '../mocks/db';
import { MetricCard } from '../components/shared/MetricCard';
import { ChartCard } from '../components/shared/ChartCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [filterPeriod, setFilterPeriod] = useState<'30d' | '7d' | 'month' | 'today'>('month');

  // Load database items
  const invoices = useMemo(() => db.invoices, []);
  const clients = useMemo(() => db.clients, []);
  const pendings = useMemo(() => db.pendings, []);

  // Filter invoices based on period
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    return invoices.filter(inv => {
      const invDate = new Date(inv.issueDate);
      const diffTime = Math.abs(now.getTime() - invDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterPeriod === 'today') {
        return invDate.toDateString() === now.toDateString();
      }
      if (filterPeriod === '7d') {
        return diffDays <= 7;
      }
      if (filterPeriod === '30d') {
        return diffDays <= 30;
      }
      // 'month' - current calendar month
      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    });
  }, [invoices, filterPeriod]);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const faturamento = filteredInvoices
      .filter(i => i.status === 'authorized' || i.status === 'processing')
      .reduce((sum, i) => sum + i.value, 0);

    const emitidas = filteredInvoices.filter(i => i.status === 'authorized').length;
    
    // Estimate Simple Nacional tax as 6% average
    const impostos = faturamento * 0.06;

    const processando = filteredInvoices.filter(i => i.status === 'processing' || i.status === 'waiting').length;
    const rejeitadas = filteredInvoices.filter(i => i.status === 'rejected').length;
    const ativos = clients.filter(c => c.status === 'active').length;

    return { faturamento, emitidas, impostos, processando, rejeitadas, ativos };
  }, [filteredInvoices, clients]);

  // Recharts Data Transformation - Faturamento por Mês
  const faturamentoChartData = [
    { name: 'Jan', valor: 22000 },
    { name: 'Fev', valor: 28000 },
    { name: 'Mar', valor: 31000 },
    { name: 'Abr', valor: 29000 },
    { name: 'Mai', valor: 38000 },
    { name: 'Jun', valor: 45000 },
    { name: 'Jul', valor: metrics.faturamento || 12000 },
  ];

  // Recharts Data Transformation - Notas por Situação
  const situacaoChartData = useMemo(() => {
    const authorized = filteredInvoices.filter(i => i.status === 'authorized').length;
    const processing = filteredInvoices.filter(i => i.status === 'processing').length;
    const waiting = filteredInvoices.filter(i => i.status === 'waiting').length;
    const rejected = filteredInvoices.filter(i => i.status === 'rejected').length;
    const canceled = filteredInvoices.filter(i => i.status === 'canceled').length;

    return [
      { name: 'Autorizada', value: authorized, color: '#168A5B' },
      { name: 'Processando', value: processing, color: '#11B7A3' },
      { name: 'Aguardando', value: waiting, color: '#E0A11A' },
      { name: 'Rejeitada', value: rejected, color: '#D64545' },
      { name: 'Cancelada', value: canceled, color: '#647381' },
    ].filter(item => item.value > 0);
  }, [filteredInvoices]);


  const recentInvoices = useMemo(() => {
    return invoices.slice(0, 5);
  }, [invoices]);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pixel-neutral-200 pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-black text-pixel-navy-900 font-title tracking-tight">
            Olá, Ricardo Almeida.
          </h1>
          <p className="text-xs md:text-sm text-pixel-neutral-500 font-medium">
            Aqui está o resumo fiscal e financeiro da sua empresa hoje.
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-pixel-neutral-100 p-1 rounded-soft border border-pixel-neutral-200 text-xs">
          {[
            { id: 'today', label: 'Hoje' },
            { id: '7d', label: 'Últimos 7 dias' },
            { id: '30d', label: 'Últimos 30 dias' },
            { id: 'month', label: 'Este mês' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setFilterPeriod(p.id as any)}
              className={`px-3 py-1.5 rounded-soft font-semibold transition-all duration-150
                ${filterPeriod === p.id 
                  ? 'bg-white text-pixel-navy-900 shadow-sm border border-neutral-borderLight/40' 
                  : 'text-pixel-neutral-500 hover:text-pixel-neutral-900'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Faturamento no período"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.faturamento)}
          icon={<TrendingUp className="h-5 w-5" />}
          change={{ value: 14.2, type: 'increase', timeframe: 'vs último mês' }}
          highlight={true}
        />
        <MetricCard
          title="Notas fiscais emitidas"
          value={metrics.emitidas}
          icon={<FileText className="h-5 w-5" />}
          change={{ value: 8.5, type: 'increase', timeframe: 'vs último mês' }}
        />
        <MetricCard
          title="Impostos estimados"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.impostos)}
          icon={<Landmark className="h-5 w-5 text-pixel-gold-500" />}
          change={{ value: 3.1, type: 'decrease', timeframe: 'vs faturamento real' }}
        />
        <MetricCard
          title="Aguardando Processamento"
          value={metrics.processando}
          icon={<PlusCircle className="h-5 w-5 text-pixel-navy-900" />}
        />
        <MetricCard
          title="Notas com erro / Rejeições"
          value={metrics.rejeitadas}
          icon={<ShieldAlert className={`h-5 w-5 ${metrics.rejeitadas > 0 ? 'text-red-600' : 'text-pixel-neutral-500'}`} />}
          highlight={metrics.rejeitadas > 0}
        />
        <MetricCard
          title="Clientes Ativos"
          value={metrics.ativos}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Quick Actions & Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions Shortcuts */}
        <div className="lg:col-span-3 border border-pixel-neutral-200 rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4">
          <h3 className="text-sm font-bold text-pixel-navy-900 font-title uppercase tracking-wider text-[10px]">
            Atalhos Rápidos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/app/emitir-nota')}
              className="p-4 border border-pixel-neutral-200 rounded-premium bg-white text-left flex flex-col gap-2 hover:border-brand-teal/20 hover:shadow-premium transition-all duration-150 active:scale-[0.98]"
            >
              <div className="p-2 bg-pixel-neutral-50 text-pixel-navy-900 rounded-soft w-fit">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-pixel-neutral-900 font-title mt-1">Emitir NFS-e</span>
            </button>
            <button 
              onClick={() => navigate('/app/clientes/novo')}
              className="p-4 border border-pixel-neutral-200 rounded-premium bg-white text-left flex flex-col gap-2 hover:border-brand-teal/20 hover:shadow-premium transition-all duration-150 active:scale-[0.98]"
            >
              <div className="p-2 bg-brand-lightBlue/30 text-pixel-navy-900 rounded-soft w-fit">
                <PlusCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-pixel-neutral-900 font-title mt-1">Cadastrar Cliente</span>
            </button>
            <button 
              onClick={() => navigate('/app/servicos')}
              className="p-4 border border-pixel-neutral-200 rounded-premium bg-white text-left flex flex-col gap-2 hover:border-brand-teal/20 hover:shadow-premium transition-all duration-150 active:scale-[0.98]"
            >
              <div className="p-2 bg-pixel-gold-300 text-pixel-gold-600 rounded-soft w-fit">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-pixel-neutral-900 font-title mt-1">Cadastrar Serviço</span>
            </button>
            <button 
              onClick={() => navigate('/app/integracoes')}
              className="p-4 border border-pixel-neutral-200 rounded-premium bg-white text-left flex flex-col gap-2 hover:border-brand-teal/20 hover:shadow-premium transition-all duration-150 active:scale-[0.98]"
            >
              <div className="p-2 bg-pixel-neutral-50 text-pixel-navy-900 rounded-soft w-fit">
                <PlusCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-pixel-neutral-900 font-title mt-1">Conectar Integração</span>
            </button>
            <button 
              onClick={() => navigate('/app/documentos')}
              className="p-4 border border-pixel-neutral-200 rounded-premium bg-white text-left flex flex-col gap-2 hover:border-brand-teal/20 hover:shadow-premium transition-all duration-150 active:scale-[0.98]"
            >
              <div className="p-2 bg-pixel-neutral-100 text-pixel-neutral-500 rounded-soft w-fit">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-pixel-neutral-900 font-title mt-1">Enviar Documento</span>
            </button>
            <button 
              onClick={() => navigate('/app/contabilidade')}
              className="p-4 border border-pixel-neutral-200 rounded-premium bg-white text-left flex flex-col gap-2 hover:border-brand-teal/20 hover:shadow-premium transition-all duration-150 active:scale-[0.98]"
            >
              <div className="p-2 bg-pixel-neutral-50 text-pixel-navy-900 rounded-soft w-fit">
                <MessageSquareCode className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-pixel-neutral-900 font-title mt-1">Falar com Contador</span>
            </button>
          </div>
        </div>

        {/* Alertas & Obrigações */}
        <div className="border border-pixel-neutral-200 rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4">
          <h3 className="text-sm font-bold text-pixel-navy-900 font-title uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <CalendarDays className="h-4.5 w-4.5 text-pixel-navy-900" />
            <span>Obrigações Fiscais</span>
          </h3>
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-48 pr-1">
            {pendings.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3 bg-neutral-bgSecondary/60 rounded-soft border border-pixel-neutral-200 flex flex-col gap-1 text-[11px] text-pixel-neutral-500 hover:border-brand-teal/20 hover:bg-white transition-all cursor-pointer" onClick={() => navigate('/app/pendencias')}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-pixel-neutral-900 font-title truncate max-w-[130px]">{item.title}</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase
                    ${item.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-pixel-neutral-200 text-pixel-navy-900'}`}>
                    {item.priority === 'high' ? 'Crítico' : 'Médio'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold mt-1">
                  <span>Prazo: {new Date(item.dueDate).toLocaleDateString('pt-BR')}</span>
                  <span className="text-pixel-navy-900 font-bold hover:underline">Resolver →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faturamento por Mês (AreaChart) */}
        <div className="lg:col-span-2">
          <ChartCard title="Evolução do Faturamento" description="Faturamento bruto mensal emitido em NFS-e/NF-e">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={faturamentoChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#11B7A3" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#11B7A3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7EBED" />
                <XAxis dataKey="name" stroke="#647381" fontSize={11} />
                <YAxis stroke="#647381" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #DCE3E6', fontSize: '12px' }}
                  formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, 'Faturamento']}
                />
                <Area type="monotone" dataKey="valor" stroke="#11B7A3" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValor)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Notas por Situação (PieChart) */}
        <div>
          <ChartCard title="Situação das Notas" description="Notas fiscais por status no período">
            {situacaoChartData.length === 0 ? (
              <div className="text-xs text-pixel-neutral-500 text-center py-10">Nenhuma nota emitida no período.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={situacaoChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {situacaoChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} nota(s)`, 'Quantidade']} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="border border-pixel-neutral-200 rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <h3 className="text-base font-bold text-pixel-navy-900 font-title">
            Notas Fiscais Recentes
          </h3>
          <Link to="/app/notas" className="text-xs font-bold text-pixel-navy-900 hover:underline flex items-center gap-1">
            <span>Ver todas</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="w-full overflow-x-auto rounded-soft border border-pixel-neutral-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-pixel-neutral-100 border-b border-pixel-neutral-200 text-pixel-navy-900 font-bold">
                <th className="p-3.5">Número</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Emissão</th>
                <th className="p-3.5 text-right">Valor</th>
                <th className="p-3.5">Origem</th>
                <th className="p-3.5">Situação</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pixel-neutral-200">
              {recentInvoices.map((inv) => (
                <tr 
                  key={inv.id} 
                  onClick={() => navigate(`/app/notas/${inv.id}`)}
                  className="hover:bg-pixel-navy-900-soft/30 transition-colors duration-150 cursor-pointer"
                >
                  <td className="p-3.5 font-mono text-pixel-navy-900 font-semibold">{inv.number}</td>
                  <td className="p-3.5 font-medium text-pixel-neutral-900">{inv.clientName}</td>
                  <td className="p-3.5 text-pixel-neutral-500">{inv.type}</td>
                  <td className="p-3.5 text-pixel-neutral-500">
                    {new Date(inv.issueDate).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5 text-right font-bold text-pixel-navy-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.value)}
                  </td>
                  <td className="p-3.5">
                    <span className="bg-pixel-neutral-100 text-pixel-neutral-900 font-semibold px-2 py-0.5 rounded text-[10px]">
                      {inv.origin}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>
                    <Link to={`/app/notas/${inv.id}`}>
                      <Button variant="ghost" size="sm" className="!p-1">Visualizar</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
