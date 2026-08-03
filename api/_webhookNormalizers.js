function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value).replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoDate(value) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function normalizeBuyer(rawBuyer = {}) {
  return {
    name: firstValue(rawBuyer.name, rawBuyer.full_name, rawBuyer.fullName, rawBuyer.nome, 'Cliente sem nome'),
    email: firstValue(rawBuyer.email, rawBuyer.email_address, rawBuyer.emailAddress, ''),
    document: firstValue(rawBuyer.document, rawBuyer.cpf, rawBuyer.cnpj, rawBuyer.doc, ''),
    phone: firstValue(rawBuyer.phone, rawBuyer.phone_number, rawBuyer.phoneNumber, rawBuyer.telefone, ''),
  };
}

function normalizeProduct(rawProduct = {}) {
  return {
    id: firstValue(rawProduct.id, rawProduct.product_id, rawProduct.productId, rawProduct.code, ''),
    name: firstValue(rawProduct.name, rawProduct.product_name, rawProduct.productName, rawProduct.nome, 'Produto sem nome'),
  };
}

function normalizeHotmart(body = {}) {
  const data = body.data || body;
  const purchase = data.purchase || data.transaction || {};
  const buyer = data.buyer || data.customer || purchase.buyer || {};
  const product = data.product || purchase.product || {};
  const price = purchase.price || data.price || {};

  return {
    provider: 'hotmart',
    externalId: String(firstValue(purchase.transaction, purchase.id, body.id, body.event_id, '')),
    eventType: firstValue(body.event, body.event_type, purchase.status, 'sale'),
    status: String(firstValue(purchase.status, data.status, 'paid')).toLowerCase(),
    soldAt: toIsoDate(firstValue(purchase.order_date, purchase.approved_date, data.created_at, body.created_at)),
    paymentMethod: firstValue(purchase.payment?.method, purchase.payment_method, data.payment_method, ''),
    grossValue: toNumber(firstValue(price.value, purchase.full_price?.value, purchase.price, data.amount)),
    netValue: toNumber(firstValue(price.value, purchase.full_price?.value, purchase.price, data.amount)),
    discountValue: toNumber(firstValue(purchase.discount_value, data.discount_value, 0)),
    buyer: normalizeBuyer(buyer),
    product: normalizeProduct(product),
    raw: body,
  };
}

function normalizeKiwify(body = {}) {
  const customer = body.Customer || body.customer || body.buyer || {};
  const product = body.Product || body.product || {};

  return {
    provider: 'kiwify',
    externalId: String(firstValue(body.order_id, body.orderId, body.id, body.event_id, '')),
    eventType: firstValue(body.webhook_event_type, body.event_type, body.event, body.status, 'sale'),
    status: String(firstValue(body.order_status, body.status, 'paid')).toLowerCase(),
    soldAt: toIsoDate(firstValue(body.created_at, body.approved_date, body.paid_at)),
    paymentMethod: firstValue(body.payment_method, body.paymentMethod, ''),
    grossValue: toNumber(firstValue(body.order_total, body.total, body.price, body.amount)),
    netValue: toNumber(firstValue(body.order_total, body.total, body.price, body.amount)),
    discountValue: toNumber(firstValue(body.discount, body.discount_value, 0)),
    buyer: normalizeBuyer(customer),
    product: normalizeProduct(product),
    raw: body,
  };
}

function normalizeStripe(body = {}) {
  const eventData = body.data?.object || body;
  const customer = eventData.customer_details || eventData.customer || {};

  return {
    provider: 'stripe',
    externalId: String(firstValue(eventData.id, body.id, body.event_id, '')),
    eventType: firstValue(body.type, body.event_type, eventData.status, 'sale'),
    status: String(firstValue(eventData.payment_status, eventData.status, 'paid')).toLowerCase(),
    soldAt: toIsoDate(firstValue(eventData.created ? eventData.created * 1000 : null, body.created_at)),
    paymentMethod: firstValue(eventData.payment_method_types?.[0], eventData.payment_method, ''),
    grossValue: toNumber(firstValue(eventData.amount_total, eventData.amount_received, eventData.amount)) / 100,
    netValue: toNumber(firstValue(eventData.amount_total, eventData.amount_received, eventData.amount)) / 100,
    discountValue: 0,
    buyer: normalizeBuyer(customer),
    product: normalizeProduct(eventData.metadata || {}),
    raw: body,
  };
}

function normalizeGeneric(provider, body = {}) {
  const buyer = body.buyer || body.customer || body.client || {};
  const product = body.product || body.item || {};

  return {
    provider,
    externalId: String(firstValue(body.external_id, body.externalId, body.id, body.order_id, body.event_id, '')),
    eventType: firstValue(body.event, body.event_type, body.type, body.status, 'sale'),
    status: String(firstValue(body.status, 'paid')).toLowerCase(),
    soldAt: toIsoDate(firstValue(body.sold_at, body.soldAt, body.created_at, body.createdAt)),
    paymentMethod: firstValue(body.payment_method, body.paymentMethod, ''),
    grossValue: toNumber(firstValue(body.gross_value, body.grossValue, body.total, body.amount, body.value)),
    netValue: toNumber(firstValue(body.net_value, body.netValue, body.total, body.amount, body.value)),
    discountValue: toNumber(firstValue(body.discount_value, body.discountValue, body.discount, 0)),
    buyer: normalizeBuyer(buyer),
    product: normalizeProduct(product),
    raw: body,
  };
}

export function normalizeSaleWebhook(provider, body = {}) {
  if (provider === 'hotmart') return normalizeHotmart(body);
  if (provider === 'kiwify') return normalizeKiwify(body);
  if (provider === 'stripe') return normalizeStripe(body);
  return normalizeGeneric(provider, body);
}
