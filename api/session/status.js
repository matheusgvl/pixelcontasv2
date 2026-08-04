import { db, guard, requireApiUser, send } from '../_utils.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });
  if (!await requireApiUser(req, res)) return;

  const { data: profile, error } = await db
    .from('profiles')
    .select('id, name, email, role, avatar_url, active_company_id')
    .eq('id', req.apiUser.id)
    .maybeSingle();

  if (error) return send(res, 400, { error: error.message });

  let companies = [];
  if (profile) {
    const { data: memberships, error: membershipsError } = await db
      .from('company_members')
      .select('role, company:companies(id, legal_name, trade_name, cnpj, status)')
      .eq('profile_id', req.apiUser.id)
      .eq('status', 'active');

    if (membershipsError) return send(res, 400, { error: membershipsError.message });
    companies = (memberships || [])
      .map((membership) => ({
        role: membership.role,
        ...membership.company,
      }))
      .filter((company) => company.id);
  }

  return send(res, 200, {
    data: {
      hasProfile: Boolean(profile),
      hasActiveCompany: Boolean(profile?.active_company_id),
      profile,
      companies,
    },
  });
}
