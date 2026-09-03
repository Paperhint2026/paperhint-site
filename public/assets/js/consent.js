/* Cookie and analytics consent.
 *
 * Nothing that measures a visitor runs before they say yes. The choice is
 * kept in localStorage — not a cookie, so declining costs them nothing —
 * and read back by anything that wants to track:
 *
 *   PaperhintConsent.granted('analytics')   -> true | false
 *   PaperhintConsent.onGrant(fn)            -> runs now if already granted,
 *                                              otherwise when they accept
 *
 * Essential behaviour (the chat panel, the contact form, error reports that
 * carry no personal data) never waits on this. Measurement always does.
 */
(function () {
  var KEY = 'paperhint.consent';
  var VERSION = 1;                 /* bump to ask again after a policy change */
  var waiting = [];

  function saved() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      return (v && v.v === VERSION) ? v : null;
    } catch (e) { return null; }
  }

  function keep(analytics) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: VERSION, analytics: !!analytics, at: new Date().toISOString()
      }));
    } catch (e) { /* private mode — the choice holds for this page only */ }
  }

  var state = saved();

  var api = {
    granted: function (what) {
      return Boolean(state && (what === 'analytics' ? state.analytics : true));
    },
    onGrant: function (fn) {
      if (api.granted('analytics')) { try { fn(); } catch (e) {} }
      else waiting.push(fn);
    },
    accept: function () { decide(true); },
    decline: function () { decide(false); },
    /* so a visitor can change their mind from the privacy page */
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
  };
  window.PaperhintConsent = api;

  /* The falling characters measure the bar themselves — we only say when it
     has moved. They boot behind a CDN import, so anything we called directly
     would often be calling nothing. */
  function floor() {
    try { document.dispatchEvent(new Event('paperhint:floor')); } catch (e) {}
  }

  function decide(yes) {
    state = { v: VERSION, analytics: yes, at: new Date().toISOString() };
    keep(yes);
    document.documentElement.classList.remove('consent-open');
    setTimeout(floor, 320);          /* once the bar has slid away */
    var bar = document.getElementById('consent');
    if (bar) { bar.classList.remove('on'); setTimeout(function () { bar.remove(); }, 300); }
    if (yes) {
      waiting.splice(0).forEach(function (fn) { try { fn(); } catch (e) {} });
      document.dispatchEvent(new CustomEvent('paperhint:consent', { detail: { analytics: true } }));
    }
  }

  /* Already answered — never ask twice. */
  if (state) return;

  function show() {
    var bar = document.getElementById('consent');
    if (!bar) return;
    bar.hidden = false;
    /* the page lifts the chat pill out of the way while this is up */
    document.documentElement.classList.add('consent-open');
    requestAnimationFrame(function () { bar.classList.add('on'); });
    /* and the falling characters get a new floor: the bar's own top edge, so
       they land on it rather than behind it */
    setTimeout(floor, 380);          /* once it has slid into place */
    bar.querySelector('[data-yes]').addEventListener('click', api.accept);
    bar.querySelector('[data-no]').addEventListener('click', api.decline);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
  else show();
})();
