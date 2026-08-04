import { db, getApiProfile, getCompanyMembership, guard, readBody, requireApiUser, send } from '../_utils.js';
import { createNotification } from '../_notifications.js';

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

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (!await requireApiUser(req, res)) return;

  try {
    const profile = await getApiProfile(req);
    if (!profile?.active_company_id) return send(res, 403, { error: 'Empresa ativa nao encontrada.' });

    const membership = await getCompanyMembership(req, profile.active_company_id);
    if (!membership) return send(res, 403, { error: 'Voce nao tem acesso a esta empresa.' });

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
  } catch (error) {
    return send(res, 500, { error: error instanceof Error ? error.message : 'Erro ao salvar documento.' });
  }
}
