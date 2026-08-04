import { db } from './_utils.js';

export async function createNotification({ companyId, title, description = '', type = 'info', metadata = {} }) {
  if (!companyId || !title) return null;

  const { data, error } = await db
    .from('notifications')
    .insert({
      company_id: companyId,
      title,
      description,
      type,
      metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
}
