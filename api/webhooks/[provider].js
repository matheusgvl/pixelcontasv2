import { guard, readBody, send } from '../_utils.js';
import { normalizeSaleWebhook } from '../_webhookNormalizers.js';
import {
  findWebhookCompany,
  getEventId,
  getEventType,
  normalizeProvider,
  registerWebhookEvent,
  verifyWebhookSecret,
} from '../_webhooks.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;

  if (req.method !== 'POST') {
    return send(res, 405, { error: 'Method not allowed.' });
  }

  const provider = normalizeProvider(req.query.provider);
  if (!provider) {
    return send(res, 404, { error: 'Plataforma de webhook nao suportada.' });
  }

  const auth = verifyWebhookSecret(req, provider);
  if (!auth.ok) return send(res, 401, { error: auth.error });

  try {
    const body = await readBody(req);
    const companyId = await findWebhookCompany(provider, body);

    if (!companyId) {
      return send(res, 422, {
        error: 'Nao foi possivel identificar a empresa deste webhook.',
      });
    }

    const eventId = String(getEventId(provider, body));
    const eventType = String(getEventType(body));
    const normalizedPayload = normalizeSaleWebhook(provider, body);
    const result = await registerWebhookEvent({
      companyId,
      provider,
      eventId,
      eventType,
      payload: body,
      normalizedPayload,
    });

    return send(res, result.duplicated ? 200 : 202, {
      data: {
        id: result.event.id,
        provider,
        eventId,
        eventType,
        normalizedPayload,
        status: result.duplicated ? 'duplicated' : 'received',
      },
    });
  } catch (error) {
    return send(res, 500, {
      error: error instanceof Error ? error.message : 'Erro ao receber webhook.',
    });
  }
}
