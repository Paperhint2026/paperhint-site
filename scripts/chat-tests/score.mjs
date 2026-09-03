/* One scorer for the runner, the rescorer and the report, so every pass is
   judged by the same rules even when the rules improve. */
import { FORBIDDEN, BANNED_VOCAB, LEAKS } from './cases.mjs';

export function score(c, reply, extra) {
  const { chips = [], link = null, asked = [] } = extra || {};
  const r = reply || '';
  const low = r.toLowerCase();
  const fails = [], warns = [];
  const sentences = (r.match(/[.!?](\s|$)/g) || []).length || (r.trim() ? 1 : 0);
  const words = r.trim().split(/\s+/).filter(Boolean).length;

  if (/!/.test(r)) fails.push('exclamation');
  const fp = FORBIDDEN.filter(f => low.includes(f)); if (fp.length) fails.push('forbidden: ' + fp.join(', '));
  const bv = BANNED_VOCAB.filter(v => low.includes(v)); if (bv.length) fails.push('banned vocab: ' + bv.join(', '));
  if (LEAKS.test(r)) fails.push('leak: ' + r.match(LEAKS)[0]);
  if (/^\s*(no|nope|yes|sorry|unfortunately|i can'?t|i cannot|i'?m sorry)\b/i.test(r)) warns.push('abrupt opener');
  /* numbered lists are allowed for question sets and steps; bold, headings and bulleted prose are not */
  if (/\*\*|^#{1,3}\s|^\s*[-*•]\s/m.test(r)) warns.push('markdown');
  const invite = /(ask me|try me|give me|throw me|throw it|tap|callback|show you|want to|shall i|would you like|tell me|send me|speak to that|another shot|what can i do|what.s on your mind|what were you|what would|share (that|a chapter|a topic)|pick one|go on|instead)/i.test(r);

  switch (c.kind) {
    case 'Z': if (sentences > 3) warns.push('long for a hello (' + sentences + ')'); if (!invite) warns.push('no offer'); break;
    case 'A': if (sentences < 2 || sentences > 5) warns.push('length ' + sentences + ' sentences'); break;
    case 'P': if (/₹|\$|\brs\.?\b|\b\d{2,}\b/i.test(r)) fails.push('quoted a number'); if (!/callback|call back|representative/i.test(r)) warns.push('no handover'); break;
    case 'B': if (!/chat box/i.test(r)) warns.push('missing closer'); break;
    case 'C': if (!/outside my desk|not my desk|not mine to call|isn.t my call|not my call|under the bonnet|only be guessing|only be making it up|staff-room argument/i.test(r)) warns.push('deflection not in voice'); if (!invite) warns.push('no offer after declining'); break;
    case 'G': if (/\d+\s?%/.test(r)) fails.push('accuracy figure'); break;
    case 'T': if (words <= 8) warns.push('curt (' + words + ' words)'); if (!invite) warns.push('no door opened'); break;
    case 'L': if (c.lang === 'hi' && !/[ऀ-ॿ]/.test(r) && !/\b(hai|kaise|aap|hum|kar)\b/i.test(r)) warns.push('not in Hindi');
              if (c.lang === 'ta' && !/[஀-௿]/.test(r)) warns.push('not in Tamil'); break;
    case 'M': if (c.recall && !c.recall.test(r)) warns.push('did not recall'); break;
  }
  if (c.expectName && !r.includes(c.expectName)) warns.push('did not use the name');

  /* the chips and the link, on every case */
  if (/\b(CHIPS|LINK)\s*:/i.test(r)) fails.push('marker leaked into the reply');
  const norm = t => String(t).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const before = new Set(asked.map(norm));
  const repeats = chips.filter(x => before.has(norm(x)));
  if (repeats.length) fails.push('chip repeats a question already asked: ' + repeats.join(', '));
  if (!chips.length) warns.push('no chips');
  else if (chips.length < 2) warns.push('only one chip');
  if (c.wantLink === true && !link) warns.push('asked where to read, got no link');
  if (c.wantLink === false && link) fails.push('link shoved in unasked: ' + link.href);
  if (c.wantLink === true && words < 20) fails.push('punted to the link instead of answering');

  return { fails, warns, sentences, words };
}
