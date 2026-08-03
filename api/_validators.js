const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const cepRegex = /^\d{5}-?\d{3}$/;
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
const cnpjRegex = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}/;

const tableFields = {
  profiles: ['id', 'name', 'email', 'role', 'avatar_url', 'active_company_id', 'is_active'],
  companies: [
    'legal_name',
    'trade_name',
    'cnpj',
    'state_registration',
    'municipal_registration',
    'tax_regime',
    'cnae_primary',
    'email',
    'phone',
    'address',
    'certificate_status',
    'settings',
    'status',
  ],
  company_members: ['company_id', 'profile_id', 'role', 'status'],
  clients: ['company_id', 'name', 'trade_name', 'document', 'person_type', 'state_registration', 'municipal_registration', 'email', 'phone', 'address', 'notes', 'status'],
  products: ['company_id', 'name', 'code', 'sku', 'ncm', 'cfop_default', 'unit', 'value', 'stock', 'status'],
  services: ['company_id', 'name', 'internal_code', 'municipal_code', 'cnae', 'iss_rate', 'default_value', 'city', 'status'],
  sales: ['company_id', 'client_id', 'origin', 'external_id', 'payment_method', 'sold_at', 'gross_value', 'discount_value', 'net_value', 'status', 'metadata'],
  invoices: [
    'company_id',
    'client_id',
    'sale_id',
    'number',
    'series',
    'access_key',
    'type',
    'issue_date',
    'value',
    'status',
    'origin',
    'taxes',
    'observations',
    'nature_of_operation',
    'tax_regime',
    'pdf_url',
    'xml_url',
    'rejection_reason',
  ],
  invoice_items: ['company_id', 'invoice_id', 'description', 'quantity', 'unit_value', 'discount_value', 'total_value', 'cnae', 'ncm', 'cfop', 'metadata'],
  invoice_logs: ['company_id', 'invoice_id', 'message', 'type', 'metadata'],
  invoice_events: ['company_id', 'invoice_id', 'title', 'description', 'event_date', 'metadata'],
  tax_settings: ['company_id', 'name', 'invoice_type', 'tax_regime', 'nature_of_operation', 'default_iss_rate', 'default_icms_rate', 'service_city', 'settings', 'status'],
  integrations: ['company_id', 'name', 'category', 'description', 'status', 'last_sync_at', 'config'],
  automations: ['company_id', 'name', 'trigger', 'conditions', 'actions', 'status', 'last_execution_at', 'total_executions', 'success_rate', 'error_history'],
  documents: ['company_id', 'name', 'category', 'competence', 'status', 'sender_name', 'file_url', 'file_size', 'metadata'],
  pending_tasks: ['company_id', 'title', 'description', 'due_date', 'priority', 'status', 'responsible_name', 'metadata'],
  chat_messages: ['company_id', 'sender_type', 'sender_name', 'text', 'file', 'metadata'],
};

const validators = {
  profileRole: ['admin', 'owner', 'accountant', 'operator'],
  memberRole: ['owner', 'accountant', 'operator'],
  personType: ['PF', 'PJ'],
  recordStatus: ['active', 'inactive'],
  memberStatus: ['active', 'invited', 'inactive'],
  companyStatus: ['active', 'inactive', 'pending'],
  certificateStatus: ['missing', 'valid', 'expiring', 'expired'],
  saleStatus: ['pending', 'paid', 'canceled', 'refunded'],
  invoiceType: ['NFS-e', 'NF-e', 'NFC-e'],
  invoiceStatus: ['authorized', 'processing', 'waiting', 'rejected', 'canceled'],
  logType: ['info', 'success', 'warning', 'error'],
  integrationCategory: ['infoproduct', 'ecommerce', 'payment', 'marketplace', 'crm', 'api'],
  integrationStatus: ['connected', 'disconnected', 'attention', 'syncing'],
  automationStatus: ['active', 'paused'],
  documentCategory: ['invoice', 'bank_statement', 'receipt', 'contract', 'payroll', 'corporate', 'others'],
  documentStatus: ['sent', 'pending', 'reviewed'],
  priority: ['high', 'medium', 'low'],
  pendingStatus: ['pending', 'resolved'],
  senderType: ['client', 'accountant', 'system'],
};

