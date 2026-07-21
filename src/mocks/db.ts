import type { Client, Product, Service, Invoice, Integration, Automation, Document, PendingTask, ChatMessage } from '../types';

// Mock Clients (10+)
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Mariana Souza',
    document: '123.456.789-00',
    type: 'PF',
    email: 'mariana.souza@email.com',
    phone: '(11) 98765-4321',
    address: {
      zipCode: '01310-100',
      street: 'Avenida Paulista',
      number: '1000',
      complement: 'Apto 151',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    },
    totalInvoices: 3,
    totalSpent: 450.00,
    status: 'active'
  },
  {
    id: 'cli-2',
    name: 'Loja Aurora LTDA',
    tradingName: 'Aurora Modas',
    document: '12.345.678/0001-00',
    type: 'PJ',
    stateRegistration: '111.222.333.444',
    municipalRegistration: '999888-7',
    email: 'financeiro@lojaaurora.com.br',
    phone: '(21) 3456-7890',
    address: {
      zipCode: '22041-011',
      street: 'Rua Figueiredo de Magalhães',
      number: '250',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ'
    },
    totalInvoices: 5,
    totalSpent: 12500.00,
    status: 'active'
  },
  {
    id: 'cli-3',
    name: 'Gabriel Ferreira',
    document: '987.654.321-11',
    type: 'PF',
    email: 'gabriel.ferreira@email.com',
    phone: '(31) 99123-4567',
    address: {
      zipCode: '30140-061',
      street: 'Rua Sergipe',
      number: '450',
      neighborhood: 'Savassi',
      city: 'Belo Horizonte',
      state: 'MG'
    },
    totalInvoices: 1,
    totalSpent: 99.90,
    status: 'active'
  },
  {
    id: 'cli-4',
    name: 'Academia Movimento LTDA',
    tradingName: 'Academia Movimento',
    document: '98.765.432/0001-99',
    type: 'PJ',
    stateRegistration: '555.666.777.888',
    email: 'contato@academiamovimento.com.br',
    phone: '(81) 3222-1111',
    address: {
      zipCode: '52020-000',
      street: 'Avenida Rui Barbosa',
      number: '800',
      neighborhood: 'Graças',
      city: 'Recife',
      state: 'PE'
    },
    totalInvoices: 4,
    totalSpent: 4200.00,
    status: 'active'
  },
  {
    id: 'cli-5',
    name: 'Studio Criativo ME',
    tradingName: 'Studio Criativo',
    document: '45.678.901/0001-22',
    type: 'PJ',
    municipalRegistration: '123456-2',
    email: 'hello@studiocriativo.design',
    phone: '(48) 98888-7777',
    address: {
      zipCode: '88015-000',
      street: 'Rua Bocaiúva',
      number: '1200',
      complement: 'Sala 402',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC'
    },
    totalInvoices: 2,
    totalSpent: 9600.00,
    status: 'active'
  },
  {
    id: 'cli-6',
    name: 'Carlos Santos',
    document: '444.555.666-77',
    type: 'PF',
    email: 'carlos.santos@email.com',
    phone: '(19) 99555-1234',
    address: {
      zipCode: '13010-000',
      street: 'Rua Francisco Glicério',
      number: '150',
      neighborhood: 'Centro',
      city: 'Campinas',
      state: 'SP'
    },
    totalInvoices: 1,
    totalSpent: 120.00,
    status: 'inactive'
  },
  {
    id: 'cli-7',
    name: 'Roberta Lima',
    document: '555.666.777-88',
    type: 'PF',
    email: 'roberta.lima@email.com',
    phone: '(85) 99444-5555',
    address: {
      zipCode: '60165-090',
      street: 'Avenida Dom Luís',
      number: '500',
      neighborhood: 'Aldeota',
      city: 'Fortaleza',
      state: 'CE'
    },
    totalInvoices: 2,
    totalSpent: 350.00,
    status: 'active'
  },
  {
    id: 'cli-8',
    name: 'Tech Soluções de TI LTDA',
    tradingName: 'Tech Soluções',
    document: '33.222.111/0001-44',
    type: 'PJ',
    stateRegistration: '444.333.222.111',
    email: 'contato@techsolucoes.com',
    phone: '(11) 4004-9900',
    address: {
      zipCode: '04571-010',
      street: 'Avenida Engenheiro Luís Carlos Berrini',
      number: '105',
      complement: 'Andar 12',
      neighborhood: 'Cidade Monções',
      city: 'São Paulo',
      state: 'SP'
    },
    totalInvoices: 2,
    totalSpent: 18000.00,
    status: 'active'
  },
  {
    id: 'cli-9',
    name: 'Confeitaria Doce Vida ME',
    tradingName: 'Doce Vida',
    document: '66.777.888/0001-99',
    type: 'PJ',
    email: 'pedidos@docevida.com.br',
    phone: '(41) 3322-4455',
    address: {
      zipCode: '80420-010',
      street: 'Rua Comendador Araújo',
      number: '300',
      neighborhood: 'Centro',
      city: 'Curitiba',
      state: 'PR'
    },
    totalInvoices: 0,
    totalSpent: 0,
    status: 'active'
  },
  {
    id: 'cli-10',
    name: 'Impacto Digital Marketing Ltda',
    tradingName: 'Impacto Agency',
    document: '77.888.999/0001-00',
    type: 'PJ',
    email: 'financeiro@impacto.agency',
    phone: '(11) 97766-5544',
    address: {
      zipCode: '05407-002',
      street: 'Rua Cardoso de Almeida',
      number: '820',
      neighborhood: 'Perdizes',
      city: 'São Paulo',
      state: 'SP'
    },
    totalInvoices: 1,
    totalSpent: 4500.00,
    status: 'active'
  }
];

