import { allowedTables, applyAuthorizedReadScope, applyQuery, authorizeDomainMutation, authorizeTableRead, db, guard, readBody, requireApiUser, send } from '../../_utils.js';
import { validateTablePayload } from '../../_validators.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;

  const { table, id } = req.query;
  if (!allowedTables.has(table)) return send(res, 404, { error: 'Unknown resource.' });
  if (!id) return send(res, 400, { error: 'Missing id.' });
  if (!await requireApiUser(req, res)) return;

  try {
    if (req.method === 'GET') {
      if (!await authorizeTableRead(req, res, table, req.query, id)) return;

      let { builder: query } = await applyAuthorizedReadScope(applyQuery(db.from(table), req.query), req, table);
      query = query.eq('id', id);
      if (req.query.single === 'true') query = query.single();
      else query = query.maybeSingle();
      const { data, error } = await query;
      if (error) return send(res, 400, { error: error.message });
      return send(res, 200, { data });
    }

    if (req.method === 'PATCH') {
      const body = await readBody(req);
      const validation = validateTablePayload(table, body, 'PATCH');
      if (!validation.ok) return send(res, validation.status, { error: validation.error, fields: validation.fields });
      const payload = validation.payload;
      const { data: existingRow, error: existingError } = await db.from(table).select('*').eq('id', id).maybeSingle();
      if (existingError) return send(res, 400, { error: existingError.message });
      if (!existingRow) return send(res, 404, { error: 'Registro nao encontrado.' });
      if (!await authorizeDomainMutation(req, res, table, payload, existingRow)) return;

      const { data, error } = await db.from(table).update(payload).eq('id', id).select().single();
      if (error) return send(res, 400, { error: error.message });
      return send(res, 200, { data });
    }

    if (req.method === 'DELETE') {
      const { data: existingRow, error: existingError } = await db.from(table).select('*').eq('id', id).maybeSingle();
      if (existingError) return send(res, 400, { error: existingError.message });
      if (!existingRow) return send(res, 404, { error: 'Registro nao encontrado.' });
      if (!await authorizeDomainMutation(req, res, table, {}, existingRow)) return;

      const { error } = await db.from(table).delete().eq('id', id);
      if (error) return send(res, 400, { error: error.message });
      return send(res, 200, { data: null });
    }

    return send(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return send(res, 500, { error: error instanceof Error ? error.message : 'Unexpected API error.' });
  }
}
