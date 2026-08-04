import { db, getApiProfile, getCompanyMembership, guard, readBody, requireApiUser, send } from '../_utils.js';

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
  } catch (error) {
    return send(res, 500, { error: error instanceof Error ? error.message : 'Erro ao remover documento.' });
  }
}
