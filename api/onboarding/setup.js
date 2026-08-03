import { db, guard, readBody, requireApiUser, send } from '../_utils.js';

function normalizeAddress(body) {
  return {
    zipCode: body.cep || '',
    street: body.endereco || '',
    number: body.numero || '',
    complement: body.complemento || '',
    neighborhood: body.bairro || '',
    city: body.cidade || '',
    state: body.estado || '',
  };
}

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (!await requireApiUser(req, res)) return;

  const body = await readBody(req);
  if (!body.razaoSocial || !body.cnpj) {
    return send(res, 400, { error: 'Razao social e CNPJ sao obrigatorios.' });
  }

  const user = req.apiUser;
  const userName = body.userName || user.user_metadata?.name || user.email || 'Usuario PixelConta';

  const { data: company, error: companyError } = await db
    .from('companies')
    .insert({
      legal_name: body.razaoSocial,
      trade_name: body.nomeFantasia || null,
      cnpj: body.cnpj,
      state_registration: body.inscEstadual || null,
      municipal_registration: body.inscMunicipal || null,
      tax_regime: body.regimeTributario || 'Simples Nacional',
      cnae_primary: body.cnae || null,
      email: body.email || user.email,
      phone: body.telefone || null,
      address: normalizeAddress(body),
      certificate_status: body.certificateUploaded ? 'valid' : 'missing',
      settings: {
        operationTypes: body.operationTypes || [],
        environment: body.ambiente || 'Homologacao',
        initialInvoiceNumber: body.numeroInicial || '1',
        certificateConfigured: Boolean(body.certificateUploaded),
      },
      status: 'active',
    })
    .select()
    .single();

  if (companyError) return send(res, 400, { error: companyError.message });

  const { error: profileError } = await db
    .from('profiles')
    .upsert({
      id: user.id,
      name: userName,
      email: user.email,
      role: 'owner',
      active_company_id: company.id,
      is_active: true,
    });

  if (profileError) return send(res, 400, { error: profileError.message });

  const { error: memberError } = await db
    .from('company_members')
    .upsert({
      company_id: company.id,
      profile_id: user.id,
      role: 'owner',
      status: 'active',
    });

  if (memberError) return send(res, 400, { error: memberError.message });

  const { error: taxError } = await db
    .from('tax_settings')
    .insert({
      company_id: company.id,
      name: 'Configuracao fiscal padrao',
      invoice_type: body.tipoNota || 'NFS-e',
      tax_regime: body.regimeTributario || 'Simples Nacional',
      nature_of_operation: body.naturezaOperacao || 'Prestacao de servicos',
      service_city: body.municipioEmissao || body.cidade || null,
      settings: {
        series: body.serieNota || '1',
        environment: body.ambiente || 'Homologacao',
        integrations: body.connectedIntegrations || [],
      },
      status: 'active',
    });

  if (taxError) return send(res, 400, { error: taxError.message });

  return send(res, 201, { data: { company } });
}
