import { db, getApiProfile, getCompanyMembership, guard, readBody, requireApiUser, send } from './_utils.js';

const roleMap = {
  Administrador: 'owner',
  Contador: 'accountant',
  Operador: 'operator',
};

function inviteRedirectUrl(req) {
  const baseUrl = process.env.FRONTEND_URL || req.headers.origin || '';
  return baseUrl ? `${baseUrl.replace(/\/$/, '')}/login` : undefined;
}

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (!await requireApiUser(req, res)) return;

  const profile = await getApiProfile(req);
  if (!profile?.active_company_id) {
    return send(res, 403, { error: 'Empresa ativa nao encontrada para convidar usuarios.' });
  }

  const membership = await getCompanyMembership(req, profile.active_company_id);
  if (membership?.role !== 'owner') {
    return send(res, 403, { error: 'Apenas proprietarios podem convidar usuarios.' });
  }

  const body = await readBody(req);
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const role = roleMap[body.role] || body.role;

  if (!name || !email || !role) {
    return send(res, 400, { error: 'Informe nome, email e papel do usuario.' });
  }

  if (!['owner', 'accountant', 'operator'].includes(role)) {
    return send(res, 400, { error: 'Papel de usuario invalido.' });
  }

  const { data: inviteData, error: inviteError } = await db.auth.admin.inviteUserByEmail(email, {
    data: { name },
    redirectTo: inviteRedirectUrl(req),
  });

  if (inviteError) return send(res, 400, { error: inviteError.message });

  const invitedUser = inviteData?.user;
  if (!invitedUser?.id) {
    return send(res, 400, { error: 'Supabase nao retornou o usuario convidado.' });
  }

  const { error: profileError } = await db
    .from('profiles')
    .upsert({
      id: invitedUser.id,
      name,
      email,
      role,
      active_company_id: profile.active_company_id,
      is_active: true,
    }, { onConflict: 'id' });

  if (profileError) return send(res, 400, { error: profileError.message });

  const { data: member, error: memberError } = await db
    .from('company_members')
    .upsert({
      company_id: profile.active_company_id,
      profile_id: invitedUser.id,
      role,
      status: 'invited',
    }, { onConflict: 'company_id,profile_id' })
    .select('id, role, status, profile:profiles(id,name,email,is_active)')
    .single();

  if (memberError) return send(res, 400, { error: memberError.message });

  return send(res, 201, { data: member });
}