// Mock Products (10)
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'E-book: Guia do Empreendedorismo Digital',
    code: 'EB001',
    sku: 'DIG-EB-001',
    ncm: '4901.99.00',
    cfopDefault: '5.102',
    unit: 'UN',
    value: 49.90,
    stock: 9999, // digital item
    status: 'active'
  },
  {
    id: 'prod-2',
    name: 'Curso Online: Automação Fiscal Pro',
    code: 'CR002',
    sku: 'DIG-CR-002',
    ncm: '8523.49.90',
    cfopDefault: '5.102',
    unit: 'UN',
    value: 299.00,
    stock: 9999,
    status: 'active'
  },
  {
    id: 'prod-3',
    name: 'Camiseta Algodão Egípcio - Azul Pixel',
    code: 'TS003',
    sku: 'PHY-TS-003-M',
    ncm: '6109.10.00',
    cfopDefault: '5.102',
    unit: 'UN',
    value: 89.90,
    stock: 120,
    status: 'active'
  },
  {
    id: 'prod-4',
    name: 'Planner Físico Executivo 2026',
    code: 'PL004',
    sku: 'PHY-PL-004',
    ncm: '4820.10.00',
    cfopDefault: '5.102',
    unit: 'UN',
    value: 119.00,
    stock: 45,
    status: 'active'
  },
  {
    id: 'prod-5',
    name: 'Caneca Cerâmica Cobre Digital',
    code: 'CN005',
    sku: 'PHY-CN-005',
    ncm: '6912.00.00',
    cfopDefault: '5.102',
    unit: 'UN',
    value: 39.90,
    stock: 80,
    status: 'active'
  },
  {
    id: 'prod-6',
    name: 'Licença de Software PixelConta API',
    code: 'SW006',
    sku: 'DIG-SW-006',
    ncm: '8523.49.90',
    cfopDefault: '5.102',
    unit: 'UN',
    value: 1200.00,
    stock: 9999,
    status: 'active'
  },
  {
    id: 'prod-7',
    name: 'Garrafa Térmica Inox Premium 500ml',
    code: 'GF007',
    sku: 'PHY-GF-007',
    ncm: '9617.00.10',
    cfopDefault: '5.102',
    unit: 'UN',
    value: 149.90,
    stock: 15,
    status: 'active'
  },
  {
    id: 'prod-8',
    name: 'Mousepad Gamer Extra Grande Pixel',
    code: 'MP008',
    sku: 'PHY-MP-008',
    ncm: '4016.10.10',
    cfopDefault: '5.102',
    unit: 'UN',
    value: 79.90,
    stock: 250,
    status: 'active'
  },
  {
    id: 'prod-9',
    name: 'Mentoria em Grupo: Escala Contábil',
    code: 'MN009',
    sku: 'DIG-MN-009',
    ncm: '8523.49.90',
    cfopDefault: '5.102',
    unit: 'UN',
    value: 1999.00,
    stock: 10,
    status: 'active'
  },
  {
    id: 'prod-10',
    name: 'Kit de Adesivos PixelConta (5 un)',
    code: 'AD010',
    sku: 'PHY-AD-010',
    ncm: '3919.90.00',
    cfopDefault: '5.102',
    unit: 'PCT',
    value: 15.00,
    stock: 500,
    status: 'inactive'
  }
];

