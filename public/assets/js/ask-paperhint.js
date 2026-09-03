/* <ask-paperhint> — the Ask Paperhint assistant, as a self-contained
 * custom element. Markup, styles, stories and behaviour all live here, so
 * it can be worked on (or dropped into another product) on its own.
 *
 *   <ask-paperhint></ask-paperhint>
 *
 * Attributes (all optional):
 *   endpoint="/api/chat"        the answering brain; omit for canned replies
 *   contact-endpoint="/api/contact"   where a callback request is filed
 *
 * Config from JS:
 *   window.PaperhintChat.endpoint = '/api/chat';
 *   window.PaperhintChat.adapter  = async (q, history) => 'reply';
 *
 * Styling: it reads the page's design tokens (--ink, --emerald, --surface…)
 * through the shadow boundary and falls back to its own values, so it looks
 * right on a page that has never heard of Paperhint's stylesheet.
 */
(function () {
  'use strict';

  var MARK = '<svg class="mark" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M13.0084 1.3766C13.7737 2.14565 14.2463 3.15379 14.3544 4.22631C15.3798 2.58856 15.6072 1.73351 15.6072 1.73351C16.6106 2.46619 17.2834 3.56947 17.4774 4.80065C17.6467 5.87486 17.4395 6.96965 16.8996 7.90118C18.6871 7.18196 19.3711 6.62453 19.3711 6.62453C19.7544 7.81004 19.6534 9.10001 19.0903 10.2107C18.599 11.1797 17.791 11.943 16.8095 12.3777C18.6762 12.8518 19.5556 12.8049 19.5556 12.8049C19.1723 13.9904 18.3361 14.9743 17.231 15.5402C16.2668 16.034 15.1667 16.1742 14.1183 15.9461C15.3513 17.4323 16.0902 17.9139 16.0902 17.9139C15.0867 18.6465 13.8348 18.9486 12.6097 18.7536C11.5408 18.5835 10.5688 18.0471 9.85413 17.2432C9.98239 19.1739 10.2985 20 10.2985 20C9.0582 20 7.86867 19.5048 6.99163 18.6234C6.2264 17.8544 5.75375 16.8462 5.64567 15.7737C4.62023 17.4115 4.39286 18.2665 4.39286 18.2665C3.38941 17.5338 2.71668 16.4305 2.52265 15.1994C2.35335 14.1252 2.56059 13.0304 3.10043 12.0989C1.31296 12.8181 0.628921 13.3755 0.628921 13.3755C0.245639 12.19 0.346658 10.9 0.909756 9.78937C1.40106 8.82031 2.20902 8.05702 3.19058 7.6223C1.32385 7.14827 0.444435 7.19517 0.444435 7.19517C0.827718 6.00966 1.66391 5.02572 2.76905 4.45982C3.7333 3.96606 4.83338 3.82582 5.88173 4.05395C4.64875 2.56773 3.90986 2.08618 3.90986 2.08618C4.9133 1.3535 6.16527 1.05143 7.39032 1.24643C8.4592 1.41657 9.4312 1.95295 10.1459 2.75678C10.0177 0.826064 9.70151 0 9.70151 0C10.9418 2.42706e-07 12.1314 0.495178 13.0084 1.3766Z"/></svg>';

  /* ------------------------------------------------------------ content
     The role stories and the follow-up suggestions used to live here. They
     now come from /api/chat-config, which reads them from the database with
     the repo's api/chat-content.js as its fallback, so the copy can change
     without a deploy. Until it arrives the panel still takes questions; only
     the story chips wait. */
  var CONTENT = { stories: [], followups: [], fallback: [] };
  var byRole = {};
  var contentReady = null;

  function loadContent(endpoint) {
    if (contentReady) return contentReady;
    contentReady = fetch(endpoint || '/api/chat-config', { credentials: 'omit' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        CONTENT = {
          stories: (j && j.stories) || [],
          followups: (j && j.followups) || [],
          fallback: (j && j.fallback) || []
        };
        byRole = {};
        CONTENT.stories.forEach(function (s) { byRole[s.key] = s; });
        return CONTENT;
      })
      .catch(function () { return CONTENT; });   /* input still works */
    return contentReady;
  }

  /* Authored copy may use a little emphasis; everything else is stripped, so
     a row in the database can never inject markup into the page. */
  var OK_TAGS = /^(b|i|em|strong|br)$/i;
  function trusted(html) {
    var box = document.createElement('div');
    box.innerHTML = String(html == null ? '' : html);
    (function walk(node) {
      var kids = [].slice.call(node.childNodes);
      kids.forEach(function (kid) {
        if (kid.nodeType === 1) {
          if (!OK_TAGS.test(kid.tagName)) {
            var text = document.createTextNode(kid.textContent);
            node.replaceChild(text, kid);
            return;
          }
          [].slice.call(kid.attributes).forEach(function (a) { kid.removeAttribute(a.name); });
          walk(kid);
        }
      });
    })(box);
    return box.innerHTML;
  }


  /* Fallback brain while no endpoint is set. */
  var CANNED = [
    [/^\s*(hi|hey|hello|yo|namaste|hola|good (morning|afternoon|evening))\b[\s!.?]*$/i,
     'Hello. Ask me how Paperhint works, what a pilot looks like, or give me something to draft for a class — I’ll show you rather than describe it.'],
    [/^\s*(thanks|thank you|ok|okay|cool|great)\b[\s!.?]*$/i, 'Any time. Anything else you want off your desk?'],
    [/who are you|are you (a )?(bot|human|ai|real)/i,
     'I’m Paperhint’s assistant — I answer questions about the product, and I can draft something for a class if you want to see how it works. A person follows up on anything I can’t settle.'],
    [/evaluat|grade|grading|answer sheet|scan|correct/i, 'Photograph answer sheets with the mobile app — Paperhint checks each answer against its question and scores it on your rubric, the same way for every student. You review and approve.'],
    [/pric|cost|fee|plan/i, 'Pricing is per enrolled student, and we’re setting it with our founding schools right now — there’s no rate card yet. Tap “Arrange a callback” and we’ll work it out together.'],
    [/parent|notif|whatsapp|absen/i, 'Parents hear the moment homework is assigned, and absences read from the attendance sheet reach them the same day.'],
    [/attendance/i, 'Mark attendance on the paper register you already use and scan it in — absences can notify parents automatically. That part is live today.'],
    [/paper|question|exam|test|homework/i, 'Question papers — with blueprint and answer key — are drafted for your syllabus; your notes and subject books tune them. Exams stay on pen and paper.'],
    [/note|copilot|library|share/i, 'Ask the copilot for notes you can teach with, or paste your own. Everything lands in your library — private by default, shareable to everyone on the school’s email.'],
    [/demo|start|onboard|migrat|pilot|call/i, 'We’re onboarding founding schools hands-on. Tap “Arrange a callback” and a representative will reach out within one working day.']
  ];

  var CSS = `
:host{
  /* the page's tokens if it has them, sensible values if it doesn't */
  /* the page's own tokens, with standalone fallbacks. Internal names are
     distinct (--c-*) so referring to the inherited value isn't a cycle. */
  --c-ink:var(--ink,#14201A); --c-ink-soft:var(--ink-soft,#3D4F47); --c-muted:var(--muted,#68766E);
  --c-emerald:var(--emerald,#0B8A5C); --c-surface:var(--surface,#FFFFFF); --c-line:var(--line,#E2DED1);
  --glass-edge:rgba(255,255,255,.46); --glass-top:rgba(255,255,255,.62);
  position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:70;
  width:min(520px,calc(100vw - 24px));
  display:flex;flex-direction:column-reverse;align-items:center;gap:12px;
  pointer-events:none;
  font-family:var(--font-display,inherit);
}
:host([theme="dark"]){--glass-edge:rgba(255,255,255,.13);--glass-top:rgba(255,255,255,.07)}
:host([theme="dark"]) .panel{box-shadow:0 34px 90px -30px rgba(0,0,0,.66),inset 0 1px 0 var(--glass-top)}
:host([theme="dark"]) .pill{box-shadow:0 12px 30px -14px rgba(0,0,0,.6),inset 0 1px 0 var(--glass-top)}
:host([hidden]){display:none}
button{font:inherit;color:inherit;background:none;border:none;cursor:pointer}
.pill,.panel{pointer-events:auto}
.mark{width:17px;height:17px;flex:none;color:var(--c-emerald)}
.mark.spin{width:15px;height:15px;animation:spin 1.1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.pill{
  display:inline-flex;align-items:center;gap:7px;padding:8px 15px 8px 12px;border-radius:999px;
  background:color-mix(in srgb,var(--c-surface) 70%,transparent);
  backdrop-filter:blur(26px) saturate(1.8);-webkit-backdrop-filter:blur(26px) saturate(1.8);
  border:1px solid var(--glass-edge);
  box-shadow:0 12px 30px -14px rgba(20,32,26,.38),inset 0 1px 0 var(--glass-top);
  font-weight:500;font-size:13.5px;letter-spacing:-.01em;color:var(--c-ink);
  transition:transform .3s cubic-bezier(.3,.8,.24,1),opacity .25s,box-shadow .25s;
}
.pill:hover{transform:translateY(-2px);box-shadow:0 18px 38px -14px rgba(11,138,92,.42),inset 0 1px 0 var(--glass-top)}
.wm em,.head b em{font-family:var(--font-serif,Georgia,serif);font-style:italic;font-weight:500;color:var(--c-emerald);font-size:1.02em}

.panel{
  width:100%;overflow:hidden;border-radius:26px;
  background:linear-gradient(180deg,color-mix(in srgb,var(--c-surface) 80%,transparent),color-mix(in srgb,var(--c-surface) 62%,transparent));
  backdrop-filter:blur(44px) saturate(1.9);-webkit-backdrop-filter:blur(44px) saturate(1.9);
  border:1px solid var(--glass-edge);
  box-shadow:0 34px 90px -30px rgba(20,32,26,.46),inset 0 1px 0 var(--glass-top);
  opacity:0;visibility:hidden;transform:translateY(16px) scale(.96);transform-origin:50% 100%;
  transition:opacity .3s,transform .42s cubic-bezier(.3,.8,.24,1),visibility .42s;
}
:host([open]) .panel{opacity:1;visibility:visible;transform:none}
:host([open]) .pill{opacity:0;transform:translateY(10px) scale(.9);pointer-events:none}

.head{display:flex;align-items:center;gap:8px;padding:15px 14px 6px 17px}
.head b{font-weight:500;font-size:14.5px;letter-spacing:-.01em}
.fresh{margin-left:auto;width:28px;height:28px;border-radius:999px;display:grid;place-items:center;color:var(--c-muted);transition:.2s}
.fresh:hover{background:color-mix(in srgb,var(--c-ink) 7%,transparent);color:var(--c-ink)}
.fresh svg{width:14px;height:14px}
.fresh[hidden]{display:none}
.close{width:28px;height:28px;border-radius:999px;display:grid;place-items:center;color:var(--c-muted);transition:.2s}
.close:hover{background:color-mix(in srgb,var(--c-ink) 7%,transparent);color:var(--c-ink)}
.close{width:28px;height:28px;border-radius:999px;display:grid;place-items:center;color:var(--c-muted);transition:.2s;flex:none}
.close svg{width:14px;height:14px}
.head .fresh + .close{margin-left:2px}
.head:not(:has(.fresh:not([hidden]))) .close{margin-left:auto}

.log{position:relative;max-height:min(46vh,320px);overflow-y:auto;overscroll-behavior:contain;padding:10px 16px 4px;display:flex;flex-direction:column;gap:9px;scrollbar-width:thin}
.msg{max-width:88%;padding:10px 14px;border-radius:16px;font-size:14.5px;line-height:1.55;color:var(--c-ink);animation:in .3s cubic-bezier(.25,.8,.25,1) both}
@keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.msg p{margin:0 0 8px}
.msg p:last-child{margin:0}
.msg p.h{margin-top:10px}
.msg p.h:first-child{margin-top:0}
.msg ul,.msg ol{margin:0 0 8px;padding-left:20px}
.msg ul:last-child,.msg ol:last-child{margin:0}
.msg li{margin:0 0 4px}
.msg li:last-child{margin:0}
.msg strong{font-weight:600}
.msg code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em;
  background:color-mix(in srgb,var(--c-ink) 8%,transparent);padding:1px 5px;border-radius:5px}
.msg a{color:var(--c-emerald)}
.msg.bot{background:color-mix(in srgb,var(--c-ink) 5%,transparent);border-bottom-left-radius:6px;align-self:flex-start}
.msg.me{background:color-mix(in srgb,var(--c-emerald) 13%,transparent);border-bottom-right-radius:6px;align-self:flex-end}
.msg.typing{display:inline-flex;align-items:center;gap:8px;color:var(--c-muted);font-size:13.5px;background:none;padding:6px 4px}
.msg.err{background:color-mix(in srgb,#B3261E 9%,transparent);color:#B3261E}
/* history carried over from an earlier page reads as past, not present */
.msg.quiet{opacity:.62}
.msg.quiet .w{animation:none;opacity:1;filter:none;transform:none}
.curl{align-self:center;color:var(--c-line);padding:6px 0 2px;opacity:.9;
  animation:in .4s cubic-bezier(.25,.8,.25,1) both}
.curl svg{width:96px;height:11px;display:block}
.past{align-self:center;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted);padding:2px 0 4px}
.msg.err a{color:inherit}

/* words resolve out of a blur instead of landing as a block */
.w{display:inline-block;opacity:0;filter:blur(7px);transform:translateY(3px);animation:word .55s cubic-bezier(.2,.7,.2,1) both}
@keyframes word{to{opacity:1;filter:blur(0);transform:none}}

.msg.story{max-width:100%;padding:14px 16px 12px}
.msg.story p{margin:0 0 9px}
.msg.story .lead{color:var(--c-ink);font-weight:500;margin-bottom:7px}
.msg.story ul{list-style:none;margin:0 0 10px;padding:0;display:flex;flex-direction:column;gap:7px}
.msg.story li{position:relative;padding-left:15px;font-size:14px;line-height:1.5;color:var(--c-ink-soft)}
.msg.story li::before{content:"";position:absolute;left:0;top:8px;width:5px;height:5px;border-radius:99px;background:var(--c-emerald)}
.msg.story li b{color:var(--c-ink);font-weight:500}
.msg.story .end{margin:0;color:var(--c-muted);font-size:13.5px}
.msg.story p,.msg.story li{opacity:0;filter:blur(7px);transform:translateY(4px);animation:word .6s cubic-bezier(.2,.7,.2,1) both}

.chips{display:flex;gap:6px;padding:8px 16px 4px;flex-wrap:wrap}
.chips[hidden]{display:none}
.chip{font-size:12.5px;color:var(--c-ink-soft);border:1px solid color-mix(in srgb,var(--c-ink) 12%,transparent);border-radius:999px;padding:6px 12px;transition:.2s;text-align:left}
.chip:hover{border-color:var(--c-emerald);color:var(--c-emerald);background:color-mix(in srgb,var(--c-emerald) 7%,transparent)}
.acts.follow{opacity:.92}
.acts{display:flex;gap:6px;flex-wrap:wrap;padding:2px 0 2px 2px;animation:in .34s cubic-bezier(.25,.8,.25,1) both}

form{display:flex;align-items:center;gap:8px;padding:10px 12px 12px 18px}
input{flex:1;font:inherit;font-size:15px;color:var(--c-ink);background:none;border:none;outline:none;padding:8px 0}
input::placeholder{color:var(--c-muted)}
.send{width:36px;height:36px;border-radius:999px;flex:none;display:grid;place-items:center;background:color-mix(in srgb,var(--c-ink) 8%,transparent);color:var(--c-ink-soft);transition:.22s}
.send:hover{background:var(--c-emerald);color:#fff;transform:translateY(-1px)}
.send svg{width:16px;height:16px}

@media (max-width:640px){
  :host{bottom:14px;width:calc(100vw - 20px)}
  .log{max-height:44vh}
}
@media (prefers-reduced-motion:reduce){
  .mark.spin{animation-duration:2.6s}
  .w,.msg.story p,.msg.story li{animation:none;opacity:1;filter:none;transform:none}
}`;

  var TEMPLATE = `
<button class="pill" type="button" aria-expanded="false" aria-controls="panel">
  ${MARK}<span class="wm">Ask Paper<em>h</em>int</span>
</button>
<div class="panel" id="panel" role="dialog" aria-label="Ask Paperhint" aria-hidden="true">
  <div class="head">
    ${MARK}<b>Ask Paper<em>h</em>int</b>
    <button class="fresh" type="button" aria-label="Start a new chat" title="Start a new chat" hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
    </button>
    <button class="close" type="button" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="log" role="log" aria-live="polite"></div>
  <div class="chips" aria-label="Suggested questions"></div>
  <form>
    <input type="text" placeholder="Ask anything…" aria-label="Ask about Paperhint" autocomplete="off" maxlength="300">
    <button class="send" type="submit" aria-label="Send">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 14 0M13 6l6 6-6 6"/></svg>
    </button>
  </form>
</div>`;

  /* ------------------------------------------------------------- session
     What we remember about this visit: who they said they are, and where
     they've been. Lives in sessionStorage — it follows them from page to
     page and is gone when the tab closes. Never anything they didn't type. */
  var SKEY = 'paperhint.visit';
  var visit = load();

  function load() {
    var blank = {
      sid: 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: '', email: '', school: '', role: null, pages: [], turns: [], gist: [], started: Date.now()
    };
    try {
      var raw = sessionStorage.getItem(SKEY);
      if (!raw) return blank;
      var v = JSON.parse(raw);
      return Object.assign(blank, v && typeof v === 'object' ? v : {});
    } catch (e) { return blank; }
  }
  function save() {
    try {
      visit.turns = visit.turns.slice(-12);      /* keep it small */
      sessionStorage.setItem(SKEY, JSON.stringify(visit));
    } catch (e) { /* private mode, quota — the widget still works */ }
  }
  function notePage() {
    var here = location.pathname;
    if (visit.pages[visit.pages.length - 1] !== here) visit.pages.push(here);
    visit.pages = visit.pages.slice(-8);
    save();
  }
  /* a line of context the model can use — never sent unless something is known */
  function visitContext() {
    var bits = [];
    if (visit.name) bits.push('Their name is ' + visit.name + '.');
    if (visit.school) bits.push('They are from ' + visit.school + '.');
    if (visit.role && byRole[visit.role]) bits.push('They read the ' + visit.role + ' story.');
    if (visit.pages.length > 1) bits.push('Pages seen this visit: ' + visit.pages.join(', ') + '.');
    if (visit.gist && visit.gist.length) bits.push('Earlier in this visit they asked about: ' + visit.gist.join('; ') + '.');
    return bits.length ? bits.join(' ') : null;
  }

  /* Coming back to the widget on another page shouldn't feel like signing in
     again — pick up the conversation the way a colleague would. */
  var GREET_NAMED = [
    'Where were we, {n}?',
    'Good to have you back, {n}. What else is on your desk?',
    'Still here, {n}. Ask away.',
    'Carrying on, {n} — anything else you want off your plate?'
  ];
  var GREET_ANON = [
    'Where were we?',
    'Still here — ask away.',
    'Carry on wherever you like.'
  ];
  function greeting(name) {
    var first = name ? String(name).trim().split(/\s+/)[0] : '';
    var list = first ? GREET_NAMED : GREET_ANON;
    return list[Math.floor(Math.random() * list.length)].replace('{n}', first);
  }


  /* Follow-ups worth tapping: relatable next questions per topic, and never
     one the assistant would have to refuse. Deterministic on purpose — no
     extra call and no invented suggestions; the patterns come from the
     database with the repo as the fallback. */
  function followUps(question, reply) {
    var hay = (question + ' ' + reply).slice(0, 600);
    var rules = CONTENT.followups || [];
    for (var i = 0; i < rules.length; i++) {
      try {
        /* the pattern is authored copy, but a bad one must not break a reply */
        if (new RegExp(rules[i].pattern, 'i').test(hay)) return rules[i].suggestions.slice(0, 3);
      } catch (e) { /* skip a malformed pattern */ }
    }
    return (CONTENT.fallback || []).slice(0, 3);
  }


  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/(support@paperhint\.com)/, '<a href="mailto:support@paperhint.com">$1</a>');
  }

  /* One ask over the wire: a hard 30s ceiling so a cold start can't hang the
     panel, and one quiet retry when the failure looks transient. A refusal the
     server can explain (429, 503) is passed through as-is, never retried. */
  function post(endpoint, payload, again) {
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 30000);
    return fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (j && j.reply) return { reply: j.reply, chips: (j.chips || []) };
        var err = new Error(j && j.error || 'no reply');
        err.status = r.status;
        if (j && j.error) err.said = j.error;
        throw err;
      });
    }, function (netErr) { clearTimeout(timer); throw netErr; })
      .catch(function (err) {
        var transient = !err.status || err.status >= 500;
        if (again || !transient) throw err;
        return new Promise(function (go) { setTimeout(go, 900); })
          .then(function () { return post(endpoint, payload, true); });
      });
  }


  /* The model writes markdown. Rendering it as plain text put literal
     asterisks on screen and collapsed every list into one paragraph, so
     replies read like a wall. This turns the subset a reply actually uses
     into real blocks — escaped first, so nothing in a reply can inject
     markup, and only https/mailto links survive. */
  function md(src) {
    var esc = function (t) {
      return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    var inline = function (t) {
      return esc(t)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>')
        .replace(/(^|[\s(])_([^_\n]+)_(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2" rel="noopener">$1</a>')
        .replace(/(^|\s)([\w.+-]+@[\w-]+\.[\w.]+)/g, '$1<a href="mailto:$2">$2</a>');
    };

    var lines = String(src).replace(/\r/g, '').split('\n');
    var out = '', para = [], list = null;

    var shutPara = function () {
      if (para.length) { out += '<p>' + inline(para.join(' ')) + '</p>'; para = []; }
    };
    var shutList = function () { if (list) { out += '</' + list + '>'; list = null; } };

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) { shutPara(); shutList(); continue; }

      var bullet = line.match(/^[-*•]\s+(.*)$/);
      var number = line.match(/^\d+[.)]\s+(.*)$/);
      var head = line.match(/^#{1,4}\s+(.*)$/);

      if (bullet || number) {
        shutPara();
        var want = bullet ? 'ul' : 'ol';
        if (list !== want) { shutList(); out += '<' + want + '>'; list = want; }
        out += '<li>' + inline((bullet || number)[1]) + '</li>';
      } else if (head) {
        shutPara(); shutList();
        out += '<p class="h"><strong>' + inline(head[1]) + '</strong></p>';
      } else {
        shutList();
        para.push(line);
      }
    }
    shutPara(); shutList();
    return out || '<p>' + inline(src) + '</p>';
  }

  /* The staggered blur reveal, applied inside real blocks rather than
     instead of them: every word in every text node gets its own span. */
  function reveal(root) {
    var n = 0, walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(function (node) {
      if (!node.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (!w.trim()) return frag.appendChild(document.createTextNode(w));
        var sp = document.createElement('span');
        sp.className = 'w'; sp.textContent = w;
        sp.style.animationDelay = Math.min(n++ * 22, 1600) + 'ms';
        frag.appendChild(sp);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  var config = window.PaperhintChat || (window.PaperhintChat = {});
  config.visit = visit;
  config.forgetVisit = function () { try { sessionStorage.removeItem(SKEY); } catch (e) {} };
  config.content = function () { return CONTENT; };   /* for debugging */

  function cannedReply(q) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        for (var i = 0; i < CANNED.length; i++) if (CANNED[i][0].test(q)) return resolve(CANNED[i][1]);
        resolve('Good question — I’d rather not guess at it. Tap “Arrange a callback” and a person will answer properly within a working day.');
      }, 620 + Math.random() * 420);
    });
  }

  class AskPaperhint extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      var sr = this.attachShadow({ mode: 'open' });
      sr.innerHTML = '<style>' + CSS + '</style>' + TEMPLATE;

      this.$ = function (sel) { return sr.querySelector(sel); };
      this.opened = Date.now();
      this.history = [];
      this.lead = { role: null, name: '', email: '', school: '' };
      this.step = null;
      this.slowMo = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.asked = 0;
      this.CAP = Number(this.getAttribute('max-turns') || 15);

      this.reflectTheme();
      this.themeWatch = new MutationObserver(this.reflectTheme.bind(this));
      this.themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      notePage();
      this.renderChips();          /* the menu is there on every fresh panel */
      if (visit.turns.length) {
        /* they were here a page ago — pick the thread back up */
        var mark = document.createElement('div');
        mark.className = 'past'; mark.textContent = 'earlier';
        this.$('.log').appendChild(mark);
        visit.turns.slice(-6).forEach(function (t) {
          this.text(t.role === 'user' ? 'me quiet' : 'bot quiet', t.content);
        }, this);
        this.text('bot', greeting(visit.name));
        this.$('.fresh').hidden = false;
        this.asked = Math.floor(visit.turns.length / 2);
      } else {
        this.text('bot', 'Tell me who you are and I’ll show you the week Paperhint takes off your desk.');
      }

      this.$('.fresh').addEventListener('click', this.startFresh.bind(this));
      this.$('.pill').addEventListener('click', this.open.bind(this, true));
      this.$('.close').addEventListener('click', this.open.bind(this, false));
      this.$('form').addEventListener('submit', this.onSubmit.bind(this));

      this.onKey = function (e) {
        if (e.key === 'Escape' && this.hasAttribute('open')) return this.open(false);
        if (e.key === '/' && !this.hasAttribute('open')) {
          var t = e.target;
          if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
          e.preventDefault(); this.open(true);
        }
      }.bind(this);
      this.onAway = function (e) {
        if (!this.hasAttribute('open')) return;
        var path = e.composedPath ? e.composedPath() : [];
        if (path.indexOf(this) === -1) this.open(false);
      }.bind(this);
      /* anything inside the shadow root is ours — never treat it as "outside" */
      sr.addEventListener('click', function (e) { e.stopPropagation(); });
      document.addEventListener('keydown', this.onKey);
      document.addEventListener('click', this.onAway);
    }

    disconnectedCallback() {
      document.removeEventListener('keydown', this.onKey);
      document.removeEventListener('click', this.onAway);
      if (this.themeWatch) this.themeWatch.disconnect();
    }

    reflectTheme() {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (dark) this.setAttribute('theme', 'dark'); else this.removeAttribute('theme');
    }

    open(yes) {
      this.toggleAttribute('open', yes);
      this.$('.pill').setAttribute('aria-expanded', String(yes));
      this.$('.panel').setAttribute('aria-hidden', String(!yes));
      if (yes) setTimeout(function () { this.$('input').focus(); }.bind(this), 120);
      else this.$('.pill').focus();
    }

    /* Jump out and begin again — clears the thread but keeps who they are,
       so the callback flow doesn't ask for their name a second time. */
    startFresh() {
      this.$('.log').textContent = '';
      this.history = [];
      this.asked = 0;
      this.step = null;
      visit.turns = []; visit.gist = []; save();
      this.$('.fresh').hidden = true;
      this.$('input').placeholder = 'Ask anything…';
      this.text('bot', greeting(visit.name));
      this.renderChips();
      this.$('input').focus();
    }

    /* A thread that runs forever costs more and helps less — but stopping
       someone mid-conversation is worse. Past the cap we quietly start a new
       context and mark it with a curl, so the chat carries on and only the
       memory behind it resets. */
    maybeBranch() {
      if (this.asked <= this.CAP) return;
      /* compress what's being dropped into a line the model still sees, so
         the new thread isn't amnesiac about what they already asked */
      var asked = this.history.filter(function (t) { return t.role === 'user'; })
                              .map(function (t) { return t.content.slice(0, 60); });
      visit.gist = (visit.gist || []).concat(asked).slice(-8);
      this.history = [];
      visit.turns = []; save();
      this.asked = 1;
      var rule = document.createElement('div');
      rule.className = 'curl';
      rule.innerHTML = '<svg viewBox="0 0 120 12" aria-hidden="true" focusable="false">' +
        '<path d="M2 7c8-6 16 4 24 0s16-8 24-4 16 8 24 4 16-8 22-3" fill="none" ' +
        'stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
      this.$('.log').appendChild(rule);
    }

    /* Every question this visit, flattened for comparison: a chip offering
       something they have already asked is the bug the founder spotted. */
    askedAlready() {
      var seen = {};
      var norm = function (t) { return String(t).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim(); };
      (visit.turns || []).concat(this.history || []).forEach(function (t) {
        if (t && t.role === 'user') seen[norm(t.content)] = 1;
      });
      return { has: function (t) { return !!seen[norm(t)]; }, norm: norm };
    }

    /* What to offer next. The model's own follow-ups come first — it wrote
       the answer, so it knows what follows from it — with the curated pool
       backfilling when it sends too few, and nothing offered twice. */
    nextQuestions(q, reply, fromModel) {
      var seen = this.askedAlready();
      var out = [], taken = {};
      var take = function (list) {
        (list || []).forEach(function (c) {
          var k = seen.norm(c);
          if (out.length >= 3 || !k || taken[k] || seen.has(c) || k === seen.norm(q)) return;
          taken[k] = 1; out.push(c);
        });
      };
      take(fromModel);
      if (out.length < 2) take(followUps(q, reply));      /* thin or missing */
      if (!out.length) take(['Arrange a callback']);
      return out;
    }

    /* one row of next questions under the answer; tapping asks it */
    suggest(items) {
      var self = this;
      var old = this.$('.log').querySelector('.acts.follow');
      if (old) old.remove();                    /* only the latest set stays */
      var row = this.actions(items.map(function (label) {
        return { label: label, run: function () {
          if (/callback/i.test(label)) return self.startLead();
          self.text('me', label);
          self.asked++; self.maybeBranch();
          self.ask(label);
        } };
      }));
      if (row) row.classList.add('follow');
    }

    scroll() { var l = this.$('.log'); l.scrollTop = l.scrollHeight; }

    /* Where to leave the view after a message arrives. A long answer is
       shown from its first line so it can be read top-down; a short one
       just sits at the bottom. If the reader has scrolled up to re-read
       something, nothing moves. */
    place(el, force) {
      var log = this.$('.log');
      var wasAtBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 48;
      if (!wasAtBottom && !force) return;
      var tall = el && el.offsetHeight > log.clientHeight * 0.62;
      if (tall) log.scrollTop = Math.max(0, el.offsetTop - 10);
      else log.scrollTop = log.scrollHeight;
    }

    /* text() for anything a person or a model produced; html() only for the
       stories authored above. */
    text(kind, str) {
      var el = document.createElement('div');
      el.className = 'msg ' + kind;
      if (kind.indexOf('bot') > -1) {
        el.innerHTML = md(str);            /* lists and emphasis, not asterisks */
        if (!this.slowMo) reveal(el);
      } else el.textContent = str;
      this.$('.log').appendChild(el);
      this.place(el, kind.indexOf('me') > -1);
      return el;
    }

    html(kind, markup) {
      var el = document.createElement('div');
      el.className = 'msg ' + kind;
      el.innerHTML = markup;
      if (!this.slowMo) {
        var blocks = el.querySelectorAll('p, li');
        for (var i = 0; i < blocks.length; i++) blocks[i].style.animationDelay = (i * 90) + 'ms';
      }
      this.$('.log').appendChild(el); this.place(el); return el;
    }

    thinking() {
      var el = document.createElement('div');
      el.className = 'msg bot typing';
      var spin = this.$('.head .mark').cloneNode(true);
      spin.setAttribute('class', 'mark spin');
      el.appendChild(spin);
      el.appendChild(document.createTextNode('Thinking…'));
      this.$('.log').appendChild(el); this.scroll(); return el;
    }

    actions(items) {
      var row = document.createElement('div');
      row.className = 'acts';
      items.forEach(function (it) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.textContent = it.label;
        b.addEventListener('click', function (e) {
          e.stopPropagation();          /* the row removes itself below; without
                                           this the outside-click handler sees a
                                           detached target and closes the panel */
          row.remove(); it.run();
        });
        row.appendChild(b);
      });
      this.$('.log').appendChild(row);
      return row;
    }

    renderChips() {
      var box = this.$('.chips'), self = this;
      box.textContent = '';
      box.hidden = true;
      /* the copy is fetched, so the chips appear a moment after the panel;
         if it never arrives the panel still takes typed questions */
      loadContent(this.getAttribute('config-endpoint')).then(function (c) {
        if (!c.stories.length) return;
        box.textContent = '';
        c.stories.forEach(function (st) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'chip'; b.textContent = st.chip;
          b.addEventListener('click', function () { self.tellStory(st.key); });
          box.appendChild(b);
        });
        box.hidden = false;
      });
    }

    tellStory(role) {
      var st = byRole[role], self = this;
      if (!st) return;
      this.lead.role = role;
      visit.role = role; save();
      this.$('.chips').hidden = true;
      this.text('me', st.ask);
      var wait = this.thinking();
      setTimeout(function () {
        wait.remove();
        /* authored copy, but stripped to a little emphasis all the same */
        var story = self.html('bot story',
          '<p>' + trusted(st.intro) + '</p>' +
          (st.lead ? '<p class="lead">' + trusted(st.lead) + '</p>' : '') +
          '<ul>' + (st.bullets || []).map(function (b) {
            return '<li>' + trusted(b) + '</li>';
          }).join('') + '</ul>' +
          (st.close ? '<p class="end">' + trusted(st.close) + '</p>' : ''));
        self.actions([
          { label: 'Arrange a callback', run: self.startLead.bind(self) },
          { label: 'Ask something else', run: function () { self.$('input').focus(); } }
        ]);
        self.place(story, true);   /* a long story is read from its first line */
      }, 620);
    }

    startLead() {
      /* don't ask twice for what they already told us this visit */
      this.lead.name = this.lead.name || visit.name;
      this.lead.email = this.lead.email || visit.email;
      this.lead.school = this.lead.school || visit.school;

      if (!this.lead.name)  return this.askFor('name', 'Happy to. What’s your name?', 'Your name');
      if (!this.lead.email) return this.askFor('email', 'Thanks, ' + this.lead.name.split(' ')[0] + '. Which email should we write to?', 'you@school.edu');
      if (!this.lead.school) return this.askFor('school', 'And which school?', 'School name');
      this.text('bot', 'I have your details from earlier — ' + this.lead.email + ' at ' + this.lead.school + '. Sending that across now.');
      this.fileEnquiry();
    }

    askFor(step, prompt, placeholder) {
      this.step = step;
      this.text('bot', prompt);
      this.$('input').placeholder = placeholder;
      this.$('input').focus();
    }

    handleLead(value) {
      var input = this.$('input'), self = this;
      if (/^(cancel|stop|no thanks|nevermind|never mind)$/i.test(value)) {
        this.step = null; input.placeholder = 'Ask anything…';
        return this.text('bot', 'No problem — ask me anything else, or write to support@paperhint.com whenever you like.');
      }
      if (this.step === 'name') {
        this.lead.name = value; visit.name = value; save(); this.step = 'email';
        this.text('bot', 'Thanks. Which email should we write to?');
        input.placeholder = 'you@school.edu'; return;
      }
      if (this.step === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return this.text('bot', 'That doesn’t look like an email address — could you check it?');
        }
        this.lead.email = value; visit.email = value; save(); this.step = 'school';
        this.text('bot', 'And which school?');
        input.placeholder = 'School name'; return;
      }
      if (this.step === 'school') {
        this.lead.school = value; this.step = null; input.placeholder = 'Ask anything…';
        return this.fileEnquiry();
      }
    }

    fileEnquiry() {
      var self = this;
      var wait = this.thinking();
      {
        var roleName = { teacher: 'Teacher', principal: 'Principal / Head', admin: 'Administrator' }[this.lead.role || visit.role] || 'Other';
        visit.name = this.lead.name; visit.email = this.lead.email; visit.school = this.lead.school; save();
        fetch(this.getAttribute('contact-endpoint') || '/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            etype: 'demo', name: this.lead.name, email: this.lead.email, school: this.lead.school,
            role: roleName,
            message: 'Asked for a callback from the chat on the website.' +
                     (this.lead.role && byRole[this.lead.role] ? ' Read the story for: ' + byRole[this.lead.role].ask : ''),
            source: 'ask-paperhint', page: location.pathname + location.search, _t: this.opened,
            sid: visit.sid,
            transcript: visit.turns.slice(-10).map(function (t) { return (t.role === 'user' ? 'Q: ' : 'A: ') + t.content; }).join('\n')
          })
        }).then(function (r) { return r.json(); }).then(function (j) {
          wait.remove();
          if (!j || !j.ok) throw new Error('failed');
          self.text('bot', 'Done, ' + self.lead.name.split(' ')[0] + ' — a Paperhint representative will reach out to ' +
                           self.lead.email + ' within one working day. We’ve sent you an acknowledgement too.');
        }).catch(function () {
          wait.remove();
          self.html('bot err', 'That didn’t go through. You can reach us directly at <a href="mailto:support@paperhint.com">support@paperhint.com</a>.');
        });
      }
    }

    ask(q) {
      var self = this, input = this.$('input');
      var wait = this.thinking();
      input.disabled = true;
      var endpoint = this.getAttribute('endpoint') || config.endpoint;

      /* every branch resolves to the same shape, so ask() has one path */
      var asObj = function (r) { return (r && typeof r === 'object') ? r : { reply: String(r), chips: [] }; };
      var pending = config.adapter ? Promise.resolve(config.adapter(q, this.history.slice(-8))).then(asObj)
        : endpoint ? post(endpoint, {
            question: q,
            history: this.history.slice(-8),
            context: visitContext(),
            sid: visit.sid,
            page: location.pathname
          })
        : Promise.resolve(cannedReply(q)).then(asObj);

      pending.then(function (got) {
        var reply = got.reply;
        wait.remove();
        self.history.push({ role: 'user', content: q }, { role: 'assistant', content: reply });
        visit.turns.push({ role: 'user', content: q }, { role: 'assistant', content: reply }); save();
        self.text('bot', reply);
        self.suggest(self.nextQuestions(q, reply, got.chips));
      }).catch(function (err) {
        wait.remove();
        /* the server says why (busy, not switched on, too many questions) —
           show that instead of one blank failure for every cause */
        var said = err && err.said;
        self.html('bot err', said ? esc(said)
          : 'That didn’t go through. Try again, or write to <a href="mailto:support@paperhint.com">support@paperhint.com</a>.');
      }).then(function () {
        input.disabled = false; input.focus(); self.scroll();
      });
    }

    onSubmit(e) {
      e.preventDefault();
      var input = this.$('input');
      var q = input.value.trim();
      input.value = '';
      if (!q) return;
      this.text('me', q);
      this.$('.chips').hidden = true;
      this.$('.fresh').hidden = false;
      if (this.step) return this.handleLead(q);
      this.asked++;
      this.maybeBranch();   /* silently, with a curl in the log */
      if (/call ?back|call me|talk to (someone|a person)|book a demo/i.test(q)) return this.startLead();
      this.ask(q);
    }
  }

  if (!customElements.get('ask-paperhint')) customElements.define('ask-paperhint', AskPaperhint);
})();
