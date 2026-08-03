import { allowedTables, applyAuthorizedReadScope, applyQuery, authorizeDomainMutation, authorizeTableRead, db, enforceCompanyMutationScope, friendlyDatabaseError, guard, readBody, requireApiUser, send } from '../_utils.js';
import { validateTablePayload } from '../_validators.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;

  const table = req.query.table;
  if (!allowedTables.has(table)) return send(res, 404, { error: 'Unknown resource.' });
  if (!await requireApiUser(req, res)) return;

  try {
    if (req.method === 'GET') {
      if (!await authorizeTableRead(req, res, table, req.query)) return;

      let { builder: query } = await applyAuthorizedReadScope(applyQuery(db.from(table), req.query), req, table);
      if (req.query.single === 'maybe') query = query.maybeSingle();
      else if (req.query.single === 'true') query = query.single();
      const { data, error } = await query;
      if (error) return send(res, 400, { error: error.message });
      return send(res, 200, { data });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const validation = validateTablePayload(table, body, 'POST');
      if (!validation.ok) return send(res, validation.status, { error: validation.error, fields: validation.fields });
      let payload = validation.payload;
      if (!await authorizeDomainMutation(req, res, table, payload)) return;
      payload = await enforceCompanyMutationScope(req, res, table, payload);
      if (!payload) return;

      const { data, error } = await db.from(table).insert(payload).select().single();
      if (error) return send(res, error.code === '23505' ? 409 : 400, { error: friendlyDatabaseError(table, error) });
      return send(res, 201, { data });
    }

    return send(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return send(res, 500, { error: error instanceof Error ? error.message : 'Unexpected API error.' });
  }
}
