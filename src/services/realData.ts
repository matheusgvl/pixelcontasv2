import type {
  Automation,
  ChatMessage,
  Client,
  Document,
  Integration,
  Invoice,
  InvoiceEvent,
  InvoiceItem,
  InvoiceLog,
  PendingTask,
  Product,
  Service,
} from '../types';
import { databaseService } from './supabaseApi';

type DbRow = Record<string, any>;

const asArray = <T = DbRow>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

export interface WebhookEvent {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  status: 'received' | 'processing' | 'processed' | 'ignored' | 'failed';
  createdAt: string;
  processedAt?: string;
  errorMessage?: string;
  normalizedPayload: {
    buyer?: {
      name?: string;
      email?: string;
    };
    product?: {
      name?: string;
    };
    grossValue?: number;
    netValue?: number;
  };
  processingResult?: {
    sale_id?: string;
    client_id?: string;
    automations?: {
      matched_count?: number;
      ignored_count?: number;
    };
  };
}

export interface CompanySettings {
  id: string;
  legalName: string;
  tradingName: string;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
  taxRegime: string;
  cnaePrimary: string;
  email: string;
  phone: string;
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  certificateStatus: string;
  status: string;
}

export function mapCompany(row: DbRow): CompanySettings {
  const address = row.address || {};
  return {
    id: row.id,
    legalName: row.legal_name || '',
    tradingName: row.trade_name || '',
    cnpj: row.cnpj || '',
    stateRegistration: row.state_registration || '',
    municipalRegistration: row.municipal_registration || '',
    taxRegime: row.tax_regime || 'Simples Nacional',
    cnaePrimary: row.cnae_primary || '',
    email: row.email || '',
    phone: row.phone || '',
    address: {
      zipCode: address.zipCode || '',
      street: address.street || '',
      number: address.number || '',
      complement: address.complement || '',
      neighborhood: address.neighborhood || '',
      city: address.city || '',
      state: address.state || '',
    },
    certificateStatus: row.certificate_status || 'missing',
    status: row.status || 'active',
  };
}

export function toCompanyPayload(company: Partial<CompanySettings>) {
  return {
    legal_name: company.legalName,
    trade_name: company.tradingName,
    cnpj: company.cnpj,
    state_registration: company.stateRegistration,
    municipal_registration: company.municipalRegistration,
    tax_regime: company.taxRegime,
    cnae_primary: company.cnaePrimary,
    email: company.email,
    phone: company.phone,
    address: company.address,
  };
}

export interface TaxSettings {
  id: string;
  companyId: string;
  name: string;
  invoiceType: 'NFS-e' | 'NF-e' | 'NFC-e';
  taxRegime: string;
  natureOfOperation: string;
  serviceCity: string;
  series: string;
  initialNumber: string;
  environment: string;
  status: 'active' | 'inactive';
}

export function mapTaxSettings(row: DbRow): TaxSettings {
  const settings = row.settings || {};
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name || 'Configuracao fiscal padrao',
    invoiceType: row.invoice_type || 'NFS-e',
    taxRegime: row.tax_regime || 'Simples Nacional',
    natureOfOperation: row.nature_of_operation || 'Prestacao de servicos',
    serviceCity: row.service_city || '',
    series: settings.series || '1',
    initialNumber: settings.initialNumber || settings.initial_number || '1',
    environment: settings.environment || 'Homologacao',
    status: row.status || 'active',
  };
}

export function toTaxSettingsPayload(settings: Partial<TaxSettings>) {
  return {
    name: settings.name || 'Configuracao fiscal padrao',
    invoice_type: settings.invoiceType,
    tax_regime: settings.taxRegime,
    nature_of_operation: settings.natureOfOperation,
    service_city: settings.serviceCity,
    settings: {
      series: settings.series,
      initialNumber: settings.initialNumber,
      environment: settings.environment,
    },
    status: settings.status || 'active',
  };
}

export function mapClient(row: DbRow): Client {
  return {
    id: row.id,
    name: row.name,
    tradingName: row.trade_name || undefined,
    document: row.document,
    type: row.person_type,
    stateRegistration: row.state_registration || undefined,
    municipalRegistration: row.municipal_registration || undefined,
    email: row.email || '',
    phone: row.phone || '',
    address: row.address || { zipCode: '', street: '', number: '', neighborhood: '', city: '', state: '' },
    notes: row.notes || undefined,
    totalInvoices: row.total_invoices || 0,
    totalSpent: Number(row.total_spent || 0),
    status: row.status,
  };
}

