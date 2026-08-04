import { db, getCompanyMembership, guard, readBody, requireApiUser, send } from '../_utils.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'PATCH') return send(res, 405, { error: 'Method not allowed.' });
  if (!await requireApiUser(req, res)) return;

  const body = await readBody(req);
  const companyId = typeof body.company_id === 'string' ? body.company_id : '';
  if (!companyId) return send(res, 400, { error: 'Empresa invalida.' });

  const membership = await getCompanyMembership(req, companyId);
  if (!membership) return send(res, 403, { error: 'Voce nao tem acesso a esta empresa.' });

  const { data: profile, error } = await db
    .from('profiles')
    .update({ active_company_id: companyId })
    .eq('id', req.apiUser.id)
    .select('id, name, email, role, avatar_url, active_company_id')
    .single();

  if (error) return send(res, 400, { error: error.message });
  return send(res, 200, { data: { profile } });
}