function pickAllowedFields(table, body) {
  const allowed = tableFields[table] || [];
  return Object.fromEntries(Object.entries(body || {}).filter(([key]) => allowed.includes(key)));
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function addError(errors, field, message) {
  errors[field] = message;
}

function validateRequired(payload, fields, errors) {
  fields.forEach((field) => {
    if (!hasValue(payload[field])) addError(errors, field, 'Campo obrigatorio.');
  });
}

function validateUuidFields(payload, fields, errors) {
  fields.forEach((field) => {
    if (hasValue(payload[field]) && !uuidRegex.test(String(payload[field]))) addError(errors, field, 'ID invalido.');
  });
}

function validateNumberFields(payload, fields, errors) {
  fields.forEach((field) => {
    if (hasValue(payload[field]) && !Number.isFinite(Number(payload[field]))) addError(errors, field, 'Informe um numero valido.');
  });
}

function validateDateFields(payload, fields, errors) {
  fields.forEach((field) => {
    if (hasValue(payload[field]) && !dateRegex.test(String(payload[field]))) addError(errors, field, 'Informe uma data valida.');
  });
}

function validateEnum(payload, field, allowedValues, errors) {
  if (hasValue(payload[field]) && !allowedValues.includes(payload[field])) {
    addError(errors, field, `Valor invalido. Use: ${allowedValues.join(', ')}.`);
  }
}

function validateCommon(table, payload, method, errors) {
  const uuidFields = {
    profiles: ['id', 'active_company_id'],
    company_members: ['company_id', 'profile_id'],
    clients: ['company_id'],
    products: ['company_id'],
    services: ['company_id'],
    sales: ['company_id', 'client_id'],
    invoices: ['company_id', 'client_id', 'sale_id'],
    invoice_items: ['company_id', 'invoice_id'],
    invoice_logs: ['company_id', 'invoice_id'],
    invoice_events: ['company_id', 'invoice_id'],
    tax_settings: ['company_id'],
    integrations: ['company_id'],
    automations: ['company_id'],
    documents: ['company_id'],
    pending_tasks: ['company_id'],
    chat_messages: ['company_id'],
  };

  validateUuidFields(payload, uuidFields[table] || [], errors);

  if (method === 'POST') {
    const requiredFields = {
      profiles: ['id', 'name', 'email', 'role'],
      companies: ['legal_name', 'cnpj', 'tax_regime'],
      company_members: ['company_id', 'profile_id', 'role'],
      clients: ['company_id', 'name', 'document', 'person_type'],
      products: ['company_id', 'name', 'code', 'ncm', 'cfop_default', 'unit', 'value'],
      services: ['company_id', 'name', 'internal_code', 'municipal_code', 'cnae', 'iss_rate', 'default_value'],
      sales: ['company_id', 'client_id', 'origin', 'sold_at', 'gross_value', 'net_value'],
      invoices: ['company_id', 'client_id', 'type', 'issue_date', 'value', 'status', 'origin'],
      invoice_items: ['company_id', 'invoice_id', 'description', 'quantity', 'unit_value', 'total_value'],
      invoice_logs: ['company_id', 'invoice_id', 'message', 'type'],
      invoice_events: ['company_id', 'invoice_id', 'title', 'event_date'],
      tax_settings: ['company_id', 'name', 'invoice_type', 'tax_regime'],
      integrations: ['company_id', 'name', 'category', 'status'],
      automations: ['company_id', 'name', 'trigger', 'actions', 'status'],
      documents: ['company_id', 'name', 'category', 'competence', 'status'],
      pending_tasks: ['company_id', 'title', 'due_date', 'priority', 'status'],
      chat_messages: ['company_id', 'sender_type', 'text'],
    };
    validateRequired(payload, requiredFields[table] || [], errors);
  }
}

export function validateTablePayload(table, body, method = 'POST') {
  const payload = pickAllowedFields(table, body);
  const errors = {};

  validateCommon(table, payload, method, errors);

  if (hasValue(payload.email) && !emailRegex.test(String(payload.email))) addError(errors, 'email', 'Informe um email valido.');
  if (hasValue(payload.phone) && !phoneRegex.test(String(payload.phone))) addError(errors, 'phone', 'Use o formato (81) 00000-0000.');
  if (hasValue(payload.cnpj) && !cnpjRegex.test(String(payload.cnpj))) addError(errors, 'cnpj', 'Informe um CNPJ valido.');
  if (hasValue(payload.document) && payload.person_type === 'PF' && !cpfRegex.test(String(payload.document))) addError(errors, 'document', 'Informe um CPF valido.');
  if (hasValue(payload.document) && payload.person_type === 'PJ' && !cnpjRegex.test(String(payload.document))) addError(errors, 'document', 'Informe um CNPJ valido.');
  if (payload.address?.zipCode && !cepRegex.test(String(payload.address.zipCode))) addError(errors, 'address.zipCode', 'Informe um CEP valido.');

  validateDateFields(payload, ['sold_at', 'issue_date', 'event_date', 'due_date', 'last_sync_at', 'last_execution_at'], errors);
  validateNumberFields(payload, [
    'value',
    'stock',
    'iss_rate',
    'default_value',
    'gross_value',
    'discount_value',
    'net_value',
    'quantity',
    'unit_value',
    'total_value',
    'default_iss_rate',
    'default_icms_rate',
    'total_executions',
    'success_rate',
  ], errors);

  validateEnum(payload, 'role', table === 'company_members' ? validators.memberRole : validators.profileRole, errors);
  validateEnum(payload, 'person_type', validators.personType, errors);
  validateEnum(payload, 'certificate_status', validators.certificateStatus, errors);
  validateEnum(payload, 'type', validators.invoiceType, errors);
  validateEnum(payload, 'invoice_type', validators.invoiceType, errors);
  validateEnum(payload, 'category', table === 'documents' ? validators.documentCategory : validators.integrationCategory, errors);
  validateEnum(payload, 'priority', validators.priority, errors);
  validateEnum(payload, 'sender_type', validators.senderType, errors);

  if (table === 'companies') validateEnum(payload, 'status', validators.companyStatus, errors);
  if (table === 'company_members') validateEnum(payload, 'status', validators.memberStatus, errors);
  if (['clients', 'products', 'services', 'tax_settings'].includes(table)) validateEnum(payload, 'status', validators.recordStatus, errors);
  if (table === 'sales') validateEnum(payload, 'status', validators.saleStatus, errors);
  if (table === 'invoices') validateEnum(payload, 'status', validators.invoiceStatus, errors);
  if (table === 'invoice_logs') validateEnum(payload, 'type', validators.logType, errors);
  if (table === 'integrations') validateEnum(payload, 'status', validators.integrationStatus, errors);
  if (table === 'automations') validateEnum(payload, 'status', validators.automationStatus, errors);
  if (table === 'documents') validateEnum(payload, 'status', validators.documentStatus, errors);
  if (table === 'pending_tasks') validateEnum(payload, 'status', validators.pendingStatus, errors);

  if (Object.keys(payload).length === 0) {
    addError(errors, 'payload', 'Nenhum campo permitido foi enviado para este recurso.');
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      payload,
      status: 400,
      error: 'Dados invalidos para salvar o registro.',
      fields: errors,
    };
  }

  return { ok: true, payload };
}