// Mock Services (10)
const INITIAL_SERVICES: Service[] = [
  {
    id: 'serv-1',
    name: 'Desenvolvimento de Software Customizado',
    internalCode: 'DEV001',
    municipalCode: '1.01',
    cnae: '6201-5/01',
    issRate: 5,
    defaultValue: 4500.00,
    city: 'Recife - PE',
    status: 'active'
  },
  {
    id: 'serv-2',
    name: 'Consultoria Técnica em Tecnologia da Informação',
    internalCode: 'CONS002',
    municipalCode: '1.03',
    cnae: '6204-0/00',
    issRate: 3,
    defaultValue: 3000.00,
    city: 'Recife - PE',
    status: 'active'
  },
  {
    id: 'serv-3',
    name: 'Design de Interface de Usuário (UI/UX)',
    internalCode: 'DSG003',
    municipalCode: '1.05',
    cnae: '6201-5/02',
    issRate: 2,
    defaultValue: 2500.00,
    city: 'Recife - PE',
    status: 'active'
  },
  {
    id: 'serv-4',
    name: 'Planejamento Financeiro Empresarial',
    internalCode: 'FIN004',
    municipalCode: '17.06',
    cnae: '7020-4/00',
    issRate: 4,
    defaultValue: 1500.00,
    city: 'Recife - PE',
    status: 'active'
  },
  {
    id: 'serv-5',
    name: 'Otimização de Mecanismos de Busca (SEO)',
    internalCode: 'SEO005',
    municipalCode: '17.06',
    cnae: '7319-0/03',
    issRate: 5,
    defaultValue: 1800.00,
    city: 'Recife - PE',
    status: 'active'
  },
  {
    id: 'serv-6',
    name: 'Redação de Conteúdo e Copywriting',
    internalCode: 'CPY006',
    municipalCode: '17.06',
    cnae: '9001-9/06',
    issRate: 2,
    defaultValue: 1200.00,
    city: 'Recife - PE',
    status: 'active'
  },
  {
    id: 'serv-7',
    name: 'Arquitetura de Nuvem (Cloud Architecture)',
    internalCode: 'CLD007',
    municipalCode: '1.01',
    cnae: '6201-5/01',
    issRate: 5,
    defaultValue: 6000.00,
    city: 'Recife - PE',
    status: 'active'
  },
  {
    id: 'serv-8',
    name: 'Assessoria de Planejamento Tributário',
    internalCode: 'TAX008',
    municipalCode: '17.01',
    cnae: '6920-6/01',
    issRate: 5,
    defaultValue: 2500.00,
    city: 'Recife - PE',
    status: 'active'
  },
  {
    id: 'serv-9',
    name: 'Gestão de Redes Sociais e Tráfego',
    internalCode: 'MKT009',
    municipalCode: '17.06',
    cnae: '7311-9/00',
    issRate: 3,
    defaultValue: 2000.00,
    city: 'Recife - PE',
    status: 'active'
  },
  {
    id: 'serv-10',
    name: 'Tradução Técnica e Juramentada',
    internalCode: 'TRD010',
    municipalCode: '17.02',
    cnae: '7490-1/01',
    issRate: 2,
    defaultValue: 800.00,
    city: 'Recife - PE',
    status: 'inactive'
  }
];

