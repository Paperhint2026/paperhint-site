/* Site-wide error reporting.
 *
 * A broken page usually goes unnoticed: nobody writes to say the nav didn't
 * open on their phone, they just leave. This catches what the browser already
 * knows — thrown errors, rejected promises, assets that failed to load — and
 * posts it to /api/bug, where it lands in the console next to the enquiries.
 *
 * Deliberately not gated on cookie consent: it carries no personal data and
 * sets nothing on the device. It is site reliability, not measurement.
 *
 * Rules it holds itself to:
 *   - the same fault is reported once per page, however often it fires
 *   - at most 5 reports per page load, so a loop can't flood anything
 *   - it never throws, and never delays anything the visitor is doing
 */
(function () {
  var MAX = 5;
  var sent = 0;
  var seen = {};
  var ENDPOINT = '/api/bug';

  function visit() {
    try {
      var v = JSON.parse(sessionStorage.getItem('paperhint.visit') || '{}');
      return v.sid || null;
    } catch (e) { return null; }
  }

  function report(kind, message, extra) {
    if (sent >= MAX) return;
    var fingerprint = kind + '|' + message + '|' + (extra.line || '') + (extra.file || '');
    if (seen[fingerprint]) return;
    seen[fingerprint] = 1;
    sent++;

    var body = {
      kind: kind,
      message: String(message || '').slice(0, 400),
      page: location.pathname + location.search,
      file: extra.file ? String(extra.file).slice(0, 200) : null,
      line: extra.line || null,
      column: extra.column || null,
      stack: extra.stack ? String(extra.stack).slice(0, 1200) : null,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      sid: visit(),
      at: new Date().toISOString()
    };

    try {
      /* sendBeacon survives the page being closed, which is exactly when a
         fatal error tends to happen */
      var payload = JSON.stringify(body);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: payload, keepalive: true
        }).catch(function () {});
      }
    } catch (e) { /* a reporter that throws is worse than no reporter */ }
  }

  window.addEventListener('error', function (e) {
    /* an asset that failed to load fires on the element, with no message */
    if (e.target && e.target !== window && (e.target.src || e.target.href)) {
      return report('asset', (e.target.tagName || 'asset') + ' failed to load',
        { file: e.target.src || e.target.href });
    }
    report('error', e.message, {
      file: e.filename, line: e.lineno, column: e.colno,
      stack: e.error && e.error.stack
    });
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    report('rejection', (r && (r.message || r)) || 'promise rejected',
      { stack: r && r.stack });
  });

  /* so a page can report a fault it handled itself but shouldn't have hit */
  window.PaperhintWatchdog = {
    note: function (message, extra) { report('noted', message, extra || {}); }
  };
})();
