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

export async function registerWebhookEvent({ companyId, provider, eventId, eventType, payload }) {
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
      status: 'received',
    })
    .select()
    .single();

  if (error) throw error;
  return { event: data, duplicated: false };
}