// Mock Invoices (20+)
const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'nf-1',
    number: '00002041',
    accessKey: '35260612345678000190550010000020411987654321',
    clientName: 'Loja Aurora LTDA',
    clientDocument: '12.345.678/0001-00',
    clientEmail: 'financeiro@lojaaurora.com.br',
    type: 'NF-e',
    issueDate: '2026-07-09T14:32:00-03:00',
    value: 2500.00,
    status: 'authorized',
    origin: 'Shopify',
    items: [
      { description: 'Planner Físico Executivo 2026', quantity: 20, value: 119.00, ncm: '4820.10.00', cfop: '5.102' },
      { description: 'Caneca Cerâmica Cobre Digital', quantity: 3, value: 39.90, ncm: '6912.00.00', cfop: '5.102' }
    ],
    taxes: { icms: 450.00, pis: 41.25, cofins: 190.00 },
    logs: [
      { timestamp: '2026-07-09T14:30:15-03:00', message: 'Pedido recebido via webhook Shopify', type: 'info' },
      { timestamp: '2026-07-09T14:31:02-03:00', message: 'Dados da nota estruturados e validados', type: 'info' },
      { timestamp: '2026-07-09T14:31:45-03:00', message: 'Assinatura digital com certificado A1 efetuada', type: 'info' },
      { timestamp: '2026-07-09T14:32:00-03:00', message: 'Nota fiscal autorizada pelo SEFAZ/RJ', type: 'success' }
    ],
    events: [
      { date: '2026-07-09T14:32:00-03:00', title: 'Autorização de Uso', description: 'Nota fiscal autorizada com sucesso na SEFAZ.' },
      { date: '2026-07-09T14:32:10-03:00', title: 'E-mail enviado', description: 'PDF e XML enviados para financeiro@lojaaurora.com.br.' }
    ]
  },
  {
    id: 'nf-2',
    number: '00002042',
    accessKey: '35260612345678000190550010000020421987654322',
    clientName: 'Mariana Souza',
    clientDocument: '123.456.789-00',
    clientEmail: 'mariana.souza@email.com',
    type: 'NFS-e',
    issueDate: '2026-07-09T16:10:00-03:00',
    value: 299.00,
    status: 'authorized',
    origin: 'Hotmart',
    items: [
      { description: 'Curso Online: Automação Fiscal Pro', quantity: 1, value: 299.00, cnae: '8523.49.90' }
    ],
    taxes: { iss: 14.95, issRetained: false },
    logs: [
      { timestamp: '2026-07-09T16:08:00-03:00', message: 'Transação aprovada na Hotmart', type: 'info' },
      { timestamp: '2026-07-09T16:10:00-03:00', message: 'NFS-e emitida e autorizada pela Prefeitura de Recife', type: 'success' }
    ],
    events: [
      { date: '2026-07-09T16:10:00-03:00', title: 'NFS-e Gerada', description: 'Recibo Provisório de Serviços convertido em NFS-e.' }
    ]
  },
  {
    id: 'nf-3',
    number: '00002043',
    accessKey: '35260612345678000190550010000020431987654323',
    clientName: 'Gabriel Ferreira',
    clientDocument: '987.654.321-11',
    clientEmail: 'gabriel.ferreira@email.com',
    type: 'NFS-e',
    issueDate: '2026-07-09T18:22:00-03:00',
    value: 99.90,
    status: 'authorized',
    origin: 'Kiwify',
    items: [
      { description: 'E-book: Guia do Empreendedorismo Digital', quantity: 2, value: 49.95 }
    ],
    taxes: { iss: 4.99 },
    logs: [
      { timestamp: '2026-07-09T18:22:00-03:00', message: 'NFS-e gerada via automação Kiwify', type: 'success' }
    ],
    events: [
      { date: '2026-07-09T18:22:00-03:00', title: 'Autorizada', description: 'Nota homologada pelo município.' }
    ]
  },
  {
    id: 'nf-4',
    number: '00002044',
    clientName: 'Academia Movimento LTDA',
    clientDocument: '98.765.432/0001-99',
    type: 'NFS-e',
    issueDate: '2026-07-10T09:00:00-03:00',
    value: 1200.00,
    status: 'processing',
    origin: 'Emissão Manual',
    items: [
      { description: 'Assessoria de Planejamento Tributário', quantity: 1, value: 1200.00, cnae: '6920-6/01' }
    ],
    taxes: { iss: 60.00, ir: 18.00, csll: 12.00 },
    logs: [
      { timestamp: '2026-07-10T09:00:00-03:00', message: 'Emissão manual iniciada por Ricardo Almeida', type: 'info' },
      { timestamp: '2026-07-10T09:00:05-03:00', message: 'Transmitindo dados para a prefeitura...', type: 'info' }
    ],
    events: []
  },
  {
    id: 'nf-5',
    number: '00002045',
    clientName: 'Studio Criativo ME',
    clientDocument: '45.678.901/0001-22',
    clientEmail: 'hello@studiocriativo.design',
    type: 'NFS-e',
    issueDate: '2026-07-10T09:15:00-03:00',
    value: 4500.00,
    status: 'rejected',
    origin: 'Emissão Manual',
    items: [
      { description: 'Desenvolvimento de Software Customizado', quantity: 1, value: 4500.00, cnae: '6201-5/01' }
    ],
    taxes: { iss: 225.00 },
    logs: [
      { timestamp: '2026-07-10T09:15:00-03:00', message: 'Envio rejeitado pelo servidor municipal', type: 'error' },
      { timestamp: '2026-07-10T09:15:02-03:00', message: 'Erro 403: Alíquota de ISS de 5% diverge do cadastro municipal para este CNAE (esperado 2%).', type: 'error' }
    ],
    events: [
      { date: '2026-07-10T09:15:02-03:00', title: 'Rejeição', description: 'Erro retornado pela prefeitura. Necessário ajuste de alíquota.' }
    ]
  },
  {
    id: 'nf-6',
    number: '00002036',
    accessKey: '35260612345678000190550010000020361987654316',
    clientName: 'Carlos Santos',
    clientDocument: '444.555.666-77',
    type: 'NFC-e',
    issueDate: '2026-07-08T11:20:00-03:00',
    value: 120.00,
    status: 'canceled',
    origin: 'WooCommerce',
    items: [
      { description: 'Camiseta Algodão Egípcio - Azul Pixel', quantity: 1, value: 89.90 },
      { description: 'Caneca Cerâmica Cobre Digital', quantity: 1, value: 30.10 }
    ],
    taxes: { icms: 21.60 },
    logs: [
      { timestamp: '2026-07-08T11:20:00-03:00', message: 'NFC-e emitida no PDV online', type: 'success' },
      { timestamp: '2026-07-08T11:45:00-03:00', message: 'Cancelamento homologado pelo SEFAZ. Motivo: Devolução de mercadoria.', type: 'warning' }
    ],
    events: [
      { date: '2026-07-08T11:20:00-03:00', title: 'Emissão', description: 'Nota emitida e cupom gerado.' },
      { date: '2026-07-08T11:45:00-03:00', title: 'Cancelamento', description: 'Homologação de cancelamento efetuada pela SEFAZ.' }
    ]
  },
  {
    id: 'nf-7',
    number: '00002046',
    clientName: 'Tech Soluções de TI LTDA',
    clientDocument: '33.222.111/0001-44',
    type: 'NFS-e',
    issueDate: '2026-07-10T11:00:00-03:00',
    value: 9000.00,
    status: 'waiting',
    origin: 'Asaas',
    items: [
      { description: 'Arquitetura de Nuvem (Cloud Architecture)', quantity: 1, value: 9000.00 }
    ],
    taxes: { iss: 450.00, ir: 135.00, csll: 90.00, pis: 58.50, cofins: 270.00 },
    logs: [
      { timestamp: '2026-07-10T11:00:00-03:00', message: 'Nota agendada aguardando confirmação de pagamento do boleto no Asaas', type: 'info' }
    ],
    events: []
  },
  // Adding remaining 13 mock invoices to total 20+
  ...Array.from({ length: 13 }).map((_, index) => {
    const ids = index + 8;
    const isEven = ids % 2 === 0;
    const value = Math.round((Math.random() * 800 + 50) * 100) / 100;
    const clients = [
      { name: 'Loja Aurora LTDA', doc: '12.345.678/0001-00' },
      { name: 'Mariana Souza', doc: '123.456.789-00' },
      { name: 'Roberta Lima', doc: '555.666.777-88' },
      { name: 'Academia Movimento LTDA', doc: '98.765.432/0001-99' },
      { name: 'Tech Soluções de TI LTDA', doc: '33.222.111/0001-44' }
    ];
    const client = clients[ids % clients.length];
    const origins = ['Hotmart', 'Kiwify', 'Shopify', 'Mercado Pago', 'Stripe'];
    const origin = origins[ids % origins.length];
    
    return {
      id: `nf-${ids}`,
      number: `0000${2046 + ids}`,
      accessKey: `352606123456780001905500100000${2046 + ids}1987654329`,
      clientName: client.name,
      clientDocument: client.doc,
      type: isEven ? 'NF-e' as const : 'NFS-e' as const,
      issueDate: new Date(Date.now() - (ids * 24 * 60 * 60 * 1000)).toISOString(),
      value,
      status: 'authorized' as const,
      origin,
      items: [
        { description: `Serviço ou Produto Fictício Ref #${ids}`, quantity: 1, value }
      ],
      taxes: { iss: isEven ? undefined : value * 0.05, icms: isEven ? value * 0.18 : undefined },
      logs: [
        { timestamp: new Date(Date.now() - (ids * 24 * 60 * 60 * 1000)).toISOString(), message: 'Nota emitida automaticamente por webhook', type: 'success' as const }
      ],
      events: []
    };
  })
];

