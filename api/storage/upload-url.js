import { db, getApiProfile, getCompanyMembership, guard, readBody, requireApiUser, send } from '../_utils.js';

const allowedBuckets = new Set(['invoice-pdfs', 'invoice-xmls', 'documents', 'company-certificates']);

const bucketFolders = {
  'invoice-pdfs': 'invoices',
  'invoice-xmls': 'invoices',
  documents: 'documents',
  'company-certificates': 'certificates',
};

const bucketExtensions = {
  'invoice-pdfs': ['pdf'],
  'invoice-xmls': ['xml'],
  documents: ['pdf', 'png', 'jpg', 'jpeg', 'xml'],
  'company-certificates': ['pfx', 'p12'],
};

function sanitizeFileName(fileName = '') {
  return String(fileName)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function getExtension(fileName = '') {
  const parts = String(fileName).split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (!await requireApiUser(req, res)) return;

  try {
    const profile = await getApiProfile(req);
    if (!profile?.active_company_id) {
      return send(res, 403, { error: 'Empresa ativa nao encontrada.' });
    }

    const membership = await getCompanyMembership(req, profile.active_company_id);
    if (!membership) {
      return send(res, 403, { error: 'Voce nao tem acesso a esta empresa.' });
    }

    const body = await readBody(req);
    const bucket = String(body.bucket || '').trim();
    const fileName = sanitizeFileName(body.fileName);
    const recordId = sanitizeFileName(body.recordId || 'manual');
    const extension = getExtension(fileName);

    if (!allowedBuckets.has(bucket)) return send(res, 400, { error: 'Bucket nao permitido.' });
    if (!fileName || !extension) return send(res, 400, { error: 'Nome de arquivo invalido.' });
    if (!bucketExtensions[bucket].includes(extension)) return send(res, 400, { error: 'Extensao nao permitida para este bucket.' });
    if (bucket === 'company-certificates' && membership.role !== 'owner') {
      return send(res, 403, { error: 'Apenas proprietarios podem enviar certificados digitais.' });
    }

    const folder = bucketFolders[bucket];
    const path = `${profile.active_company_id}/${folder}/${recordId}/${Date.now()}-${fileName}`;
    const { data, error } = await db.storage.from(bucket).createSignedUploadUrl(path);

    if (error) return send(res, 400, { error: error.message });

    return send(res, 201, {
      data: {
        bucket,
        path,
        companyId: profile.active_company_id,
        signedUrl: data.signedUrl,
        token: data.token,
      },
    });
  } catch (error) {
    return send(res, 500, { error: error instanceof Error ? error.message : 'Erro ao gerar URL de upload.' });
  }
}
