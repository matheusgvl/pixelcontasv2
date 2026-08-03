import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const allowedOrigins = new Set(
  (
    process.env.CORS_ALLOWED_ORIGINS ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173,http://127.0.0.1:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

export const db = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const authClient = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const allowedTables = new Set([
  'profiles',
  'companies',
  'company_members',
  'clients',
  'products',
  'services',
  'sales',
  'invoices',
  'invoice_items',
  'invoice_logs',
  'invoice_events',
  'tax_settings',
  'integrations',
  'automations',
  'webhook_events',
  'documents',
  'pending_tasks',
  'chat_messages',
]);

export function send(res, status, body) {
  res.status(status).json(body);
}

export function withCors(req, res) {
  const origin = req.headers.origin;

  if (origin && !allowedOrigins.has(origin)) {
    send(res, 403, { error: 'Origem nao permitida pela API.' });
    return true;
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function requireConfig(res) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    send(res, 500, {
      error: 'Supabase environment variables are not configured. Set SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY on the backend.',
    });
    return false;
  }
  return true;
}

export function guard(req, res) {
  if (withCors(req, res)) return false;
  return requireConfig(res);
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (!req.body) return {};
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

export function applyQuery(builder, query) {
  builder = builder.select(query.select ? String(query.select) : '*');

  Object.entries(query).forEach(([key, value]) => {
    if (!key.startsWith('eq_') || value === undefined || value === '') return;
    builder = builder.eq(key.slice(3), value);
  });

  if (query.order) {
    const [column, direction = 'asc'] = String(query.order).split(':');
    builder = builder.order(column, { ascending: direction !== 'desc' });
  }

  if (query.limit) builder = builder.limit(Number(query.limit));
  return builder;
}

export async function requireApiUser(req, res, options = {}) {
  if (options.allowPublic) return true;

  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    send(res, 401, { error: 'Missing API authorization token.' });
    return false;
  }

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    send(res, 401, { error: 'Invalid API authorization token.' });
    return false;
  }

  req.apiUser = data.user;
  return true;
}

export async function getApiProfile(req) {
  if (!req.apiUser?.id) return null;

  const { data, error } = await db
    .from('profiles')
    .select('id, name, email, role, active_company_id')
    .eq('id', req.apiUser.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getCompanyMembership(req, companyId) {
  if (!req.apiUser?.id || !companyId) return null;

  const { data, error } = await db
    .from('company_members')
    .select('id, role')
    .eq('profile_id', req.apiUser.id)
    .eq('company_id', companyId)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function authorizeTableRead(req, res, table, query = {}, id = null) {
  const profile = await getApiProfile(req);
  if (!profile) {
    send(res, 403, { error: 'Perfil do usuario nao encontrado.' });
    return false;
  }

  if (profile.role === 'admin') return true;
  if (table === 'profiles') {
    const requestedId = id || query.eq_id;
    if (!requestedId || requestedId === req.apiUser.id) return true;
    send(res, 403, { error: 'Voce so pode acessar o proprio perfil.' });
    return false;
  }

  const companyScopedTables = new Set([
    'companies',
    'company_members',
    'clients',
    'products',
    'services',
    'sales',
    'invoices',
    'invoice_items',
    'invoice_logs',
    'invoice_events',
    'tax_settings',
    'integrations',
    'automations',
    'webhook_events',
    'documents',
    'pending_tasks',
    'chat_messages',
  ]);

  if (!companyScopedTables.has(table)) return true;

  const companyId = query.eq_company_id || profile.active_company_id;
  if (!companyId) {
    send(res, 403, { error: 'Empresa ativa nao encontrada para filtrar o recurso.' });
    return false;
  }

  const membership = await getCompanyMembership(req, companyId);
  if (membership) return true;

  send(res, 403, { error: 'Voce nao tem acesso a esta empresa.' });
  return false;
}

export async function applyAuthorizedReadScope(builder, req, table) {
  const profile = await getApiProfile(req);
  if (!profile || profile.role === 'admin') return { builder };

  if (table === 'profiles') return { builder: builder.eq('id', req.apiUser.id) };
  if (table === 'companies') {
    const { data } = await db
      .from('company_members')
      .select('company_id')
      .eq('profile_id', req.apiUser.id)
      .eq('status', 'active');
    const companyIds = Array.isArray(data) ? data.map((item) => item.company_id).filter(Boolean) : [];
    if (!companyIds.length) return { builder: builder.eq('id', '00000000-0000-0000-0000-000000000000') };
    return { builder: builder.in('id', companyIds) };
  }

  if (table === 'company_members') return { builder: builder.eq('profile_id', req.apiUser.id) };
  if (profile.active_company_id) return { builder: builder.eq('company_id', profile.active_company_id) };
  return { builder };
}

export async function authorizeDomainMutation(req, res, table, body = {}, existingRow = null) {
  const profile = await getApiProfile(req);
  if (!profile) {
    send(res, 403, { error: 'Perfil do usuario nao encontrado.' });
    return false;
  }

  if (profile.role === 'admin') return true;

  if (table === 'profiles') {
    const targetId = existingRow?.id || body.id;
    if (targetId === req.apiUser.id) {
      if (body.active_company_id) {
        const membership = await getCompanyMembership(req, body.active_company_id);
        if (!membership) {
          send(res, 403, { error: 'Voce nao pode ativar uma empresa sem vinculo ativo.' });
          return false;
        }
      }
      return true;
    }
    send(res, 403, { error: 'Voce so pode alterar o proprio perfil.' });
    return false;
  }

  const companyId = table === 'companies'
    ? existingRow?.id || body.id || profile.active_company_id
    : body.company_id || existingRow?.company_id || profile.active_company_id;

  if (table === 'companies' && !existingRow) {
    send(res, 403, { error: 'Crie empresas pelo fluxo de onboarding.' });
    return false;
  }

  const membership = await getCompanyMembership(req, companyId);
  if (!membership) {
    send(res, 403, { error: 'Voce nao tem acesso a esta empresa.' });
    return false;
  }

  if (table === 'company_members' && membership.role !== 'owner') {
    send(res, 403, { error: 'Apenas proprietarios podem gerenciar usuarios da empresa.' });
    return false;
  }

  if (['owner', 'accountant'].includes(membership.role)) return true;

  const operatorWritableTables = new Set(['clients', 'products', 'services', 'sales', 'invoices', 'invoice_items']);
  if (membership.role === 'operator' && operatorWritableTables.has(table)) return true;

  send(res, 403, { error: 'Seu perfil nao tem permissao para alterar este recurso.' });
  return false;
}

export async function enforceCompanyMutationScope(req, res, table, payload = {}, existingRow = null) {
  const profile = await getApiProfile(req);
  if (!profile) {
    send(res, 403, { error: 'Perfil do usuario nao encontrado.' });
    return null;
  }

  if (profile.role === 'admin') return payload;

  if (table === 'profiles') {
    const safePayload = { ...payload };
    if (safePayload.role && safePayload.role !== profile.role) delete safePayload.role;
    return safePayload;
  }

  if (table === 'companies') return payload;

  const targetCompanyId = existingRow?.company_id || payload.company_id || profile.active_company_id;
  const membership = await getCompanyMembership(req, targetCompanyId);
  if (!membership) {
    send(res, 403, { error: 'Voce nao tem acesso a esta empresa.' });
    return null;
  }

  return {
    ...payload,
    company_id: targetCompanyId,
  };
}

export function friendlyDatabaseError(table, error) {
  if (error?.code === '23505') return 'Registro duplicado.';
  if (error?.code === '23503') return 'Registro relacionado nao encontrado.';
  return error?.message || `Erro ao salvar ${table}.`;
}
