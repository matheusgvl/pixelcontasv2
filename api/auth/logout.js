import { guard, send } from '../_utils.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  return send(res, 200, { data: null });
}
