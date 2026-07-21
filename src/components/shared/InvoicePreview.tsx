import React from 'react';
import type { Invoice } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface InvoicePreviewProps {
  invoice: Omit<Invoice, 'id' | 'issueDate' | 'logs' | 'events'> & {
    id?: string;
    issueDate?: string;
  };
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const cleanNumber = invoice.number || 'RASCUNHO';
  const cleanKey = invoice.accessKey || '4444 8888 2222 1111 0000 9999 8888 7777 6666 5555 4444';
  const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.value);
  const formattedDate = invoice.issueDate 
    ? new Date(invoice.issueDate).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('pt-BR');

  const issuer = {
    name: 'Pixel Comércio Digital LTDA',
    document: '12.345.678/0001-90',
    stateReg: '888.777.666.555',
    munReg: '121314-5',
    address: 'Avenida Rui Barbosa, 120 - Andar 3, Sala 301 - Graças, Recife - PE',
    phone: '(81) 3456-7890',
    email: 'ricardo@pixelconta.com.br'
  };

  const statusColors = {
    authorized: 'border-green-600 text-functional-success/20',
    processing: 'border-black text-primary/20',
    waiting: 'border-yellow-500 text-functional-warning/20',
    rejected: 'border-red-600 text-functional-error/20',
    canceled: 'border-border text-white/20',
  };

  return (
    <div className="relative w-full border border-border rounded-premium bg-white p-6 md:p-8 shadow-premium text-text-primary font-sans overflow-hidden">
      
      {/* Watermark Status */}
      {invoice.status && invoice.status !== 'authorized' && invoice.status !== 'processing' && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 transform rotate-12`}>
          <span className={`text-4xl md:text-7xl font-extrabold uppercase border-8 px-6 py-3 rounded-premium tracking-widest ${statusColors[invoice.status]}`}>
            {invoice.status === 'canceled' ? 'Cancelada' : invoice.status === 'rejected' ? 'Rejeitada' : 'Rascunho'}
          </span>
        </div>
      )}

      {/* Main Document Content */}
      <div className="relative z-10 flex flex-col gap-6">
        
        {/* Header Grid */}
        <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-border pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {/* Logo abstraction: P + Pixel + Document */}
              <div className="flex h-8 w-8 items-center justify-center rounded bg-black text-white font-black text-lg">
                P
              </div>

            </div>
            <p className="text-xs text-text-secondary">Documento Auxiliar de Emissão Fiscal</p>
          </div>

          <div className="flex flex-col md:items-end gap-1">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              {invoice.type} - Nota Fiscal Eletrônica
            </span>
            <span className="text-lg font-bold text-text-primary">
              Nº {cleanNumber}
            </span>
            <span className="text-xs text-text-secondary">
              Série 001 | Emissão: {formattedDate}
            </span>
            {invoice.status && (
              <StatusBadge status={invoice.status} className="mt-1" />
            )}
          </div>
        </div>

        {/* Access Key */}
        <div className="bg-surface p-3.5 rounded-soft border border-border text-xs flex flex-col gap-1">
          <span className="font-semibold text-text-primary uppercase tracking-wider text-[10px]">
            Chave de Acesso (44 dígitos)
          </span>
          <span className="font-mono text-text-primary select-all tracking-wider md:text-sm text-xs">
            {cleanKey}
          </span>
        </div>

        {/* Emitente & Destinatário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border pb-6">
          {/* Emitente */}
          <div className="flex flex-col gap-2 text-xs">
            <h4 className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px]">
              Prestador de Serviços / Emitente
            </h4>
            <div className="flex flex-col gap-1 text-text-secondary">
              <span className="font-bold text-text-primary">{issuer.name}</span>
              <span>CNPJ: {issuer.document}</span>
              <span>Inscrição Estadual: {issuer.stateReg}</span>
              <span>Inscrição Municipal: {issuer.munReg}</span>
              <span>{issuer.address}</span>
            </div>
          </div>

          {/* Destinatário */}
          <div className="flex flex-col gap-2 text-xs">
            <h4 className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px]">
              Tomador de Serviços / Destinatário
            </h4>
            <div className="flex flex-col gap-1 text-text-secondary">
              <span className="font-bold text-text-primary">{invoice.clientName}</span>
              <span>CPF/CNPJ: {invoice.clientDocument}</span>
              {invoice.clientAddress && (
                <span>
                  {invoice.clientAddress.street}, {invoice.clientAddress.number} {invoice.clientAddress.complement ? `- ${invoice.clientAddress.complement}` : ''}<br />
                  {invoice.clientAddress.neighborhood} - {invoice.clientAddress.city} / {invoice.clientAddress.state}
                </span>
              )}
              {invoice.clientEmail && <span>E-mail: {invoice.clientEmail}</span>}
              {invoice.clientPhone && <span>Telefone: {invoice.clientPhone}</span>}
            </div>
          </div>
        </div>

        {/* Itens */}
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px] mb-1">
            Descrição dos Produtos / Serviços
          </h4>
          <div className="overflow-x-auto border border-border rounded-soft">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface border-b border-border text-text-primary font-bold">
                  <th className="p-3">Descrição</th>
                  {invoice.type === 'NFS-e' ? (
                    <th className="p-3 w-20">CNAE</th>
                  ) : (
                    <>
                      <th className="p-3 w-20">NCM</th>
                      <th className="p-3 w-16">CFOP</th>
                    </>
                  )}
                  <th className="p-3 w-12 text-center">Qtd</th>
                  <th className="p-3 w-24 text-right">Unitário</th>
                  <th className="p-3 w-20 text-right">Desconto</th>
                  <th className="p-3 w-24 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pixel-neutral-200">
                {invoice.items.map((item, idx) => {
                  const itemVal = item.value * item.quantity;
                  const itemDiscount = item.discount || 0;
                  const itemTotal = itemVal - itemDiscount;

                  return (
                    <tr key={idx} className="hover:bg-neutral-bgSecondary/20">
                      <td className="p-3 font-medium text-text-primary">{item.description}</td>
                      {invoice.type === 'NFS-e' ? (
                        <td className="p-3 text-text-secondary font-mono">{item.cnae || '6201-5/01'}</td>
                      ) : (
                        <>
                          <td className="p-3 text-text-secondary font-mono">{item.ncm || '4820.10.00'}</td>
                          <td className="p-3 text-text-secondary font-mono">{item.cfop || '5.102'}</td>
                        </>
                      )}
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                      </td>
                      <td className="p-3 text-right text-red-600">
                        {itemDiscount > 0 ? `-${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemDiscount)}` : '-'}
                      </td>
                      <td className="p-3 text-right font-semibold text-text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tributação & Valor Total */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
          {/* Tributos */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <h4 className="font-bold text-text-primary font-title uppercase tracking-wider text-[10px]">
              Tributos Estimados
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {invoice.type === 'NFS-e' ? (
                <>
                  <div className="bg-neutral-bgSecondary/50 p-2 rounded border border-border text-xs">
                    <span className="text-text-secondary block text-[10px]">ISS</span>
                    <span className="font-bold text-text-primary">
                      {invoice.taxes.iss 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.taxes.iss)
                        : '-'}
                    </span>
                  </div>
                  <div className="bg-neutral-bgSecondary/50 p-2 rounded border border-border text-xs">
                    <span className="text-text-secondary block text-[10px]">IRRF</span>
                    <span className="font-bold text-text-primary">
                      {invoice.taxes.ir 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.taxes.ir)
                        : '-'}
                    </span>
                  </div>
                  <div className="bg-neutral-bgSecondary/50 p-2 rounded border border-border text-xs">
                    <span className="text-text-secondary block text-[10px]">CSLL</span>
                    <span className="font-bold text-text-primary">
                      {invoice.taxes.csll 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.taxes.csll)
                        : '-'}
                    </span>
                  </div>
                  <div className="bg-neutral-bgSecondary/50 p-2 rounded border border-border text-xs">
                    <span className="text-text-secondary block text-[10px]">INSS</span>
                    <span className="font-bold text-text-primary">
                      {invoice.taxes.inss 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.taxes.inss)
                        : '-'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-neutral-bgSecondary/50 p-2 rounded border border-border text-xs">
                    <span className="text-text-secondary block text-[10px]">ICMS</span>
                    <span className="font-bold text-text-primary">
                      {invoice.taxes.icms 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.taxes.icms)
                        : '-'}
                    </span>
                  </div>
                  <div className="bg-neutral-bgSecondary/50 p-2 rounded border border-border text-xs">
                    <span className="text-text-secondary block text-[10px]">PIS</span>
                    <span className="font-bold text-text-primary">
                      {invoice.taxes.pis 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.taxes.pis)
                        : '-'}
                    </span>
                  </div>
                  <div className="bg-neutral-bgSecondary/50 p-2 rounded border border-border text-xs">
                    <span className="text-text-secondary block text-[10px]">COFINS</span>
                    <span className="font-bold text-text-primary">
                      {invoice.taxes.cofins 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.taxes.cofins)
                        : '-'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Valor Total */}
          <div className="bg-black text-white p-4 rounded-soft flex flex-col justify-center items-end gap-1 shrink-0 shadow-sm border border-black">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-primary">
              VALOR TOTAL DA NOTA
            </span>
            <span className="text-2xl font-black font-title tracking-tight text-right">
              {formattedValue}
            </span>
          </div>
        </div>

        {/* Observações */}
        {invoice.observations && (
          <div className="bg-neutral-bgSecondary/50 p-3 rounded-soft border border-border text-[11px] flex flex-col gap-1 mt-2">
            <span className="font-bold text-text-primary uppercase tracking-wider text-[9px]">
              Informações Complementares / Observações Fiscais
            </span>
            <p className="text-text-secondary leading-relaxed">
              {invoice.observations}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
