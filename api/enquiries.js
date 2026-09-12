/* The enquiry log, as a page you can open.
 *
 *   /api/enquiries?token=<ENQUIRY_TOKEN>
 *   /api/enquiries?token=…&format=json
 *
 * Set ENQUIRY_TOKEN in Vercel to any long random string. Without it the
 * page refuses to open — an unprotected list of school contacts is not
 * something to leave on the internet.
 */
import { read, logging } from './_log.js';

export default async function handler(req, res) {
  const want = process.env.ENQUIRY_TOKEN;
  const got = (req.query && req.query.token) || '';
  if (!want) return send(res, 503, 'text/plain', 'Set ENQUIRY_TOKEN in Vercel to open this page.');
  if (got !== want) { res.setHeader('WWW-Authenticate', 'Token'); return send(res, 401, 'text/plain', 'Not for you.'); }

  if (!logging()) {
    return send(res, 503, 'text/plain',
      'No store connected. Add KV_REST_API_URL and KV_REST_API_TOKEN in Vercel\n' +
      '(Storage → Upstash Redis → Connect, or any Redis with a REST endpoint).\n' +
      'Until then enquiries reach support@paperhint.com by email and appear in the runtime logs.');
  }

  let rows;
  try { rows = await read(300); }
  catch (e) { return send(res, 502, 'text/plain', 'Could not read the log: ' + e.message); }

  if ((req.query && req.query.format) === 'json') {
    return send(res, 200, 'application/json', JSON.stringify(rows, null, 2));
  }

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const when = iso => { const d = new Date(iso); return isNaN(d) ? esc(iso) : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); };

  const counts = rows.reduce((a, r) => (a[r.kind] = (a[r.kind] || 0) + 1, a), {});
  const body = rows.map(r => `
    <tr class="${esc(r.kind)}">
      <td class="when">${when(r.at)}</td>
      <td><span class="tag ${esc(r.kind)}">${esc(r.kind === 'question' ? 'asked' : r.kind || '—')}</span></td>
      <td>${r.name ? '<b>' + esc(r.name) + '</b><br>' : ''}${r.school ? esc(r.school) : ''}</td>
      <td>${r.email ? `<a href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : '<span class="dim">—</span>'}</td>
      <td class="text">${esc(r.text || '')}${r.reply ? `<div class="reply">${esc(r.reply)}</div>` : ''}</td>
      <td class="dim">${esc(r.page || '')}</td>
    </tr>`).join('');

  send(res, 200, 'text/html', `<!doctype html><meta charset="utf-8"><title>Paperhint — enquiries</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<style>
 body{margin:0;padding:28px 22px 60px;background:#FCFBF8;color:#14201A;
   font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif}
 h1{font-size:21px;font-weight:600;letter-spacing:-.02em;margin:0 0 4px}
 h1 em{font-family:Georgia,serif;font-style:italic;color:#0B8A5C}
 .sub{color:#68766E;font-size:13px;margin-bottom:20px}
 table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #E8E4D8;border-radius:12px;overflow:hidden}
 th{text-align:left;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#68766E;
   padding:10px 12px;border-bottom:1px solid #E8E4D8;background:#FAF8F2;font-weight:600}
 td{padding:11px 12px;border-bottom:1px solid #F2EFE6;vertical-align:top}
 tr:last-child td{border-bottom:none}
 tr.callback{background:#F4FAF7}
 .when{color:#68766E;white-space:nowrap;font-size:12.5px}
 .tag{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;
   background:#EFEDE4;color:#3D4F47;white-space:nowrap}
 .tag.callback{background:#E3F1EA;color:#0B8A5C}
 .text{max-width:520px}
 .reply{margin-top:5px;padding-left:10px;border-left:2px solid #E8E4D8;color:#68766E;font-size:13px}
 .dim{color:#9AA39C;font-size:12.5px}
 a{color:#0B8A5C}
 .empty{padding:40px;text-align:center;color:#68766E}
</style>
<h1>Paper<em>h</em>int — enquiries</h1>
<p class="sub">${rows.length} most recent · ${counts.callback || 0} callback ${counts.callback === 1 ? 'request' : 'requests'} · ${counts.question || 0} question${counts.question === 1 ? '' : 's'} asked ·
  <a href="?token=${encodeURIComponent(got)}&format=json">JSON</a></p>
${rows.length ? `<table><thead><tr><th>When</th><th>Kind</th><th>Who</th><th>Email</th><th>What</th><th>Page</th></tr></thead><tbody>${body}</tbody></table>`
              : '<div class="empty">Nothing logged yet.</div>'}`);
}

function send(res, code, type, body) {
  res.status(code).setHeader('Content-Type', type + '; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(body);
}
