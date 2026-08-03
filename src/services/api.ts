import type { Address, Invoice, InvoiceItem, InvoiceTaxes } from '../types';
import { databaseService } from './supabaseApi';
import { mapInvoice, realData, toInvoicePayload } from './realData';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CEP_DATABASE: Record<string, Omit<Address, 'number' | 'complement' | 'zipCode'>> = {
  '01310-100': { street: 'Avenida Paulista', neighborhood: 'Bela Vista', city: 'Sao Paulo', state: 'SP' },
  '22041-011': { street: 'Rua Figueiredo de Magalhaes', neighborhood: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ' },
  '30140-061': { street: 'Rua Sergipe', neighborhood: 'Savassi', city: 'Belo Horizonte', state: 'MG' },
  '52020-000': { street: 'Avenida Rui Barbosa', neighborhood: 'Gracas', city: 'Recife', state: 'PE' },
  '88015-000': { street: 'Rua Bocaiuva', neighborhood: 'Centro', city: 'Florianopolis', state: 'SC' },
};

export const cepService = {
  async fetchAddress(zipCode: string): Promise<Omit<Address, 'number' | 'complement' | 'zipCode'> | null> {
    await delay(300);
    const cleanCEP = zipCode.replace(/\D/g, '');
    const formattedCEP = cleanCEP.length === 8 ? `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}` : zipCode;
    return CEP_DATABASE[formattedCEP] || {
      street: 'Rua informada pelo CEP',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'UF'
    };
  }
};

export const cnpjService = {
  async fetchCompanyData(cnpj: string) {
    await delay(300);
    const cleanCnpj = cnpj.replace(/\D/g, '');
    return {
      companyName: cleanCnpj === '12345678000190' ? 'Pixel Comercio Digital LTDA' : 'Empresa Teste Solucoes LTDA',
      tradingName: cleanCnpj === '12345678000190' ? 'Pixel Digital' : 'Teste Solucoes',
      cnpj: cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'),
      stateRegistration: '888.777.666.555',
      municipalRegistration: '121314-5',
      taxRegime: 'Simples Nacional',
      cnaePrimary: '6201-5/01 - Desenvolvimento de programas de computador sob encomenda',
      email: 'contato@pixelconta.com.br',
      phone: '(81) 3456-7890',
      address: {
        zipCode: '52020-000',
        street: 'Avenida Rui Barbosa',
        number: '120',
        complement: 'Sala 301',
        neighborhood: 'Gracas',
        city: 'Recife',
        state: 'PE'
      }
    };
  }
};

export const invoiceService = {
  async emitInvoice(data: {
    type: 'NFS-e' | 'NF-e' | 'NFC-e';
    clientId: string;
    items: InvoiceItem[];
    taxes: InvoiceTaxes;
    observations?: string;
    taxRegime?: string;
    natureOfOperation?: string;
  }): Promise<Invoice> {
    const [companyId, clients, invoices] = await Promise.all([
      realData.activeCompanyId(),
      realData.clients(),
      realData.invoices(),
    ]);

    const client = clients.find(c => c.id === data.clientId);
    if (!client) throw new Error('Cliente nao encontrado no banco de dados.');
    if (!companyId) throw new Error('Empresa ativa nao encontrada.');

    const count = invoices.length + 1;
    const number = `0000${2046 + count}`;
    const accessKey = `352606123456780001905500100000${2046 + count}1987654329`;
    const issueDate = new Date().toISOString();
    const totalValue = data.items.reduce((sum, item) => sum + (item.value * item.quantity) - (item.discount || 0), 0);

    const savedInvoice = mapInvoice(await databaseService.create('invoices', toInvoicePayload({
      clientId: data.clientId,
      number,
      accessKey,
      type: data.type,
      issueDate,
      value: totalValue,
      status: 'authorized',
      origin: 'Emissao Manual',
      taxes: data.taxes,
      observations: data.observations,
      taxRegime: data.taxRegime || 'Simples Nacional',
      natureOfOperation: data.natureOfOperation || 'Prestacao de Servicos',
      pdfUrl: '#',
      xmlUrl: '#',
    }, companyId)));

    await Promise.all(data.items.map((item) => databaseService.create('invoice_items', {
      company_id: companyId,
      invoice_id: savedInvoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_value: item.value,
      discount_value: item.discount || 0,
      total_value: item.value * item.quantity - (item.discount || 0),
      cnae: item.cnae,
      ncm: item.ncm,
      cfop: item.cfop,
    })));

    const logs = [
      { timestamp: issueDate, message: 'Emissao manual iniciada', type: 'info' as const },
      { timestamp: issueDate, message: 'Dados validados com sucesso', type: 'info' as const },
      { timestamp: issueDate, message: `Nota fiscal numero ${number} autorizada com sucesso`, type: 'success' as const }
    ];

    await Promise.all([
      ...logs.map(log => databaseService.create('invoice_logs', {
        company_id: companyId,
        invoice_id: savedInvoice.id,
        message: log.message,
        type: log.type,
      })),
      databaseService.create('invoice_events', {
        company_id: companyId,
        invoice_id: savedInvoice.id,
        title: 'Autorizacao de Uso',
        description: 'Nota fiscal autorizada com sucesso.',
        event_date: issueDate,
      }),
      databaseService.update('clients', client.id, {
        total_invoices: client.totalInvoices + 1,
        total_spent: client.totalSpent + totalValue,
      }),
    ]);

    return {
      ...savedInvoice,
      clientName: client.name,
      clientDocument: client.document,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientAddress: client.address,
      items: data.items,
      logs,
      events: [{ date: issueDate, title: 'Autorizacao de Uso', description: 'Nota fiscal autorizada com sucesso.' }],
    };
  },

  async cancelInvoice(id: string, reason: string): Promise<Invoice> {
    const companyId = await realData.activeCompanyId();
    if (!companyId) throw new Error('Empresa ativa nao encontrada.');

    const updated = mapInvoice(await databaseService.update('invoices', id, {
      status: 'canceled',
      rejection_reason: reason,
    }));

    await Promise.all([
      databaseService.create('invoice_logs', {
        company_id: companyId,
        invoice_id: id,
        message: `Solicitacao de cancelamento enviada. Justificativa: ${reason}`,
        type: 'warning',
      }),
      databaseService.create('invoice_events', {
        company_id: companyId,
        invoice_id: id,
        title: 'Cancelamento homologado',
        description: `Cancelamento homologado. Justificativa: "${reason}"`,
        event_date: new Date().toISOString(),
      }),
    ]);

    return {
      ...updated,
      status: 'canceled',
      events: [
        ...updated.events,
        { date: new Date().toISOString(), title: 'Cancelamento homologado', description: `Cancelamento homologado. Justificativa: "${reason}"` }
      ],
    };
  }
};