export function toClientPayload(client: Partial<Client>, companyId?: string) {
  return {
    company_id: companyId,
    name: client.name,
    trade_name: client.tradingName,
    document: client.document,
    person_type: client.type,
    state_registration: client.stateRegistration,
    municipal_registration: client.municipalRegistration,
    email: client.email,
    phone: client.phone,
    address: client.address,
    notes: client.notes,
    status: client.status || 'active',
  };
}

export function mapProduct(row: DbRow): Product {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    sku: row.sku || '',
    ncm: row.ncm,
    cfopDefault: row.cfop_default,
    unit: row.unit,
    value: Number(row.value || 0),
    stock: Number(row.stock || 0),
    status: row.status,
  };
}

export function toProductPayload(product: Partial<Product>, companyId?: string) {
  return {
    company_id: companyId,
    name: product.name,
    code: product.code,
    sku: product.sku,
    ncm: product.ncm,
    cfop_default: product.cfopDefault,
    unit: product.unit,
    value: product.value,
    stock: product.stock,
    status: product.status || 'active',
  };
}

export function mapService(row: DbRow): Service {
  return {
    id: row.id,
    name: row.name,
    internalCode: row.internal_code,
    municipalCode: row.municipal_code,
    cnae: row.cnae,
    issRate: Number(row.iss_rate || 0),
    defaultValue: Number(row.default_value || 0),
    city: row.city || '',
    status: row.status,
  };
}

export function toServicePayload(service: Partial<Service>, companyId?: string) {
  return {
    company_id: companyId,
    name: service.name,
    internal_code: service.internalCode,
    municipal_code: service.municipalCode,
    cnae: service.cnae,
    iss_rate: service.issRate,
    default_value: service.defaultValue,
    city: service.city,
    status: service.status || 'active',
  };
}

export function mapInvoice(row: DbRow): Invoice {
  const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
  return {
    id: row.id,
    number: row.number || 'Sem numero',
    accessKey: row.access_key || undefined,
    clientName: client?.name || row.client_name || 'Cliente nao informado',
    clientDocument: client?.document || row.client_document || '',
    clientEmail: client?.email || undefined,
    clientPhone: client?.phone || undefined,
    clientAddress: client?.address || undefined,
    type: row.type,
    issueDate: row.issue_date,
    value: Number(row.value || 0),
    status: row.status,
    origin: row.origin,
    items: asArray(row.invoice_items).map(mapInvoiceItem),
    taxes: row.taxes || {},
    logs: asArray(row.invoice_logs).map(mapInvoiceLog),
    events: asArray(row.invoice_events).map(mapInvoiceEvent),
    observations: row.observations || undefined,
    natureOfOperation: row.nature_of_operation || undefined,
    taxRegime: row.tax_regime || undefined,
    xmlUrl: row.xml_url || undefined,
    pdfUrl: row.pdf_url || undefined,
  };
}

export function mapInvoiceItem(row: DbRow): InvoiceItem {
  return {
    description: row.description,
    quantity: Number(row.quantity || 0),
    value: Number(row.unit_value || 0),
    discount: Number(row.discount_value || 0),
    cnae: row.cnae || undefined,
    ncm: row.ncm || undefined,
    cfop: row.cfop || undefined,
  };
}

export function mapInvoiceLog(row: DbRow): InvoiceLog {
  return {
    timestamp: row.created_at,
    message: row.message,
    type: row.type,
  };
}

export function mapInvoiceEvent(row: DbRow): InvoiceEvent {
  return {
    date: row.event_date || row.created_at,
    title: row.title,
    description: row.description || '',
  };
}

export function toInvoicePayload(invoice: Partial<Invoice> & { clientId?: string }, companyId?: string) {
  return {
    company_id: companyId,
    client_id: invoice.clientId,
    number: invoice.number,
    access_key: invoice.accessKey,
    type: invoice.type,
    issue_date: invoice.issueDate,
    value: invoice.value,
    status: invoice.status || 'waiting',
    origin: invoice.origin || 'Emissao Manual',
    taxes: invoice.taxes || {},
    observations: invoice.observations,
    nature_of_operation: invoice.natureOfOperation,
    tax_regime: invoice.taxRegime,
    pdf_url: invoice.pdfUrl,
    xml_url: invoice.xmlUrl,
  };
}

export function mapIntegration(row: DbRow): Integration {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || '',
    status: row.status,
    lastSync: row.last_sync_at || undefined,
    config: row.config || undefined,
  };
}

export function mapAutomation(row: DbRow): Automation {
  return {
    id: row.id,
    name: row.name,
    trigger: row.trigger,
    conditions: row.conditions || {},
    actions: row.actions || { type: 'notify' },
    status: row.status,
    lastExecution: row.last_execution_at || undefined,
    totalExecutions: row.total_executions || 0,
    successRate: Number(row.success_rate || 100),
    errorHistory: row.error_history || [],
  };
}

