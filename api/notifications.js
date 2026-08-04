import { db, getApiProfile, getCompanyMembership, guard, requireApiUser, send } from './_utils.js';

function formatNotification(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    date: row.created_at,
  };
}

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (!await requireApiUser(req, res)) return;

  const profile = await getApiProfile(req);
  if (!profile?.active_company_id) return send(res, 403, { error: 'Empresa ativa nao encontrada.' });

  const membership = await getCompanyMembership(req, profile.active_company_id);
  if (!membership) return send(res, 403, { error: 'Voce nao tem acesso a esta empresa.' });

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('notifications')
      .select('id, title, description, type, created_at')
      .eq('company_id', profile.active_company_id)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return send(res, 400, { error: error.message });
    return send(res, 200, { data: (data || []).map(formatNotification) });
  }

  if (req.method === 'PATCH') {
    const { error } = await db
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('company_id', profile.active_company_id)
      .is('read_at', null);

    if (error) return send(res, 400, { error: error.message });
    return send(res, 200, { data: null });
  }

  return send(res, 405, { error: 'Method not allowed.' });
}