// Mock Integrations (6)
const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'int-1',
    name: 'Hotmart',
    category: 'infoproduto',
    description: 'Importação automática de vendas e emissão de NFS-e para cursos e e-books.',
    status: 'connected',
    lastSync: '2026-07-10T11:45:00-03:00',
    config: { autoEmit: true, invoiceType: 'NFS-e', sendEmailAutomatically: true }
  },
  {
    id: 'int-2',
    name: 'Kiwify',
    category: 'infoproduto',
    description: 'Emissão automática de notas para vendas de infoprodutos e assinaturas.',
    status: 'connected',
    lastSync: '2026-07-10T11:30:00-03:00',
    config: { autoEmit: true, invoiceType: 'NFS-e', sendEmailAutomatically: true }
  },
  {
    id: 'int-3',
    name: 'Shopify',
    category: 'ecommerce',
    description: 'Sincronização de pedidos e emissão de NF-e/NFC-e para produtos físicos.',
    status: 'connected',
    lastSync: '2026-07-10T11:15:00-03:00',
    config: { autoEmit: true, invoiceType: 'NF-e', series: '1', sendEmailAutomatically: false }
  },
  {
    id: 'int-4',
    name: 'Stripe',
    category: 'payment',
    description: 'Emissão de notas fiscais a partir de cobranças internacionais e recorrentes.',
    status: 'attention',
    lastSync: '2026-07-09T23:00:00-03:00',
    config: { autoEmit: false, invoiceType: 'NFS-e' }
  },
  {
    id: 'int-5',
    name: 'Asaas',
    category: 'payment',
    description: 'Emissão de notas fiscais vinculada à liquidação de boletos, PIX e cartões.',
    status: 'connected',
    lastSync: '2026-07-10T10:00:00-03:00',
    config: { autoEmit: true, invoiceType: 'NFS-e', sendEmailAutomatically: true }
  },
  {
    id: 'int-6',
    name: 'WooCommerce',
    category: 'ecommerce',
    description: 'Integração direta com sua loja WordPress para faturamento de pedidos.',
    status: 'disconnected',
    config: { autoEmit: false }
  }
];

