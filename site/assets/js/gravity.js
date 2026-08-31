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

  var FACE = '<g class="face"><circle cx="-11" cy="-6" r="4.6" fill="#fff"/><circle cx="11" cy="-6" r="4.6" fill="#fff"/><circle cx="-10" cy="-5" r="2.2" fill="#10201A"/><circle cx="12" cy="-5" r="2.2" fill="#10201A"/><path d="M -9 7 Q 0 14 9 7" fill="none" stroke="#10201A" stroke-width="2.6" stroke-linecap="round"/></g>';

  function svgChar(inner, vb) {
    return '<svg viewBox="' + (vb || '-40 -40 80 80') + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }

  /* face variants */
  var GRUMPY = '<g class="face"><rect x="-16" y="-9" width="10" height="4" rx="2" fill="#fff"/><rect x="6" y="-9" width="10" height="4" rx="2" fill="#fff"/><path d="M -8 9 L 8 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></g>';

  /* cast from the founder's sticker sheet — shape, colour, physics body */
  var CHARS = [
    { w: 84, h: 84, kind: 'circle',
      svg: svgChar('<circle r="34" fill="#FF8A3D" stroke="#fff" stroke-width="5"/>' + FACE) },
    { w: 64, h: 94, kind: 'rect',
      svg: svgChar('<rect x="-23" y="-40" width="46" height="80" rx="23" fill="#10201A" stroke="#fff" stroke-width="5"/><g transform="translate(0,-4)">' + GRUMPY + '</g>', '-36 -48 72 96') },
    { w: 88, h: 80, kind: 'triangle',
      svg: svgChar('<path d="M 0 -34 L 38 30 L -38 30 Z" fill="#FFD84D" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><g transform="translate(0,8) scale(.9)">' + FACE + '</g>', '-44 -42 88 80') },
    { w: 74, h: 74, kind: 'rect',
      svg: svgChar('<rect x="-30" y="-30" width="60" height="60" rx="8" fill="#E23D2E" stroke="#fff" stroke-width="5"/>' + FACE) },
    { w: 84, h: 78, kind: 'circle',
      svg: svgChar('<path d="M 0 -36 L 32 -18 L 32 18 L 0 36 L -32 18 L -32 -18 Z" fill="#18B5A3" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>' + FACE, '-40 -42 80 82') },
    { w: 82, h: 80, kind: 'circle',
      svg: svgChar('<path d="M 0 -36 L 9 -11 L 36 -11 L 14 5 L 22 32 L 0 16 L -22 32 L -14 5 L -36 -11 L -9 -11 Z" fill="#FFD84D" stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/><g transform="translate(0,2) scale(.72)">' + FACE + '</g>', '-42 -42 84 82') },
    { w: 80, h: 74, kind: 'circle',
      svg: svgChar('<path d="M 0 30 C -34 8 -40 -16 -26 -26 C -14 -34 -2 -26 0 -18 C 2 -26 14 -34 26 -26 C 40 -16 34 8 0 30 Z" fill="#EA7DAA" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><g transform="translate(0,-4) scale(.85)">' + FACE + '</g>', '-42 -40 84 76') },
    { w: 60, h: 92, kind: 'rect',
      svg: svgChar('<rect x="-21" y="-38" width="42" height="76" rx="9" fill="#2563EB" stroke="#fff" stroke-width="5" transform="rotate(7)"/><g transform="rotate(7) translate(0,-5) scale(.9)">' + FACE + '</g>', '-36 -48 72 96') }
  ];

  var layer, engine, bodies = [], els = [], M;

  function makeLayer() {
    layer = document.createElement('div');
    layer.id = 'gravity-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:none;overflow:hidden;';
    document.body.appendChild(layer);
  }

  function makeEl(c, i) {
    var el = document.createElement('div');
    el.className = 'gravity-sticker';
    el.style.cssText = 'position:absolute;left:0;top:0;width:' + c.w + 'px;height:' + c.h +
      'px;pointer-events:auto;cursor:grab;user-select:none;touch-action:none;will-change:transform;filter:drop-shadow(0 3px 6px rgba(16,32,26,.18));';
    el.innerHTML = c.svg;

    /* swap in the real sticker PNG if the founder has dropped one */
    var img = new Image();
    img.onload = function () {
      el.innerHTML = '';
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;';
      img.draggable = false;
      el.appendChild(img);
    };
    img.src = 'assets/img/stickers/sticker-' + (i + 1) + '.png';

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
      var x = W * (0.09 + 0.115 * i) + (i % 2 ? 14 : -10);
      var y = -120 - i * 130; /* rain in from above on load */
      var opts = { restitution: 0.3, friction: 0.5, frictionStatic: 1.4, frictionAir: 0.014, density: 0.0016 };
      var b;
      if (c.kind === 'circle') {
        b = M.Bodies.circle(x, y, Math.max(c.w, c.h) / 2 - 4, opts);
      } else if (c.kind === 'triangle') {
        b = M.Bodies.polygon(x, y, 3, c.w / 2 - 2, Object.assign({ angle: -Math.PI / 2 }, opts));
      } else {
        b = M.Bodies.rectangle(x, y, c.w - 6, c.h - 6, Object.assign({ chamfer: { radius: 12 } }, opts));
      }
      b.angle = (Math.random() - 0.5) * 0.6;
      bodies.push(b);
      els.push(makeEl(c, i));
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
      var kick = Math.max(-14, Math.min(14, dy)) * 0.0012;
      bodies.forEach(function (b) {
        M.Body.applyForce(b, b.position, {
          x: (Math.random() - 0.5) * Math.abs(kick) * 0.6,
          y: -Math.abs(kick) * (0.7 + Math.random() * 0.6)
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
