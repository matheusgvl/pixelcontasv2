import { guard, readBody, send } from '../_utils.js';
import { runWebhookAutomations } from '../_automationEngine.js';
import { createNotification, formatCurrency } from '../_notifications.js';
import { normalizeSaleWebhook } from '../_webhookNormalizers.js';
import {
  findWebhookCompany,
  findOrCreateWebhookClient,
  findOrCreateWebhookSale,
  getEventId,
  getEventType,
  markWebhookEventFailed,
  markWebhookEventProcessed,
  normalizeProvider,
  registerWebhookEvent,
  verifyWebhookSecret,
} from '../_webhooks.js';

function getErrorMessage(error, fallback) {
  if (error instanceof Error) return error.message;
  if (error?.message) return error.message;
  if (error?.details) return error.details;
  return fallback;
}

function buildProcessedNotification(provider, normalizedPayload, clientResult, saleResult, automationResult) {
  const buyerName = normalizedPayload.buyer?.name || clientResult.client?.name || 'Cliente';
  const productName = normalizedPayload.product?.name || 'produto sem nome';
  const value = formatCurrency(normalizedPayload.netValue || normalizedPayload.grossValue || saleResult.sale?.net_value);
  const automationText = automationResult.matched_count > 0
    ? `${automationResult.matched_count} automacao(oes) acionada(s).`
    : 'Nenhuma automacao acionada.';

  return {
    title: `Venda ${provider} processada`,
    description: `${buyerName} comprou ${productName} por ${value}. ${automationText}`,
  };
}

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

    if (result.duplicated) {
      return send(res, 200, {
        data: {
          id: result.event.id,
          provider,
          eventId,
          eventType,
          normalizedPayload,
          status: 'duplicated',
        },
      });
    }

    try {
      const clientResult = await findOrCreateWebhookClient(companyId, normalizedPayload);
      const saleResult = await findOrCreateWebhookSale(companyId, clientResult.client.id, normalizedPayload, result.event.id);
      const automationResult = await runWebhookAutomations({
        companyId,
        normalizedPayload,
        sale: saleResult.sale,
        client: clientResult.client,
      });

      await markWebhookEventProcessed(result.event.id, {
        client_id: clientResult.client.id,
        client_created: clientResult.created,
        sale_id: saleResult.sale.id,
        sale_created: saleResult.created,
        automations: automationResult,
      });

      const notification = buildProcessedNotification(provider, normalizedPayload, clientResult, saleResult, automationResult);
      await createNotification({
        companyId,
        title: notification.title,
        description: notification.description,
        type: 'success',
        metadata: {
          source: 'webhook',
          webhook_event_id: result.event.id,
          provider,
          event_id: eventId,
          sale_id: saleResult.sale.id,
          client_id: clientResult.client.id,
          automations: automationResult,
        },
      });

      return send(res, 202, {
        data: {
          id: result.event.id,
          provider,
          eventId,
          eventType,
          normalizedPayload,
          client: {
            id: clientResult.client.id,
            created: clientResult.created,
          },
          sale: {
            id: saleResult.sale.id,
            created: saleResult.created,
          },
          automations: automationResult,
          status: 'processed',
        },
      });
    } catch (processingError) {
      await markWebhookEventFailed(
        result.event.id,
        getErrorMessage(processingError, 'Erro ao processar venda do webhook.'),
      );
      await createNotification({
        companyId,
        title: `Falha ao processar venda ${provider}`,
        description: getErrorMessage(processingError, 'Erro ao processar venda do webhook.'),
        type: 'error',
        metadata: {
          source: 'webhook',
          webhook_event_id: result.event.id,
          provider,
          event_id: eventId,
        },
      });
      throw processingError;
    }
  } catch (error) {
    return send(res, 500, {
      error: getErrorMessage(error, 'Erro ao receber webhook.'),
    });
  }
}