// Mock Automations (5)
const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'aut-1',
    name: 'Emissão Hotmart — Automação Geral',
    trigger: 'Venda aprovada',
    conditions: { platform: 'Hotmart' },
    actions: { type: 'emit_invoice' },
    status: 'active',
    lastExecution: '2026-07-09T16:10:00-03:00',
    totalExecutions: 145,
    successRate: 99.3,
    errorHistory: [
      { date: '2026-06-12T10:20:00-03:00', message: 'Erro de CNPJ inválido do cliente Mariana Costa' }
    ]
  },
  {
    id: 'aut-2',
    name: 'Emissão e Envio Automático Shopify',
    trigger: 'Pedido pago',
    conditions: { platform: 'Shopify' },
    actions: { type: 'emit_invoice' },
    status: 'active',
    lastExecution: '2026-07-09T14:32:00-03:00',
    totalExecutions: 87,
    successRate: 96.5,
    errorHistory: [
      { date: '2026-07-01T15:30:00-03:00', message: 'SEFAZ de destino indisponível para envio da NF-e' }
    ]
  },
  {
    id: 'aut-3',
    name: 'Cobranças Asaas -> NFS-e na compensação',
    trigger: 'Pagamento confirmado',
    conditions: { platform: 'Asaas' },
    actions: { type: 'emit_invoice' },
    status: 'active',
    lastExecution: '2026-07-10T10:00:00-03:00',
    totalExecutions: 32,
    successRate: 100.0,
    errorHistory: []
  },
  {
    id: 'aut-4',
    name: 'Automação Kiwify - Enviar e-mail com PDF',
    trigger: 'Venda aprovada',
    conditions: { platform: 'Kiwify' },
    actions: { type: 'send_email', template: 'Template NFS-e Cliente' },
    status: 'active',
    lastExecution: '2026-07-09T18:22:00-03:00',
    totalExecutions: 212,
    successRate: 98.7,
    errorHistory: [
      { date: '2026-07-04T12:00:00-03:00', message: 'E-mail rejeitado pelo servidor de destino (bounce)' }
    ]
  },
  {
    id: 'aut-5',
    name: 'Regra Especial: Serviços acima de R$ 5.000',
    trigger: 'Pedido criado',
    conditions: { valueMin: 5000 },
    actions: { type: 'notify' },
    status: 'paused',
    totalExecutions: 4,
    successRate: 100.0,
    errorHistory: []
  }
];

