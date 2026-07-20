export interface Address {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Client {
  id: string;
  name: string;
  tradingName?: string;
  document: string; // CPF or CNPJ
  type: 'PF' | 'PJ';
  stateRegistration?: string;
  municipalRegistration?: string;
  email: string;
  phone: string;
  address: Address;
  notes?: string;
  totalInvoices: number;
  totalSpent: number;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  name: string;
  code: string;
  sku: string;
  ncm: string;
  cfopDefault: string;
  unit: string;
  value: number;
  stock: number;
  status: 'active' | 'inactive';
}

export interface Service {
  id: string;
  name: string;
  internalCode: string;
  municipalCode: string;
  cnae: string;
  issRate: number; // percentage, e.g., 5 for 5%
  defaultValue: number;
  city: string;
  status: 'active' | 'inactive';
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  value: number;
  discount?: number;
  cnae?: string; // for services
  ncm?: string; // for products
  cfop?: string; // for products
}

export interface InvoiceTaxes {
  iss?: number;
  icms?: number;
  pis?: number;
  cofins?: number;
  inss?: number;
  ir?: number;
  csll?: number;
  issRetained?: boolean;
}

export interface InvoiceLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface InvoiceEvent {
  date: string;
  title: string;
  description: string;
}

export interface Invoice {
  id: string;
  number: string;
  accessKey?: string;
  clientName: string;
  clientDocument: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: Address;
  type: 'NFS-e' | 'NF-e' | 'NFC-e';
  issueDate: string;
  value: number;
  status: 'authorized' | 'processing' | 'waiting' | 'rejected' | 'canceled';
  origin: string; // e.g. Hotmart, Kiwify, WooCommerce, Emissão Manual
  items: InvoiceItem[];
  taxes: InvoiceTaxes;
  logs: InvoiceLog[];
  events: InvoiceEvent[];
  observations?: string;
  natureOfOperation?: string;
  taxRegime?: string;
  xmlUrl?: string;
  pdfUrl?: string;
}

export interface Integration {
  id: string;
  name: string;
  category: 'infoproduto' | 'ecommerce' | 'payment' | 'marketplace' | 'crm' | 'api';
  description: string;
  status: 'connected' | 'disconnected' | 'attention' | 'syncing';
  lastSync?: string;
  config?: {
    apiKey?: string;
    webhookUrl?: string;
    invoiceType?: 'NFS-e' | 'NF-e' | 'NFC-e';
    defaultProductOrServiceId?: string;
    series?: string;
    natureOfOperation?: string;
    sendEmailAutomatically?: boolean;
    autoEmit?: boolean;
  };
}

export interface Automation {
  id: string;
  name: string;
  trigger: string; // e.g., 'venda_aprovada'
  conditions: {
    platform?: string;
    productId?: string;
    valueMin?: number;
    paymentMethod?: string;
  };
  actions: {
    type: 'emit_invoice' | 'send_email' | 'add_client' | 'notify';
    template?: string;
  };
  status: 'active' | 'paused';
  lastExecution?: string;
  totalExecutions: number;
  successRate: number; // e.g., 98
  errorHistory: {
    date: string;
    message: string;
  }[];
}

export interface Document {
  id: string;
  name: string;
  category: 'invoice' | 'bank_statement' | 'receipt' | 'contract' | 'payroll' | 'corporate' | 'others';
  competence: string; // e.g. '06/2026'
  status: 'sent' | 'pending' | 'reviewed';
  uploadDate: string;
  sender: string;
  size: string;
}

export interface PendingTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'resolved';
  responsible: string;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'accountant';
  text: string;
  timestamp: string;
  file?: {
    name: string;
    size: string;
    url: string;
  };
}
