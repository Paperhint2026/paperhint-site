/* ================================================================
   PAPERHINT · gravity layer
   Flat sticker characters living on the viewport floor.
   Matter.js drives DOM nodes: scroll tosses them, pointer drags
   and flicks them, they pile up wherever the page ends.
   Sticker art: assets/img/stickers/sticker-N.png when present,
   inline flat SVG characters otherwise.
   ================================================================ */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* die-cut characters carved out of the founder's sticker sheet
     (assets/img/stickers/char-NN.png — transparent, heart + animated strip excluded) */
  var SHEET = [
    { f: 'char-02.png', w: 214, h: 201, kind: 'circle' },  /* orange circle, walking */
    { f: 'char-07.png', w: 194, h: 207, kind: 'tri'    },  /* yellow triangle */
    { f: 'char-22.png', w: 200, h: 210, kind: 'rect'   },  /* pink arrow */
    { f: 'char-12.png', w: 168, h: 193, kind: 'circle' },  /* teal hexagon */
    { f: 'char-10.png', w: 240, h: 230, kind: 'circle' },  /* yellow star */
    { f: 'char-03.png', w: 113, h: 210, kind: 'rect'   },  /* black capsule */
    { f: 'char-08.png', w: 240, h: 230, kind: 'rect'   },  /* red square */
    { f: 'char-06.png', w: 164, h: 215, kind: 'rect'   },  /* blue rectangle */
    { f: 'char-20.png', w: 172, h: 210, kind: 'rect'   },  /* yellow plus */
    { f: 'char-14.png', w: 254, h: 209, kind: 'circle' }   /* orange trapezoid */
  ];

  /* scale to a comfortable on-screen size (die-cut copies live in stickers/fall/) */
  var CHARS = SHEET.map(function (c) {
    var k = 82 / Math.max(c.w, c.h);
    return { src: '/assets/img/stickers/fall/' + c.f, w: Math.round(c.w * k), h: Math.round(c.h * k), kind: c.kind };
  });

  var layer, engine, bodies = [], els = [], M;
  var lift = 0, floorBody = null;   /* how far the floor sits above the viewport edge */

  function makeLayer() {
    layer = document.createElement('div');
    layer.id = 'gravity-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:none;overflow:hidden;';
    document.body.appendChild(layer);
  }

  function makeEl(c) {
    var el = document.createElement('div');
    el.className = 'gravity-sticker';
    el.style.cssText = 'position:absolute;left:0;top:0;width:' + c.w + 'px;height:' + c.h +
      'px;pointer-events:auto;cursor:grab;user-select:none;touch-action:none;will-change:transform;' +
      'background-image:url(' + c.src + ');background-size:contain;background-position:center;' +
      'background-repeat:no-repeat;filter:drop-shadow(0 3px 5px rgba(16,32,26,.22));';
    layer.appendChild(el);
    return el;
  }

  function walls() {
    var W = innerWidth, H = innerHeight, T = 200; /* thickness */
    lift = measureFloor();          /* the bar may already be up */
    floorBody = M.Bodies.rectangle(W / 2, H - lift + T / 2 - 4, W + 800, T,
      { isStatic: true, label: 'floor' });
    return [
      floorBody,
      M.Bodies.rectangle(-T / 2, H / 2, T, H * 6, { isStatic: true }),
      M.Bodies.rectangle(W + T / 2, H / 2, T, H * 6, { isStatic: true })
    ];
  }

  function init(Matter) {
    M = Matter;
    makeLayer();
    engine = M.Engine.create();
    engine.gravity.y = 1.15;
    engine.gravity.x = 0.09; /* gentle rightward lean: they heap toward the bottom-right, not up the wall */

    var W = innerWidth;
    /* fewer mascots: 5 on a short page, one more per extra ~1500px of page,
       never more than the sheet offers */
    var docH = document.documentElement.scrollHeight;
    var base = innerWidth < 700 ? 3 : 5;
    var COUNT = Math.min(CHARS.length, base + Math.max(0, Math.floor((docH - 3200) / 1500)));
    CHARS.slice(0, COUNT).forEach(function (c, i) {
      var x = W * (0.10 + (0.80 / Math.max(4, COUNT - 1)) * i) + (i % 2 ? 12 : -8);
      var y = -110 - i * 105; /* rain in from above on load */
      var opts = { restitution: 0.16, friction: 0.6, frictionStatic: 1.6, frictionAir: 0.022, density: 0.004 };
      var b;
      if (c.kind === 'circle') {
        b = M.Bodies.circle(x, y, Math.max(c.w, c.h) / 2 - 4, opts);
      } else if (c.kind === 'tri') {
        b = M.Bodies.polygon(x, y, 3, c.w / 2 - 2, Object.assign({ angle: -Math.PI / 2 }, opts));
      } else {
        b = M.Bodies.rectangle(x, y, c.w - 6, c.h - 6, Object.assign({ chamfer: { radius: 12 } }, opts));
      }
      b.angle = (Math.random() - 0.5) * 0.6;
      bodies.push(b);
      els.push(makeEl(c));
    });

    var wallBodies = walls();
    M.Composite.add(engine.world, bodies.concat(wallBodies));
    window.__grav = { engine: engine, bodies: bodies, M: M }; /* debug */


    /* ---- phones: gravity follows the device tilt (gyroscope) ----
       Tip the phone and the cast slides the way you tip it. iOS needs a
       user-gesture permission; Android just streams the events. */
    function initTilt() {
      if (!window.DeviceOrientationEvent) return;
      if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

      var G = 1.15;
      function onTilt(e) {
        if (e.gamma === null || e.beta === null) return;
        /* gamma: left/right tilt, beta: front/back — both in degrees */
        var gx = Math.max(-1, Math.min(1, e.gamma / 40));
        var gy = Math.max(0.15, Math.min(1, Math.abs(e.beta) / 50));
        engine.gravity.x = gx * G;
        engine.gravity.y = gy * G;
        bodies.forEach(function (b) { if (b.isSleeping) M.Sleeping.set(b, false); });
      }

      function arm() {
        window.addEventListener('deviceorientation', onTilt, { passive: true });
      }

      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        /* iOS: ask on the first touch, once */
        var asked = false;
        window.addEventListener('touchend', function ask() {
          if (asked) return;
          asked = true;
          window.removeEventListener('touchend', ask);
          DeviceOrientationEvent.requestPermission()
            .then(function (state) { if (state === 'granted') arm(); })
            .catch(function () { /* stays on the default lean */ });
        }, { passive: true });
      } else {
        arm();
      }
    }
    initTilt();

    /* ---- resize: rebuild walls ---- */
    addEventListener('resize', function () {
      M.Composite.remove(engine.world, wallBodies);
      wallBodies = walls();
      M.Composite.add(engine.world, wallBodies);
    });

    /* ---- scroll tosses them ---- */
    var lastY = scrollY;
    addEventListener('scroll', function () {
      var dy = scrollY - lastY; lastY = scrollY;
      /* force follows the scroll direction: down presses them into the floor,
         only scrolling UP ever tosses them upward */
      var d = Math.max(-16, Math.min(16, dy));
      var mag = Math.abs(d) * 0.00055;   /* they have real weight — a nudge, not a launch */
      if (mag < 0.00002) return;
      var up = d < 0;
      bodies.forEach(function (b) {
        M.Body.applyForce(b, b.position, {
          x: (Math.random() - 0.5) * mag * (up ? 0.8 : 0.4),
          y: (up ? -1 : 1) * mag * (0.6 + Math.random() * 0.4)
        });
      });
      /* hard ceiling on lift: nothing gets thrown off the top of the viewport */
      bodies.forEach(function (b) {
        if (b.velocity.y < -7) M.Body.setVelocity(b, { x: b.velocity.x, y: -7 });
      });
    }, { passive: true });

    /* ---- drag & flick ---- */
    var drag = null;
    els.forEach(function (el, i) {
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
        el.style.cursor = 'grabbing';
        drag = { i: i, id: e.pointerId, x: e.clientX, y: e.clientY, vx: 0, vy: 0, t: performance.now() };
        M.Body.setStatic(bodies[i], false);
      });
    });
    addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var now = performance.now(), dt = Math.max(1, now - drag.t);
      drag.vx = (e.clientX - drag.x) / dt * 16;
      drag.vy = (e.clientY - drag.y) / dt * 16;
      drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
      var b = bodies[drag.i];
      M.Body.setPosition(b, { x: e.clientX, y: e.clientY });
      M.Body.setVelocity(b, { x: 0, y: 0 });
    });
    function endDrag(e) {
      if (!drag || (e.pointerId !== undefined && e.pointerId !== drag.id)) return;
      var b = bodies[drag.i];
      M.Body.setVelocity(b, {
        x: Math.max(-28, Math.min(28, drag.vx)),
        y: Math.max(-28, Math.min(28, drag.vy))
      });
      els[drag.i].style.cursor = 'grab';
      drag = null;
    }
    addEventListener('pointerup', endDrag);
    addEventListener('pointercancel', endDrag);

    /* ---- physics stepping: Matter's own runner (fixed timestep) ---- */
    M.Runner.run(M.Runner.create(), engine);

    /* ---- render loop: DOM sync only ---- */
    (function loop() {
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i], c = CHARS[i];
        /* recover strays that tunnelled out */
        /* ceiling guard: if anything drifts above the top edge, stop it there */
        if (b.position.y < c.h * 0.5 && b.velocity.y < 0) {
          M.Body.setVelocity(b, { x: b.velocity.x * 0.4, y: 0.6 });
        }
        if (b.position.y > innerHeight + 400 || b.position.x < -300 || b.position.x > innerWidth + 300) {
          M.Body.setPosition(b, { x: innerWidth * Math.random(), y: -120 });
          M.Body.setVelocity(b, { x: 0, y: 0 });
        }
        els[i].style.transform = 'translate(' + (b.position.x - c.w / 2) + 'px,' +
          (b.position.y - c.h / 2) + 'px) rotate(' + b.angle + 'rad)';
      }
      requestAnimationFrame(loop);
    })();
  }

  /* Anything that occupies the bottom of the screen — the cookie bar today —
     raises the floor so the characters come to rest on top of it instead of
     disappearing behind it.
     Measured from the DOM rather than pushed in by whoever owns the bar: this
     layer boots behind a CDN import, so a caller that announces itself first
     would be talking to nothing. Mark the element with data-gravity-floor. */
  function measureFloor() {
    var el = document.querySelector('[data-gravity-floor]');
    if (!el) return 0;
    var r = el.getBoundingClientRect();
    if (!r.height || r.top >= innerHeight) return 0;
    return Math.max(0, Math.round(innerHeight - r.top));
  }

  function setFloor(px) {
    var want = Math.max(0, (px == null ? measureFloor() : px) | 0);
    if (want === lift) return;
    lift = want;
    if (!M || !floorBody) return;
    M.Body.setPosition(floorBody, {
      x: innerWidth / 2, y: innerHeight - lift + 200 / 2 - 4
    });
    /* nudge whoever was already asleep on the old floor so they settle again */
    for (var i = 0; i < bodies.length; i++) {
      M.Sleeping.set(bodies[i], false);
      if (bodies[i].position.y > innerHeight - lift) {
        M.Body.setPosition(bodies[i], {
          x: bodies[i].position.x, y: innerHeight - lift - 60
        });
      }
    }
  }

  window.PaperhintGravity = { setFloor: setFloor, measureFloor: measureFloor };

  /* whoever changes the bottom of the screen just says so; we do the measuring */
  document.addEventListener('paperhint:floor', function () { setFloor(null); });
  addEventListener('resize', function () { setFloor(null); });

  function boot() {
    import('https://esm.sh/matter-js@0.20.0')
      .then(function (mod) { init(mod.default || mod); })
      .catch(function (e) { try { console.warn('gravity layer skipped:', e); } catch (_) {} });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
