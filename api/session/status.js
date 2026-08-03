import { db, guard, requireApiUser, send } from '../_utils.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });
  if (!await requireApiUser(req, res)) return;

  const { data: profile, error } = await db
    .from('profiles')
    .select('id, name, email, role, active_company_id')
    .eq('id', req.apiUser.id)
    .maybeSingle();

  if (error) return send(res, 400, { error: error.message });

  return send(res, 200, {
    data: {
      hasProfile: Boolean(profile),
      hasActiveCompany: Boolean(profile?.active_company_id),
      profile,
    },
  });
}