// Mock Documents (8)
const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    name: 'NF-e_Emitidas_06-2026.zip',
    category: 'invoice',
    competence: '06/2026',
    status: 'sent',
    uploadDate: '2026-07-02T10:00:00-03:00',
    sender: 'Ricardo Almeida',
    size: '4.2 MB'
  },
  {
    id: 'doc-2',
    name: 'Extrato_Bancario_Itau_06-2026.pdf',
    category: 'bank_statement',
    competence: '06/2026',
    status: 'sent',
    uploadDate: '2026-07-03T14:22:00-03:00',
    sender: 'Ricardo Almeida',
    size: '1.8 MB'
  },
  {
    id: 'doc-3',
    name: 'Contrato_Prestacao_Servicos_TechSolucoes.pdf',
    category: 'contract',
    competence: '07/2026',
    status: 'reviewed',
    uploadDate: '2026-07-05T09:15:00-03:00',
    sender: 'Ricardo Almeida',
    size: '850 KB'
  },
  {
    id: 'doc-4',
    name: 'Folha_Pagamento_Prolabore_06-2026.pdf',
    category: 'payroll',
    competence: '06/2026',
    status: 'sent',
    uploadDate: '2026-07-01T17:40:00-03:00',
    sender: 'Contador Pixel',
    size: '420 KB'
  },
  {
    id: 'doc-5',
    name: 'Comprovante_Pagamento_DAS_05-2026.pdf',
    category: 'receipt',
    competence: '05/2026',
    status: 'reviewed',
    uploadDate: '2026-06-20T11:00:00-03:00',
    sender: 'Ricardo Almeida',
    size: '320 KB'
  },
  {
    id: 'doc-6',
    name: 'Alteracao_Contratual_Consolidada.pdf',
    category: 'corporate',
    competence: '05/2026',
    status: 'reviewed',
    uploadDate: '2026-05-15T15:00:00-03:00',
    sender: 'Ricardo Almeida',
    size: '2.5 MB'
  },
  {
    id: 'doc-7',
    name: 'Extrato_Bancario_Inter_06-2026.pdf',
    category: 'bank_statement',
    competence: '06/2026',
    status: 'pending',
    uploadDate: '2026-07-10T10:15:00-03:00',
    sender: 'Ricardo Almeida',
    size: '1.2 MB'
  },
  {
    id: 'doc-8',
    name: 'Comprovante_Energia_Sede_06-2026.jpg',
    category: 'others',
    competence: '06/2026',
    status: 'sent',
    uploadDate: '2026-07-08T09:30:00-03:00',
    sender: 'Ricardo Almeida',
    size: '1.4 MB'
  }
];

// Mock Pending Tasks (6)
const INITIAL_PENDINGS: PendingTask[] = [
  {
    id: 'pend-1',
    title: 'Enviar Extrato Bancário Inter (06/2026)',
    description: 'Necessário para fechar a conciliação bancária do mês de Junho.',
    dueDate: '2026-07-12',
    priority: 'high',
    status: 'pending',
    responsible: 'Ricardo Almeida'
  },
  {
    id: 'pend-2',
    title: 'Vencimento Guia DAS (Simples Nacional)',
    description: 'Valor estimado: R$ 850,22. Realizar o pagamento da guia e anexar comprovante.',
    dueDate: '2026-07-20',
    priority: 'high',
    status: 'pending',
    responsible: 'Ricardo Almeida'
  },
  {
    id: 'pend-3',
    title: 'Cadastrar Certificado Digital A1',
    description: 'Seu certificado digital atual expira em 15 dias. Faça o upload do novo arquivo .pfx.',
    dueDate: '2026-07-25',
    priority: 'medium',
    status: 'pending',
    responsible: 'Ricardo Almeida'
  },
  {
    id: 'pend-4',
    title: 'Corrigir NFS-e Rejeitada (Studio Criativo)',
    description: 'Prefeitura rejeitou devido à alíquota incorreta de ISS. Corrigir para 2% e reemitir.',
    dueDate: '2026-07-15',
    priority: 'high',
    status: 'pending',
    responsible: 'Ricardo Almeida'
  },
  {
    id: 'pend-5',
    title: 'Assinar Contrato de Assessoria Anual',
    description: 'Contrato atualizado enviado pelo contador. Assinatura digital necessária.',
    dueDate: '2026-07-18',
    priority: 'low',
    status: 'pending',
    responsible: 'Ricardo Almeida'
  },
  {
    id: 'pend-6',
    title: 'Confirmar CNAE de Consultoria',
    description: 'Contador solicita confirmação se o novo serviço faturado se enquadra no CNAE cadastrado.',
    dueDate: '2026-07-14',
    priority: 'medium',
    status: 'pending',
    responsible: 'Ricardo Almeida'
  }
];

