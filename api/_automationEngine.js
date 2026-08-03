import { db } from './_utils.js';

function normalizeText(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isApprovedSale(normalizedPayload = {}) {
  const status = normalizeText(normalizedPayload.status);
  const eventType = normalizeText(normalizedPayload.eventType);

  return ['paid', 'approved', 'completed', 'complete', 'succeeded'].includes(status) ||
    eventType.includes('approved') ||
    eventType.includes('aprovada') ||
    eventType.includes('pagamento confirmado');
}

function matchesTrigger(trigger = '', normalizedPayload = {}) {
  const normalizedTrigger = normalizeText(trigger);

  if (normalizedTrigger.includes('venda aprovada')) return isApprovedSale(normalizedPayload);
  if (normalizedTrigger.includes('pagamento confirmado')) return isApprovedSale(normalizedPayload);
  if (normalizedTrigger.includes('pedido criado')) return true;
  if (normalizedTrigger.includes('reembolso')) {
    return ['refunded', 'refund'].includes(normalizeText(normalizedPayload.status));
  }

  return true;
}

function matchesConditions(conditions = {}, normalizedPayload = {}) {
  const platform = normalizeText(conditions.platform);
  const provider = normalizeText(normalizedPayload.provider);

  if (platform && platform !== 'qualquer canal' && platform !== provider) return false;

  if (conditions.valueMin !== undefined && conditions.valueMin !== null) {
    const minValue = Number(conditions.valueMin);
    if (Number.isFinite(minValue) && Number(normalizedPayload.netValue || 0) < minValue) return false;
  }

  if (conditions.productId) {
    const expectedProduct = normalizeText(conditions.productId);
    const productId = normalizeText(normalizedPayload.product?.id);
    const productName = normalizeText(normalizedPayload.product?.name);
    if (expectedProduct !== productId && expectedProduct !== productName) return false;
  }

  if (conditions.paymentMethod) {
    const expectedPayment = normalizeText(conditions.paymentMethod);
    const paymentMethod = normalizeText(normalizedPayload.paymentMethod);
    if (expectedPayment !== paymentMethod) return false;
  }

  return true;
}

async function updateAutomationExecution(automation, success, message = null) {
  const totalExecutions = Number(automation.total_executions || 0) + 1;
  const currentSuccessRate = Number(automation.success_rate || 100);
  const previousSuccesses = Math.round((currentSuccessRate / 100) * Number(automation.total_executions || 0));
  const nextSuccesses = previousSuccesses + (success ? 1 : 0);
  const successRate = totalExecutions > 0 ? Number(((nextSuccesses / totalExecutions) * 100).toFixed(2)) : 100;
  const errorHistory = Array.isArray(automation.error_history) ? automation.error_history : [];

  const payload = {
    total_executions: totalExecutions,
    success_rate: successRate,
    last_execution_at: new Date().toISOString(),
  };

  if (!success && message) {
    payload.error_history = [
      { date: new Date().toISOString(), message },
      ...errorHistory,
    ].slice(0, 20);
  }

  const { error } = await db
    .from('automations')
    .update(payload)
    .eq('id', automation.id);

  if (error) throw error;
}

function buildActionResult(automation, sale, client) {
  const actionType = automation.actions?.type || 'unknown';

  return {
    automation_id: automation.id,
    automation_name: automation.name,
    action_type: actionType,
    status: 'matched',
    message: actionType === 'emit_invoice'
      ? 'Regra encontrada. Emissao fiscal real ainda nao executada nesta etapa.'
      : 'Regra encontrada para execucao posterior.',
    sale_id: sale?.id,
    client_id: client?.id,
  };
}

export async function runWebhookAutomations({ companyId, normalizedPayload, sale, client }) {
  const { data: automations, error } = await db
    .from('automations')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'active');

  if (error) throw error;

  const matched = [];
  const ignored = [];

  for (const automation of automations || []) {
    const triggerMatched = matchesTrigger(automation.trigger, normalizedPayload);
    const conditionsMatched = matchesConditions(automation.conditions || {}, normalizedPayload);

    if (!triggerMatched || !conditionsMatched) {
      ignored.push({
        automation_id: automation.id,
        automation_name: automation.name,
        reason: !triggerMatched ? 'trigger_not_matched' : 'conditions_not_matched',
      });
      continue;
    }

    const actionResult = buildActionResult(automation, sale, client);
    await updateAutomationExecution(automation, true);
    matched.push(actionResult);
  }

  return {
    matched_count: matched.length,
    ignored_count: ignored.length,
    matched,
    ignored,
  };
}
