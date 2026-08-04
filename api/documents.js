import { db, getApiProfile, getCompanyMembership, guard, readBody, requireApiUser, send } from './_utils.js';
import { createNotification } from './_notifications.js';

const allowedCategories = new Set(['invoice', 'bank_statement', 'receipt', 'contract', 'payroll', 'corporate', 'others']);
const allowedStatus = new Set(['sent', 'pending', 'reviewed']);
const categoryLabels = {
  invoice: 'Notas Fiscais',
  bank_statement: 'Extrato Bancario',
  receipt: 'Comprovante / Recibo',
  contract: 'Contrato',
  payroll: 'Folha de Pagamento',
  corporate: 'Documento Societario',
  others: 'Outros',
};

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

async function getAuthorizedProfile(req, res) {
  const profile = await getApiProfile(req);
  if (!profile?.active_company_id) {
    send(res, 403, { error: 'Empresa ativa nao encontrada.' });
    return null;
  }

  const membership = await getCompanyMembership(req, profile.active_company_id);
  if (!membership) {
    send(res, 403, { error: 'Voce nao tem acesso a esta empresa.' });
    return null;
  }

  return profile;
}

async function createDocument(req, res, profile) {
  const body = await readBody(req);
  const fields = {};

  if (!hasValue(body.name)) fields.name = 'Campo obrigatorio.';
  if (!hasValue(body.category) || !allowedCategories.has(body.category)) fields.category = 'Categoria invalida.';
  if (!hasValue(body.competence)) fields.competence = 'Campo obrigatorio.';
  if (!hasValue(body.status) || !allowedStatus.has(body.status)) fields.status = 'Status invalido.';
  if (!hasValue(body.file_url)) fields.file_url = 'Campo obrigatorio.';

  if (Object.keys(fields).length > 0) {
    return send(res, 400, {
      error: 'Dados invalidos para salvar o documento.',
      fields,
    });
  }

  const { data, error } = await db
    .from('documents')
    .insert({
      company_id: profile.active_company_id,
      name: body.name,
      category: body.category,
      competence: body.competence,
      status: body.status,
      sender_name: body.sender_name || profile.name || 'Usuario PixelConta',
      file_url: body.file_url,
      file_size: body.file_size || null,
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error) return send(res, 400, { error: error.message });

  await createNotification({
    companyId: profile.active_company_id,
    title: 'Documento enviado',
    description: `${data.name} foi enviado em ${categoryLabels[data.category] || 'Documentos'} para a competencia ${data.competence}.`,
    type: 'info',
    metadata: {
      source: 'documents',
      document_id: data.id,
      category: data.category,
      competence: data.competence,
    },
  });

  return send(res, 201, { data });
}

async function deleteDocument(req, res, profile) {
  const body = await readBody(req);
  const documentId = String(body.id || '').trim();
  if (!documentId) return send(res, 400, { error: 'Documento invalido.' });

  const { data: document, error: documentError } = await db
    .from('documents')
    .select('id, company_id, file_url')
    .eq('id', documentId)
    .maybeSingle();

  if (documentError) return send(res, 400, { error: documentError.message });
  if (!document) return send(res, 404, { error: 'Documento nao encontrado.' });
  if (document.company_id !== profile.active_company_id) {
    return send(res, 403, { error: 'Documento fora da empresa ativa.' });
  }

  const filePath = String(document.file_url || '').trim();
  if (filePath) {
    if (filePath.includes('..') || !filePath.startsWith(`${profile.active_company_id}/`)) {
      return send(res, 400, { error: 'Caminho de arquivo invalido.' });
    }

    const { error: storageError } = await db.storage.from('documents').remove([filePath]);
    if (storageError) return send(res, 400, { error: storageError.message });
  }

  const { error: deleteError } = await db
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('company_id', profile.active_company_id);

  if (deleteError) return send(res, 400, { error: deleteError.message });
  return send(res, 200, { data: null });
}

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (!await requireApiUser(req, res)) return;

  try {
    const profile = await getAuthorizedProfile(req, res);
    if (!profile) return;

    if (req.method === 'POST') return createDocument(req, res, profile);
    if (req.method === 'DELETE') return deleteDocument(req, res, profile);

    return send(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return send(res, 500, { error: error instanceof Error ? error.message : 'Erro ao processar documento.' });
  }
}
