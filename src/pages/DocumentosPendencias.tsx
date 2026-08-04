import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FolderClosed, ShieldAlert, Upload, Download, Trash, CheckCircle, 
  AlertCircle, Calendar, FileText
} from 'lucide-react';
import { databaseService, documentService, storageService } from '../services/supabaseApi';
import { realData } from '../services/realData';
import { PageHeader } from '../components/shared/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { UploadArea } from '../components/shared/UploadArea';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../context/ToastContext';
import type { Document, PendingTask } from '../types';

export const DocumentosPendencias: React.FC = () => {
  const location = useLocation();
  const toast = useToast();

  const defaultTab = location.pathname.includes('/pendencias') ? 'pendencias' : 'documentos';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Load state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pendings, setPendings] = useState<PendingTask[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [nextDocuments, nextPendings] = await Promise.all([
          realData.documents(),
          realData.pendingTasks(),
        ]);
        if (!mounted) return;
        setDocuments(nextDocuments);
        setPendings(nextPendings);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao carregar documentos e pendencias.');
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [toast]);

  // File Upload categories
  const [docCategory, setDocCategory] = useState<Document['category']>('invoice');
  const [docCompetence, setDocCompetence] = useState('07/2026');

  // Actions
  const handleFileUpload = async (file: File) => {
    if (uploading) return;

    const categoryLabels: Record<Document['category'], string> = {
      invoice: 'Notas fiscais',
      bank_statement: 'Extrato bancário',
      receipt: 'Comprovante',
      contract: 'Contrato',
      payroll: 'Folha de pagamento',
      corporate: 'Documento societário',
      others: 'Outro'
    };

    setUploading(true);
    try {
      const upload = await storageService.createUploadUrl({
        bucket: 'documents',
        fileName: file.name,
        recordId: docCompetence.replace('/', '-'),
      });
      await storageService.uploadWithSignedUrl({
        bucket: upload.bucket,
        path: upload.path,
        token: upload.token,
        file,
      });

      const documentPayload: Record<string, unknown> = {
        name: file.name,
        category: docCategory,
        competence: docCompetence,
        status: 'sent',
        sender_name: 'Usuario PixelConta',
        file_url: upload.path,
        file_size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      };
      const created = await documentService.create(documentPayload);

      const newDoc: Document = {
        id: created.id,
        name: created.name,
        category: created.category,
        competence: created.competence,
        status: created.status,
        uploadDate: created.created_at,
        sender: created.sender_name || 'Usuario PixelConta',
        size: created.file_size || `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        fileUrl: created.file_url,
      };

      setDocuments(prev => [newDoc, ...prev]);
      toast.success(`Documento "${file.name}" enviado com sucesso sob a categoria ${categoryLabels[docCategory]}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar documento.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = (id: string, name: string) => {
    const conf = window.confirm(`Deseja deletar o documento ${name}?`);
    if (conf) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      databaseService.remove('documents', id).catch(() => undefined);
      toast.success('Documento deletado.');
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    if (!doc.fileUrl) {
      toast.error('Arquivo sem caminho de download.');
      return;
    }

    const confirmDownload = window.confirm(`Deseja baixar o documento ${doc.name}?`);
    if (!confirmDownload) return;

    try {
        const download = await storageService.createDownloadUrl({
          bucket: 'documents',
          path: doc.fileUrl,
          fileName: doc.name,
        });
        const link = window.document.createElement('a');
        link.href = download.signedUrl;
        link.download = download.fileName || doc.name;
        link.rel = 'noopener noreferrer';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar link de download.');
    }
  };

  const handleResolvePending = (id: string, title: string) => {
    // If pending item is CNAE verification, CNAE is already confirmed.
    // If pending item is "Inter bank statement", it matches "doc-7" status to sent or adds a document.
    setPendings(prev => prev.map(p => p.id === id ? { ...p, status: 'resolved' as const } : p));
    databaseService.update('pending_tasks', id, { status: 'resolved' }).catch(() => undefined);
    toast.success(`Pendência "${title}" resolvida com sucesso!`);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title={activeTab === 'documentos' ? 'Gestão de Documentos Contábeis' : 'Pendências Fiscais & Obrigações'}
        description={
          activeTab === 'documentos' 
            ? 'Envie extratos, contratos e comprovantes fiscais para o seu contador de forma direta.'
            : 'Fique de olho nos prazos e obrigações mensais para manter sua empresa em conformidade.'
        }
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'documentos', label: 'Documentos Enviados', icon: <FolderClosed className="h-4 w-4" /> },
          { id: 'pendencias', label: 'Pendências Fiscais', icon: <ShieldAlert className="h-4 w-4" /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* 1. DOCUMENTS TAB */}
      {activeTab === 'documentos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
          
          {/* Upload card form */}
          <div className="border border-border rounded-premium p-6 bg-white shadow-premium flex flex-col gap-5">
            <h3 className="text-sm font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-text-primary" />
              <span>Enviar Novo Documento</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <Select
                label="Categoria do Documento"
                value={docCategory}
                onChange={e => setDocCategory(e.target.value as any)}
                options={[
                  { value: 'bank_statement', label: 'Extrato Bancário' },
                  { value: 'receipt', label: 'Comprovante / Recibo' },
                  { value: 'contract', label: 'Contrato Social / Prestação' },
                  { value: 'payroll', label: 'Folha de Pro-labore' },
                  { value: 'corporate', label: 'Documento Societário' },
                  { value: 'invoice', label: 'Notas Fiscais de Entrada' },
                  { value: 'others', label: 'Outros Documentos' }
                ]}
              />
              <Input
                label="Mês de Competência"
                value={docCompetence}
                onChange={e => setDocCompetence(e.target.value)}
                placeholder="Ex: 07/2026"
              />
              
              <UploadArea
                onFileSelect={handleFileUpload}
                accept=".pdf,.xml,.jpg,.jpeg,.png"
                maxSizeMB={20}
                label={uploading ? 'Enviando documento...' : 'Arraste arquivos PDF, XML ou imagens aqui'}
              />
            </div>
          </div>

          {/* List of uploaded files */}
          <div className="lg:col-span-2 border border-border rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4">
            <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border">
              Arquivos no Período
            </h3>
            
            <div className="w-full overflow-x-auto rounded-soft border border-border">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface border-b border-border text-text-primary font-bold">
                    <th className="p-3.5">Nome do Arquivo</th>
                    <th className="p-3.5">Categoria</th>
                    <th className="p-3.5 text-center">Competência</th>
                    <th className="p-3.5">Upload</th>
                    <th className="p-3.5">Tamanho</th>
                    <th className="p-3.5">Situação</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pixel-neutral-200 text-text-primary">
                  {documents.map((doc) => {
                    const categoryLabels = {
                      invoice: 'Notas Fiscais',
                      bank_statement: 'Extrato Bancário',
                      receipt: 'Comprovante',
                      contract: 'Contrato',
                      payroll: 'Folha Pagamento',
                      corporate: 'Doc. Societário',
                      others: 'Outro'
                    };

                    return (
                      <tr key={doc.id} className="hover:bg-neutral-bgSecondary/20">
                        <td className="p-3.5 font-medium text-text-primary flex items-center gap-2 max-w-[180px] truncate">
                          <FileText className="h-4 w-4 text-text-primary shrink-0" />
                          <span title={doc.name}>{doc.name}</span>
                        </td>
                        <td className="p-3.5 text-text-secondary">{categoryLabels[doc.category]}</td>
                        <td className="p-3.5 text-center font-mono">{doc.competence}</td>
                        <td className="p-3.5 text-text-secondary">
                          {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3.5 text-text-secondary">{doc.size}</td>
                        <td className="p-3.5">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-1 text-text-secondary hover:text-text-primary rounded hover:bg-neutral-bgSecondary/60 transition-colors"
                              title="Baixar arquivo"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id, doc.name)}
                              className="p-1 text-text-secondary hover:text-red-600 rounded hover:bg-red-600-bg/60 transition-colors"
                              title="Deletar arquivo"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 2. PENDENCIAS TAB */}
      {activeTab === 'pendencias' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start animate-fade-in">
          {/* Main List */}
          <div className="lg:col-span-3 border border-border rounded-premium bg-white p-5 shadow-premium flex flex-col gap-4">
            <h3 className="text-xs font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border">
              Lista de Obrigações Pendentes
            </h3>

            <div className="flex flex-col gap-4">
              {pendings.filter(p => p.status === 'pending').length === 0 ? (
                <div className="p-8 text-center text-xs text-green-600 font-semibold flex flex-col items-center gap-3">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                  <span>Sua empresa está 100% em dia! Nenhuma pendência fiscal ativa.</span>
                </div>
              ) : (
                pendings.map((p) => {
                  const isHigh = p.priority === 'high';
                  return (
                    <div 
                      key={p.id} 
                      className={`p-5 border rounded-premium bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 transition-all
                        ${p.status === 'resolved' 
                          ? 'border-border opacity-55' 
                          : isHigh 
                            ? 'border-functional-error/20 bg-red-600-bg/20' 
                            : 'border-border bg-white'}`}
                    >
                      <div className="flex gap-4">
                        <div className={`p-3 rounded-full shrink-0 h-11 w-11 flex items-center justify-center
                          ${p.status === 'resolved' 
                            ? 'bg-border text-text-secondary' 
                            : isHigh 
                              ? 'bg-red-50 text-red-600' 
                              : 'bg-brand-lightBlue/30 text-text-primary'}`}>
                          <AlertCircle className="h-5 w-5" />
                        </div>

                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className={`font-bold font-title text-sm ${p.status === 'resolved' ? 'line-through text-white/70' : 'text-text-primary'}`}>
                              {p.title}
                            </h4>
                            <StatusBadge status={p.status} />
                            <span className={`font-bold px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase
                              ${isHigh ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                              {p.priority === 'high' ? 'Crítica' : p.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                          </div>
                          <p className="text-text-secondary leading-relaxed max-w-xl">{p.description}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-white/70 font-semibold mt-1">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>Vencimento: {new Date(p.dueDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>

                      {p.status === 'pending' && (
                        <Button
                          variant={isHigh ? 'danger' : 'outline'}
                          size="sm"
                          onClick={() => handleResolvePending(p.id, p.title)}
                          icon={<CheckCircle className="h-4 w-4" />}
                          className="shrink-0 text-xs"
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="border border-border rounded-premium bg-white p-5 shadow-premium flex flex-col gap-3.5 text-xs text-text-secondary leading-relaxed">
              <h3 className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px] pb-2 border-b border-border">
                Por que isso importa?
              </h3>
              <p>
                Manter as pendências em dia evita multas municipais/estaduais por atraso na declaração fiscal do Simples Nacional ou na entrega do DAS.
              </p>
              <div className="bg-surface p-3 rounded-soft border border-primary/20 text-[11px] font-semibold text-text-primary mt-1 flex gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Anexar os comprovantes de guias pagas na aba "Documentos Enviados" para que a contabilidade possa conciliar.</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
export default DocumentosPendencias;
