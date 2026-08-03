import { authClient, guard, readBody, send } from '../_utils.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });

  const { email, password } = await readBody(req);
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error) return send(res, 401, { error: error.message });
  return send(res, 200, { data });
}