// Mock Chat Messages
const INITIAL_CHAT: ChatMessage[] = [
  { id: 'msg-1', sender: 'accountant', text: 'Olá, Ricardo! Sou a Helena, sua contadora responsável aqui na PixelConta. Como posso te ajudar hoje?', timestamp: '2026-07-09T09:00:00-03:00' },
  { id: 'msg-2', sender: 'client', text: 'Olá, Helena! Tudo bem? Estou com uma dúvida sobre a rejeição da nota do Studio Criativo.', timestamp: '2026-07-10T09:20:00-03:00' },
  { id: 'msg-3', sender: 'accountant', text: 'Tudo ótimo por aqui! Dei uma olhada no sistema e vi que a nota fiscal nº 2045 foi rejeitada porque foi aplicada a alíquota padrão de 5%. A sua empresa tem um benefício municipal em Recife que reduz essa alíquota para 2% em serviços de desenvolvimento de software. Eu já deixei tudo pronto para você reemitir. Basta ajustar para 2% no campo de ISS do passo de tributação ou corrigir a nota rejeitada diretamente.', timestamp: '2026-07-10T09:25:00-03:00' },
  { id: 'msg-4', sender: 'client', text: 'Perfeito, Helena! Muito obrigado pela ajuda rápida. Vou fazer a correção agora mesmo.', timestamp: '2026-07-10T09:27:00-03:00' }
];

// Database Class for simulating persistent storage
class PixelDatabase {
  private get<T>(key: string, defaults: T): T {
    const data = localStorage.getItem(`pixelconta_${key}`);
    return data ? JSON.parse(data) : defaults;
  }

  private set<T>(key: string, value: T): void {
    localStorage.setItem(`pixelconta_${key}`, JSON.stringify(value));
  }

  get clients(): Client[] { return this.get('clients', INITIAL_CLIENTS); }
  set clients(v: Client[]) { this.set('clients', v); }

  get products(): Product[] { return this.get('products', INITIAL_PRODUCTS); }
  set products(v: Product[]) { this.set('products', v); }

  get services(): Service[] { return this.get('services', INITIAL_SERVICES); }
  set services(v: Service[]) { this.set('services', v); }

  get invoices(): Invoice[] { return this.get('invoices', INITIAL_INVOICES); }
  set invoices(v: Invoice[]) { this.set('invoices', v); }

  get integrations(): Integration[] { return this.get('integrations', INITIAL_INTEGRATIONS); }
  set integrations(v: Integration[]) { this.set('integrations', v); }

  get automations(): Automation[] { return this.get('automations', INITIAL_AUTOMATIONS); }
  set automations(v: Automation[]) { this.set('automations', v); }

  get documents(): Document[] { return this.get('documents', INITIAL_DOCUMENTS); }
  set documents(v: Document[]) { this.set('documents', v); }

  get pendings(): PendingTask[] { return this.get('pendings', INITIAL_PENDINGS); }
  set pendings(v: PendingTask[]) { this.set('pendings', v); }

  get chatMessages(): ChatMessage[] { return this.get('chat', INITIAL_CHAT); }
  set chatMessages(v: ChatMessage[]) { this.set('chat', v); }

  // Initial Configuration
  reset() {
    this.clients = INITIAL_CLIENTS;
    this.products = INITIAL_PRODUCTS;
    this.services = INITIAL_SERVICES;
    this.invoices = INITIAL_INVOICES;
    this.integrations = INITIAL_INTEGRATIONS;
    this.automations = INITIAL_AUTOMATIONS;
    this.documents = INITIAL_DOCUMENTS;
    this.pendings = INITIAL_PENDINGS;
    this.chatMessages = INITIAL_CHAT;
  }
}

export const db = new PixelDatabase();
export { INITIAL_CLIENTS };
