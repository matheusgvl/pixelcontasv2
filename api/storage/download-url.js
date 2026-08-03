import { db, getApiProfile, getCompanyMembership, guard, readBody, requireApiUser, send } from '../_utils.js';

const allowedBuckets = new Set(['invoice-pdfs', 'invoice-xmls', 'documents', 'company-certificates']);

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
    const bucket = String(body.bucket || '').trim();
    const path = String(body.path || '').trim();
    const fileName = String(body.fileName || path.split('/').pop() || 'download').trim();

    if (!allowedBuckets.has(bucket)) return send(res, 400, { error: 'Bucket nao permitido.' });
    if (!path || path.includes('..')) return send(res, 400, { error: 'Caminho de arquivo invalido.' });
    if (!path.startsWith(`${profile.active_company_id}/`)) {
      return send(res, 403, { error: 'Arquivo fora da empresa ativa.' });
    }
    if (bucket === 'company-certificates' && membership.role !== 'owner') {
      return send(res, 403, { error: 'Apenas proprietarios podem baixar certificados digitais.' });
    }

    const { data, error } = await db.storage.from(bucket).createSignedUrl(path, 60 * 5, {
      download: fileName,
    });
    if (error) return send(res, 400, { error: error.message });

    return send(res, 200, {
      data: {
        bucket,
        path,
        fileName,
        signedUrl: data.signedUrl,
        expiresIn: 300,
      },
    });
  } catch (error) {
    return send(res, 500, { error: error instanceof Error ? error.message : 'Erro ao gerar URL de download.' });
  }
}
