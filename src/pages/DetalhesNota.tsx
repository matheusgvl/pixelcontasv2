import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Mail, Copy, Ban, 
  History, Settings, Activity, ShieldCheck
} from 'lucide-react';
import { db } from '../mocks/db';
import { invoiceService } from '../services/api';
import { InvoicePreview } from '../components/shared/InvoicePreview';
import { PageHeader } from '../components/shared/PageHeader';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const DetalhesNota: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoices, setInvoices] = useState(() => db.invoices);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  // Find invoice
  const invoice = useMemo(() => {
    return invoices.find(inv => inv.id === id);
  }, [invoices, id]);

  const handleDownload = (type: 'PDF' | 'XML') => {
    if (!invoice) return;
    toast.success(`Download do arquivo ${type} da nota nº ${invoice.number} iniciado.`);
  };

  const handleResendEmail = () => {
    if (!invoice) return;
    toast.success(`Arquivos da nota nº ${invoice.number} reenviados para o e-mail: ${invoice.clientEmail || 'do cliente'}.`);
  };

  const handleDuplicate = () => {
    if (!invoice) return;
    toast.success('Rascunho duplicado com sucesso! Redirecionando para edição.');
    navigate('/app/emitir-nota');
  };

  const handleConfirmCancel = async () => {
    if (!invoice) return;
    if (!cancelReason) {
      toast.error('Informe a justificativa do cancelamento.');
      return;
    }

    setIsCancelLoading(true);
    try {
      const updated = await invoiceService.cancelInvoice(invoice.id, cancelReason);
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? updated : inv));
      toast.success('Nota fiscal cancelada com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cancelar a nota.');
    } finally {
      setIsCancelLoading(false);
      setShowCancelDialog(false);
    }
  };

  if (!invoice) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center p-12 text-center">
        <ShieldCheck className="h-12 w-12 text-brand-navy/30" />
        <h2 className="text-lg font-bold text-text-primary font-title">Nota Fiscal não encontrada</h2>
        <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
          O identificador da nota é inválido ou ela não existe no banco de dados.
        </p>
        <Link to="/app/notas" className="mt-2">
          <Button variant="primary" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Voltar para a listagem
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title={`Detalhes da Nota Fiscal Nº ${invoice.number}`}
        description={`Visualização técnica e acompanhamento da emissão.`}
        breadcrumbs={[
          { label: 'Notas Fiscais', link: '/app/notas' },
          { label: `Nota Nº ${invoice.number}` }
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link to="/app/notas">
              <Button variant="outline" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
                Voltar
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<Copy className="h-4 w-4" />}
              onClick={handleDuplicate}
            >
              Duplicar
            </Button>
            {invoice.status === 'authorized' && (
              <Button 
                variant="danger" 
                size="sm" 
                icon={<Ban className="h-4 w-4" />}
                onClick={() => {
                  setCancelReason('');
                  setShowCancelDialog(true);
                }}
              >
                Cancelar Nota
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Visual Invoice Preview (DANFE) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <InvoicePreview invoice={invoice} />
        </div>

        {/* Right Column: Technical details, events and logs */}
        <div className="flex flex-col gap-6">
          
          {/* Action Card */}
          <div className="border border-border rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4">
            <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border">
              Ações Disponíveis
            </h3>
            <div className="flex flex-col gap-2.5">
              <Button
                variant="primary"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                onClick={() => handleDownload('PDF')}
                className="w-full text-xs"
              >
                Baixar PDF da Nota
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                onClick={() => handleDownload('XML')}
                className="w-full text-xs"
              >
                Baixar XML Homologado
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Mail className="h-4 w-4" />}
                onClick={handleResendEmail}
                className="w-full text-xs"
              >
                Reenviar Arquivos por E-mail
              </Button>
            </div>
          </div>

          {/* Integration & Metadata Details */}
          <div className="border border-border rounded-premium bg-white p-5 shadow-premium flex flex-col gap-3 text-xs">
            <h3 className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-text-primary" />
              <span>Metadados da Integração</span>
            </h3>
            <div className="flex flex-col gap-2.5 text-text-secondary">
              <div className="flex justify-between">
                <span>Canal de Origem:</span>
                <span className="font-semibold text-text-primary">{invoice.origin}</span>
              </div>
              <div className="flex justify-between">
                <span>Regime Fiscal:</span>
                <span className="font-semibold text-text-primary">{invoice.taxRegime || 'Simples Nacional'}</span>
              </div>
              <div className="flex justify-between">
                <span>Ambiente Fiscal:</span>
                <span className="font-semibold text-text-primary">Homologação</span>
              </div>
              <div className="flex justify-between">
                <span>Protocolo de Uso:</span>
                <span className="font-semibold text-text-primary font-mono">135260020412345</span>
              </div>
            </div>
          </div>

          {/* History of events timeline */}
          <div className="border border-border rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4">
            <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border flex items-center gap-1.5">
              <History className="h-4 w-4 text-text-primary" />
              <span>Linha do Tempo de Eventos</span>
            </h3>
            <div className="flex flex-col gap-4">
              {invoice.events.length === 0 ? (
                <span className="text-xs text-text-secondary">Nenhum evento registrado ainda.</span>
              ) : (
                invoice.events.map((evt, idx) => (
                  <div key={idx} className="flex gap-3 text-xs leading-normal">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="h-5 w-5 bg-surface text-text-primary border border-primary/20 rounded-full flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                      {idx !== invoice.events.length - 1 && (
                        <div className="w-0.5 bg-border flex-1 my-1"></div>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-text-primary font-title">{evt.title}</span>
                      <p className="text-text-secondary">{evt.description}</p>
                      <span className="text-[9px] text-white/60 mt-0.5">
                        {new Date(evt.date).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Technical logs panel */}
          <div className="border border-border rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4">
            <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-text-primary" />
              <span>Logs de Processamento</span>
            </h3>
            <div className="flex flex-col gap-3 font-mono text-[9px] bg-neutral-bgSecondary/60 p-3 rounded-soft border border-border max-h-56 overflow-y-auto leading-relaxed">
              {invoice.logs.map((log, idx) => {
                const colors = {
                  info: 'text-text-secondary',
                  success: 'text-green-600 font-semibold',
                  warning: 'text-yellow-500 font-semibold',
                  error: 'text-red-600 font-semibold'
                };
                return (
                  <div key={idx} className="flex flex-col gap-0.5 border-b border-neutral-divider/30 pb-2">
                    <span className="text-[8px] text-white/60">
                      [{new Date(log.timestamp).toLocaleTimeString('pt-BR')}]
                    </span>
                    <span className={colors[log.type]}>
                      {log.message}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Cancel confirm dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Nota Fiscal Eletrônica"
        description="Atenção: A prefeitura municipal exige uma justificativa de no mínimo 15 caracteres para validar o cancelamento fiscal desta nota. Essa ação não pode ser revertida."
        confirmText="Homologar Cancelamento"
        cancelText="Voltar"
        variant="danger"
        loading={isCancelLoading}
      >
        <div className="mt-2 w-full flex flex-col gap-1.5 text-xs text-text-primary">
          <label className="font-semibold">Justificativa do Cancelamento</label>
          <textarea
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Ex: Cancelamento motivado por devolução de mercadoria ou erro de digitação de valores..."
            className="w-full border border-border rounded p-2 text-xs h-16 outline-none focus:border-black resize-none"
          />
        </div>
      </ConfirmDialog>

    </div>
  );
};
export default DetalhesNota;
