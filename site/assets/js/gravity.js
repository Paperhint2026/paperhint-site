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
    { f: 'char-02.png', w: 205, h: 192, kind: 'circle' },  /* orange running */
    { f: 'char-03.png', w: 103, h: 206, kind: 'rect'   },  /* black capsule, arms crossed */
    { f: 'char-06.png', w: 146, h: 198, kind: 'rect'   },  /* blue tall rectangle */
    { f: 'char-07.png', w: 173, h: 180, kind: 'tri'    },  /* yellow triangle */
    { f: 'char-11.png', w: 182, h: 174, kind: 'rect'   },  /* red angry square */
    { f: 'char-13.png', w: 151, h: 178, kind: 'circle' },  /* teal hexagon */
    { f: 'char-14.png', w: 210, h: 143, kind: 'circle' },  /* yellow star */
    { f: 'char-17.png', w: 224, h: 164, kind: 'circle' },  /* orange trapezoid */
    { f: 'char-20.png', w: 144, h: 170, kind: 'rect'   },  /* yellow plus */
    { f: 'char-22.png', w: 171, h: 168, kind: 'circle' }   /* pink arrow */
  ];

  /* scale to a comfortable on-screen size */
  var CHARS = SHEET.map(function (c) {
    var k = 82 / Math.max(c.w, c.h);
    return { src: 'assets/img/stickers/' + c.f, w: Math.round(c.w * k), h: Math.round(c.h * k), kind: c.kind };
  });

  var layer, engine, bodies = [], els = [], M;

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
    return [
      M.Bodies.rectangle(W / 2, H + T / 2 - 4, W + 800, T, { isStatic: true, label: 'floor' }),
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
    CHARS.forEach(function (c, i) {
      var x = W * (0.07 + 0.094 * i) + (i % 2 ? 12 : -8);
      var y = -110 - i * 105; /* rain in from above on load */
      var opts = { restitution: 0.3, friction: 0.5, frictionStatic: 1.4, frictionAir: 0.014, density: 0.0016 };
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
      var d = Math.max(-18, Math.min(18, dy));
      var mag = Math.abs(d) * 0.0011;
      if (mag < 0.00002) return;
      /* scrolling up gets a livelier kick; scrolling down only ever settles them */
      var up = d < 0;
      var scale = up ? 2.4 : 1;
      bodies.forEach(function (b) {
        M.Body.applyForce(b, b.position, {
          x: (Math.random() - 0.5) * mag * (up ? 1.2 : 0.4),
          y: (up ? -1 : 1) * mag * scale * (0.7 + Math.random() * 0.5)
        });
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
