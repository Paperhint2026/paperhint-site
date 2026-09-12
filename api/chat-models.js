/* Which models answer, and in what order.
 *
 * The list is tried top to bottom. A candidate is skipped when its key
 * isn't set, and the next one is tried when a call fails in a way that
 * another model could survive — a wrong/retired model name (400/404),
 * a rate limit (429), or the provider having a bad day (5xx). A real
 * answer stops the chain; so does a refusal, because that's an answer.
 *
 * Edit this list freely — it's the whole failover policy. Put the model
 * you want first; keep a different provider further down so one
 * provider's outage isn't your outage.
 *
 * Keys come from the environment: OPENAI_API_KEY, GEMINI_API_KEY.
 * CHAT_MODEL (+ optional CHAT_PROVIDER) jumps the queue without a code
 * change, for when you need to swap in a hurry.
 */
export const MODELS = [
  { provider: 'openai', model: 'gpt-4o-mini' },   // fast and cheap — the everyday answer
  { provider: 'openai', model: 'gpt-4o' },        // same key, better model, if the first is gone
  { provider: 'gemini', model: 'gemini-2.0-flash' },  // different provider — survives an OpenAI outage
  { provider: 'gemini', model: 'gemini-1.5-flash' },
];

/* Keys, by provider. */
export const KEYS = {
  openai: () => process.env.OPENAI_API_KEY,
  gemini: () => process.env.GEMINI_API_KEY,
};

/* The list to actually try: an env override first, then the list above,
 * with anything whose key is missing dropped. */
export function candidates() {
  const list = [];
  const forcedModel = process.env.CHAT_MODEL;
  const forcedProvider = (process.env.CHAT_PROVIDER || '').toLowerCase();
  if (forcedModel) {
    const provider = forcedProvider || (/^gemini/i.test(forcedModel) ? 'gemini' : 'openai');
    list.push({ provider, model: forcedModel, forced: true });
  }
  for (const c of MODELS) {
    if (forcedProvider && c.provider !== forcedProvider) continue;
    if (list.some(x => x.provider === c.provider && x.model === c.model)) continue;
    list.push(c);
  }
  return list.filter(c => Boolean(KEYS[c.provider] && KEYS[c.provider]()));
}

/* Worth trying the next model? Auth problems mean that provider is out,
 * not that the model is wrong — but the next candidate may be a
 * different provider, so we keep walking either way. */
export function shouldFallOver(status) {
  return status === 400 || status === 401 || status === 403 ||
         status === 404 || status === 429 || (status >= 500 && status < 600) ||
         status === 0;   /* network / timeout */
}