export function mapWebhookEvent(row: DbRow): WebhookEvent {
  return {
    id: row.id,
    provider: row.provider,
    eventId: row.event_id,
    eventType: row.event_type,
    status: row.status,
    createdAt: row.created_at,
    processedAt: row.processed_at || undefined,
    errorMessage: row.error_message || undefined,
    normalizedPayload: row.normalized_payload || {},
    processingResult: row.processing_result || {},
  };
}

export function mapDocument(row: DbRow): Document {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    competence: row.competence,
    status: row.status,
    uploadDate: row.created_at,
    sender: row.sender_name || '',
    size: row.file_size || '',
    fileUrl: row.file_url || undefined,
  };
}

export function mapPendingTask(row: DbRow): PendingTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    responsible: row.responsible_name || '',
  };
}

export function mapChatMessage(row: DbRow): ChatMessage {
  return {
    id: row.id,
    sender: row.sender_type === 'accountant' ? 'accountant' : 'client',
    text: row.text,
    timestamp: row.created_at,
    file: row.file || undefined,
  };
}

async function getActiveCompanyId() {
  const profiles = await databaseService.list<DbRow>('profiles', '?single=maybe');
  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  return profile?.active_company_id || null;
}

export const realData = {
  async activeCompanyId() {
    return getActiveCompanyId();
  },
  async activeCompany() {
    const companyId = await getActiveCompanyId();
    if (!companyId) throw new Error('Empresa ativa nao encontrada.');
    return mapCompany(await databaseService.get<DbRow>('companies', companyId));
  },
  async activeTaxSettings() {
    const companyId = await getActiveCompanyId();
    if (!companyId) throw new Error('Empresa ativa nao encontrada.');

    const existing = await databaseService.list<DbRow>('tax_settings', '?single=maybe');
    const row = Array.isArray(existing) ? existing[0] : existing;
    if (row?.id) return mapTaxSettings(row);

    const company = await databaseService.get<DbRow>('companies', companyId);
    return mapTaxSettings(await databaseService.create<DbRow>('tax_settings', {
      company_id: companyId,
      name: 'Configuracao fiscal padrao',
      invoice_type: 'NFS-e',
      tax_regime: company.tax_regime || 'Simples Nacional',
      nature_of_operation: 'Prestacao de servicos',
      service_city: company.address?.city || null,
      settings: {
        series: '1',
        initialNumber: '1',
        environment: 'Homologacao',
      },
      status: 'active',
    }));
  },
  async clients() {
    return (await databaseService.list<DbRow>('clients', '?order=created_at:desc')).map(mapClient);
  },
  async products() {
    return (await databaseService.list<DbRow>('products', '?order=created_at:desc')).map(mapProduct);
  },
  async services() {
    return (await databaseService.list<DbRow>('services', '?order=created_at:desc')).map(mapService);
  },
  async invoices() {
    return (await databaseService.list<DbRow>('invoices', '?select=*,clients(*),invoice_items(*),invoice_logs(*),invoice_events(*)&order=issue_date:desc')).map(mapInvoice);
  },
  async integrations() {
    return (await databaseService.list<DbRow>('integrations', '?order=created_at:desc')).map(mapIntegration);
  },
  async automations() {
    return (await databaseService.list<DbRow>('automations', '?order=created_at:desc')).map(mapAutomation);
  },
  async webhookEvents(limit = 8) {
    return (await databaseService.list<DbRow>('webhook_events', `?order=created_at:desc&limit=${limit}`)).map(mapWebhookEvent);
  },
  async documents() {
    return (await databaseService.list<DbRow>('documents', '?order=created_at:desc')).map(mapDocument);
  },
  async pendingTasks() {
    return (await databaseService.list<DbRow>('pending_tasks', '?order=due_date:asc')).map(mapPendingTask);
  },
  async chatMessages() {
    return (await databaseService.list<DbRow>('chat_messages', '?order=created_at:asc')).map(mapChatMessage);
  },
  async createClient(client: Partial<Client>) {
    const companyId = await getActiveCompanyId();
    return mapClient(await databaseService.create<DbRow>('clients', toClientPayload(client, companyId)));
  },
  async createProduct(product: Partial<Product>) {
    const companyId = await getActiveCompanyId();
    return mapProduct(await databaseService.create<DbRow>('products', toProductPayload(product, companyId)));
  },
  async createService(service: Partial<Service>) {
    const companyId = await getActiveCompanyId();
    return mapService(await databaseService.create<DbRow>('services', toServicePayload(service, companyId)));
  },
  async update(table: string, id: string, data: Record<string, unknown>) {
    return databaseService.update<DbRow>(table, id, data);
  },
};
