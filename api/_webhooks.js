import { db } from './_utils.js';

const providerAliases = {
  hotmart: 'hotmart',
  kiwify: 'kiwify',
  stripe: 'stripe',
  shopify: 'shopify',
  asaas: 'asaas',
};

export function normalizeProvider(rawProvider = '') {
  const provider = String(rawProvider).trim().toLowerCase();
  return providerAliases[provider] || null;
}

export function getWebhookSecret(req, provider) {
  const headerSecret =
    req.headers['x-pixelconta-webhook-secret'] ||
    req.headers['x-webhook-secret'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '');

  const configuredSecret =
    process.env[`WEBHOOK_SECRET_${provider.toUpperCase()}`] ||
    process.env.WEBHOOK_SECRET;

  return { headerSecret, configuredSecret };
}

export function verifyWebhookSecret(req, provider) {
  const { headerSecret, configuredSecret } = getWebhookSecret(req, provider);
  if (!configuredSecret) return { ok: false, error: 'Webhook secret nao configurado no backend.' };
  if (!headerSecret || headerSecret !== configuredSecret) return { ok: false, error: 'Webhook nao autorizado.' };
  return { ok: true };
}

export async function findWebhookCompany(provider, body = {}) {
  const explicitCompanyId =
    body.company_id ||
    body.companyId ||
    body.metadata?.company_id ||
    body.metadata?.companyId;

  if (explicitCompanyId) {
    const { data, error } = await db
      .from('integrations')
      .select('company_id')
      .eq('company_id', explicitCompanyId)
      .ilike('name', provider)
      .maybeSingle();

    if (!error && data?.company_id) return data.company_id;
    return explicitCompanyId;
  }

  const token =
    body.integration_token ||
    body.integrationToken ||
    body.metadata?.integration_token ||
    body.metadata?.integrationToken;

  if (!token) return null;

  const { data, error } = await db
    .from('integrations')
    .select('company_id')
    .contains('config', { webhookToken: token })
    .maybeSingle();

  if (error || !data?.company_id) return null;
  return data.company_id;
}

export function getEventId(provider, body = {}) {
  return (
    body.event_id ||
    body.eventId ||
    body.id ||
    body.transaction ||
    body.transaction_id ||
    body.order_id ||
    `${provider}-${Date.now()}`
  );
}

export function getEventType(body = {}) {
  return body.event || body.event_type || body.type || body.status || 'unknown';
}

export async function registerWebhookEvent({ companyId, provider, eventId, eventType, payload, normalizedPayload }) {
  const { data: existing, error: existingError } = await db
    .from('webhook_events')
    .select('id, status')
    .eq('provider', provider)
    .eq('event_id', eventId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return { event: existing, duplicated: true };

  const { data, error } = await db
    .from('webhook_events')
    .insert({
      company_id: companyId,
      provider,
      event_id: eventId,
      event_type: eventType,
      payload,
      normalized_payload: normalizedPayload || {},
      status: 'received',
    })
    .select()
    .single();

  if (error) throw error;
  return { event: data, duplicated: false };
}

function inferPersonType(document = '') {
  const digits = String(document).replace(/\D/g, '');
  return digits.length === 11 ? 'PF' : 'PJ';
}

function buildClientDocument(normalizedPayload = {}) {
  const buyer = normalizedPayload.buyer || {};
  const document = String(buyer.document || '').trim();
  if (document) return document;

  const email = String(buyer.email || '').trim().toLowerCase();
  if (email) return `EMAIL:${email}`;

  return `WEBHOOK:${normalizedPayload.provider}:${normalizedPayload.externalId}`;
}

function mapSaleStatus(status = '') {
  const value = String(status).toLowerCase();
  if (['approved', 'paid', 'completed', 'complete', 'succeeded', 'active'].includes(value)) return 'paid';
  if (['canceled', 'cancelled', 'chargeback'].includes(value)) return 'canceled';
  if (['refunded', 'refund'].includes(value)) return 'refunded';
  return 'pending';
}

export async function findOrCreateWebhookClient(companyId, normalizedPayload = {}) {
  const buyer = normalizedPayload.buyer || {};
  const document = buildClientDocument(normalizedPayload);

  const { data: existing, error: existingError } = await db
    .from('clients')
    .select('*')
    .eq('company_id', companyId)
    .eq('document', document)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return { client: existing, created: false };

  const { data, error } = await db
    .from('clients')
    .insert({
      company_id: companyId,
      name: buyer.name || 'Cliente sem nome',
      document,
      person_type: inferPersonType(document),
      email: buyer.email || null,
      phone: buyer.phone || null,
      notes: `Cliente criado automaticamente via webhook ${normalizedPayload.provider}.`,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return { client: data, created: true };
}

export async function findOrCreateWebhookSale(companyId, clientId, normalizedPayload = {}, webhookEventId = null) {
  const externalId = String(normalizedPayload.externalId || webhookEventId || '');

  if (externalId) {
    const { data: existing, error: existingError } = await db
      .from('sales')
      .select('*')
      .eq('company_id', companyId)
      .eq('origin', normalizedPayload.provider)
      .eq('external_id', externalId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) return { sale: existing, created: false };
  }

  const { data, error } = await db
    .from('sales')
    .insert({
      company_id: companyId,
      client_id: clientId,
      origin: normalizedPayload.provider,
      external_id: externalId || null,
      payment_method: normalizedPayload.paymentMethod || null,
      sold_at: normalizedPayload.soldAt,
      gross_value: normalizedPayload.grossValue || 0,
      discount_value: normalizedPayload.discountValue || 0,
      net_value: normalizedPayload.netValue || normalizedPayload.grossValue || 0,
      status: mapSaleStatus(normalizedPayload.status),
      metadata: {
        webhook_event_id: webhookEventId,
        event_type: normalizedPayload.eventType,
        buyer: normalizedPayload.buyer || {},
        product: normalizedPayload.product || {},
      },
    })
    .select()
    .single();

  if (error) throw error;
  return { sale: data, created: true };
}

export async function markWebhookEventProcessed(eventId, metadata = {}) {
  const { data, error } = await db
    .from('webhook_events')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      processing_result: metadata,
      error_message: null,
    })
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markWebhookEventFailed(eventId, errorMessage) {
  await db
    .from('webhook_events')
    .update({
      status: 'failed',
      error_message: errorMessage,
    })
    .eq('id', eventId);
}
