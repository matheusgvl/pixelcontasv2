import type { Address, Invoice, InvoiceItem, InvoiceTaxes } from '../types';
import { db } from '../mocks/db';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock CEP addresses database
const CEP_DATABASE: Record<string, Omit<Address, 'number' | 'complement' | 'zipCode'>> = {
  '01310-100': { street: 'Avenida Paulista', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
  '22041-011': { street: 'Rua Figueiredo de Magalhães', neighborhood: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ' },
  '30140-061': { street: 'Rua Sergipe', neighborhood: 'Savassi', city: 'Belo Horizonte', state: 'MG' },
  '52020-000': { street: 'Avenida Rui Barbosa', neighborhood: 'Graças', city: 'Recife', state: 'PE' },
  '88015-000': { street: 'Rua Bocaiúva', neighborhood: 'Centro', city: 'Florianópolis', state: 'SC' },
  '13010-000': { street: 'Rua Francisco Glicério', neighborhood: 'Centro', city: 'Campinas', state: 'SP' },
  '60165-090': { street: 'Avenida Dom Luís', neighborhood: 'Aldeota', city: 'Fortaleza', state: 'CE' },
  '04571-010': { street: 'Avenida Engenheiro Luís Carlos Berrini', neighborhood: 'Cidade Monções', city: 'São Paulo', state: 'SP' },
  '80420-010': { street: 'Rua Comendador Araújo', neighborhood: 'Centro', city: 'Curitiba', state: 'PR' },
  '05407-002': { street: 'Rua Cardoso de Almeida', neighborhood: 'Perdizes', city: 'São Paulo', state: 'SP' },
};

export const cepService = {
  async fetchAddress(zipCode: string): Promise<Omit<Address, 'number' | 'complement' | 'zipCode'> | null> {
    await delay(600); // simulate API response delay
    const cleanCEP = zipCode.replace(/\D/g, '');
    const formattedCEP = cleanCEP.length === 8 ? `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}` : zipCode;
    return CEP_DATABASE[formattedCEP] || {
      street: 'Rua Simulada do CEP',
      neighborhood: 'Bairro Novo',
      city: 'Cidade Mockada',
      state: 'PE'
    };
  }
};

export const cnpjService = {
  async fetchCompanyData(cnpj: string) {
    await delay(800);
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj === '12345678000190') {
      return {
        companyName: 'Pixel Comércio Digital LTDA',
        tradingName: 'Pixel Digital',
        cnpj: '12.345.678/0001-90',
        stateRegistration: '888.777.666.555',
        municipalRegistration: '121314-5',
        taxRegime: 'Simples Nacional',
        cnaePrimary: '6201-5/01 - Desenvolvimento de programas de computador sob encomenda',
        email: 'ricardo@pixelcontas.com.br',
        phone: '(81) 3456-7890',
        address: {
          zipCode: '52020-000',
          street: 'Avenida Rui Barbosa',
          number: '120',
          complement: 'Andar 3, Sala 301',
          neighborhood: 'Graças',
          city: 'Recife',
          state: 'PE'
        }
      };
    }
    
    return {
      companyName: 'Empresa Teste Soluções LTDA',
      tradingName: 'Teste Soluções',
      cnpj: cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"),
      taxRegime: 'Simples Nacional',
      cnaePrimary: '6202-3/00 - Desenvolvimento e licenciamento de programas de computador customizáveis',
      email: 'contato@empresateste.com.br',
      phone: '(11) 99888-7766',
      address: {
        zipCode: '01310-100',
        street: 'Avenida Paulista',
        number: '1500',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP'
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
    await delay(2000); // Simulate municipal/SEFAZ processing delay
    
    // Find client
    const client = db.clients.find(c => c.id === data.clientId);
    if (!client) {
      throw new Error('Cliente não encontrado no banco de dados.');
    }
    
    // Check for simulated rejection condition (e.g. if ISS is 5% and municipalCode is 1.01 and CNAE is 6201-5/01 as mock alert)
    const isStudioCriativoDevNote = client.id === 'cli-5' && data.taxes.iss === 5;
    if (isStudioCriativoDevNote) {
      throw new Error('Erro 403: Alíquota de ISS de 5% diverge do cadastro municipal para este CNAE (esperado 2%).');
    }
    
    const count = db.invoices.length + 1;
    const number = `0000${2046 + count}`;
    const accessKey = `352606123456780001905500100000${2046 + count}1987654329`;
    
    const totalValue = data.items.reduce((sum, item) => {
      const val = item.value * item.quantity;
      const desc = item.discount || 0;
      return sum + val - desc;
    }, 0);
    
    const newInvoice: Invoice = {
      id: `nf-generated-${count}`,
      number,
      accessKey,
      clientName: client.name,
      clientDocument: client.document,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientAddress: client.address,
      type: data.type,
      issueDate: new Date().toISOString(),
      value: totalValue,
      status: 'authorized',
      origin: 'Emissão Manual',
      items: data.items,
      taxes: data.taxes,
      observations: data.observations,
      taxRegime: data.taxRegime || 'Simples Nacional',
      natureOfOperation: data.natureOfOperation || 'Prestação de Serviços',
      logs: [
        { timestamp: new Date().toISOString(), message: 'Emissão manual iniciada por Ricardo Almeida', type: 'info' },
        { timestamp: new Date().toISOString(), message: 'Dados validados com sucesso', type: 'info' },
        { timestamp: new Date().toISOString(), message: 'Transmitindo lote para SEFAZ/Prefeitura...', type: 'info' },
        { timestamp: new Date().toISOString(), message: `Nota fiscal nº ${number} autorizada com sucesso`, type: 'success' }
      ],
      events: [
        { date: new Date().toISOString(), title: 'Autorização de Uso', description: 'Nota fiscal autorizada com sucesso na SEFAZ.' },
        { date: new Date().toISOString(), title: 'E-mail enviado', description: `PDF e XML enviados para ${client.email}.` }
      ],
      pdfUrl: '#',
      xmlUrl: '#'
    };
    
    // Add to mock db
    const currentInvoices = db.invoices;
    db.invoices = [newInvoice, ...currentInvoices];
    
    // Increment client billing
    const currentClients = db.clients;
    db.clients = currentClients.map(c => {
      if (c.id === client.id) {
        return {
          ...c,
          totalInvoices: c.totalInvoices + 1,
          totalSpent: c.totalSpent + totalValue
        };
      }
      return c;
    });
    
    return newInvoice;
  },
  
  async cancelInvoice(id: string, reason: string): Promise<Invoice> {
    await delay(1200);
    const invoices = db.invoices;
    let updatedInvoice: Invoice | null = null;
    
    const nextInvoices = invoices.map(inv => {
      if (inv.id === id) {
        updatedInvoice = {
          ...inv,
          status: 'canceled' as const,
          events: [
            ...inv.events,
            { date: new Date().toISOString(), title: 'Cancelamento homologado', description: `Cancelamento homologado. Justificativa: "${reason}"` }
          ],
          logs: [
            ...inv.logs,
            { timestamp: new Date().toISOString(), message: `Solicitação de cancelamento enviada. Justificativa: ${reason}`, type: 'warning' as const },
            { timestamp: new Date().toISOString(), message: 'Cancelamento homologado pelo órgão regulador', type: 'success' as const }
          ]
        };
        return updatedInvoice;
      }
      return inv;
    });
    
    if (!updatedInvoice) throw new Error('Nota fiscal não encontrada.');
    db.invoices = nextInvoices;
    return updatedInvoice;
  }
};
