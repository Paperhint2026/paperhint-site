/* ================================================================
   PAPERHINT · site behaviours
   theme toggle · NEAT hero gradient · spec tabs · testimonial deck
   scroll reveal · contact form
   ================================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- theme ---------------- */
  var THEME_KEY = 'paperhint-theme';

  function store(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* preview sandboxes */ }
  }
  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  var saved = read(THEME_KEY);
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.theme-btn');
    if (!btn) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store(THEME_KEY, next);
    document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });

  /* ---------------- NEAT hero gradient ----------------
     Founder-specified ribbon config (silky gradient ribbon behind the
     product stage, scroll-reactive). The .hero-gradient CSS blobs paint
     underneath and stay visible if this never loads or throws. */
  var neat = null;

  var NEAT_COLORS = [
    { color: '#FF8A3D', enabled: true },
    { color: '#FFD84D', enabled: true },
    { color: '#7C5CFF', enabled: true },
    { color: '#0B8A5C', enabled: true },
    { color: '#31D492', enabled: true },
    { color: '#9AA3FF', enabled: false }
  ];

  function initNeat() {
    var canvas = document.getElementById('neat-canvas');
    if (!canvas || reduceMotion) return;

    import('https://esm.sh/@firecms/neat')
      .then(function (mod) {
        var NeatGradient = mod.NeatGradient;
        if (!NeatGradient) return;

        function build() {
          var dark = currentTheme() === 'dark';
          try {
            neat = new NeatGradient({
              ref: canvas,
              colors: NEAT_COLORS,
              speed: 4,
              horizontalPressure: 7,
              verticalPressure: 3,
              waveFrequencyX: 0,
              waveFrequencyY: 0,
              waveAmplitude: 0,
              secondaryWaveEnabled: false,
              secondaryWaveFrequencyX: 3,
              secondaryWaveFrequencyY: 3,
              secondaryWaveAmplitude: 5,
              secondaryWaveSpeed: 0.6,
              secondaryWaveAngle: 1,
              shadows: 4,
              highlights: 0,
              colorBrightness: dark ? 1.3 : 1.95,
              colorSaturation: dark ? 1 : 2,
              wireframe: false,
              antialias: false,
              colorBlending: 9,
              backgroundColor: dark ? '#0A0F0C' : '#FCFBF8',
              backgroundAlpha: 1,
              grainScale: 6,
              grainSparsity: 0,
              grainIntensity: 0.125,
              grainSpeed: 0,
              resolution: 1.15,
              yOffset: -739,
              yOffsetWaveMultiplier: 4.5,
              yOffsetColorMultiplier: 4.8,
              yOffsetFlowMultiplier: 5.2,
              flowDistortionA: 0.4,
              flowDistortionB: 10,
              flowScale: 3.3,
              flowEase: 0.37,
              flowEnabled: true,
              enableProceduralTexture: false,
              transparentTextureVoid: false,
              textureMode: 'bitmap',
              bakeEdgeSoftness: 1,
              textureVoidLikelihood: 0.06,
              textureVoidWidthMin: 10,
              textureVoidWidthMax: 500,
              textureBandDensity: 0.8,
              textureColorBlending: 0.06,
              textureSeed: 333,
              textureEase: 0.38,
              proceduralBackgroundColor: '#003FFF',
              textureShapeTriangles: 20,
              textureShapeCircles: 15,
              textureShapeBars: 15,
              textureShapeSquiggles: 10,
              domainWarpEnabled: false,
              domainWarpIntensity: 0,
              domainWarpScale: 3,
              vignetteIntensity: 0,
              vignetteRadius: 0.8,
              fresnelEnabled: false,
              fresnelPower: 2,
              fresnelIntensity: 0.5,
              fresnelColor: '#FFFFFF',
              iridescenceEnabled: false,
              iridescenceIntensity: 0.5,
              iridescenceSpeed: 1,
              prismEdgeEnabled: false,
              prismEdgeIntensity: 0.5,
              prismEdgeThinness: 3,
              prismEdgeSpread: 1,
              prismEdgeSpeed: 0.5,
              prismEdgeRipple: 1,
              bloomIntensity: 0,
              bloomThreshold: 0.7,
              chromaticAberration: 0,
              shapeType: 'ribbon',
              shapeRotationX: 0,
              shapeRotationY: 0,
              shapeRotationZ: 0,
              shapeAutoRotateSpeedX: 0,
              shapeAutoRotateSpeedY: 0,
              sphereRadius: 15,
              torusRadius: 15,
              torusTube: 5,
              cylinderRadius: 10,
              cylinderHeight: 40,
              planeBend: 1.7,
              planeTwist: 5,
              silhouetteFade: 0.2,
              cylinderFade: 0.08,
              ribbonFade: 0.23,
              flatShading: false,
              cameraLock: false,
              cameraX: 15,
              cameraY: 0.5,
              cameraZ: 0,
              cameraRotationX: 0,
              cameraRotationY: 0,
              cameraRotationZ: 0,
              cameraZoom: 1.45
            });
          } catch (e) {
            neat = null; /* CSS blob fallback stays visible */
          }
        }

        build();

        /* scroll-reactive ribbon (founder hookup) */
        window.addEventListener('scroll', function () {
          if (neat) neat.yOffset = window.scrollY;
        }, { passive: true });

        document.addEventListener('themechange', function () {
          if (neat && neat.destroy) { try { neat.destroy(); } catch (e) {} }
          neat = null;
          build();
        });
      })
      .catch(function () { /* CSS blob gradient remains */ });
  }

  /* ---------------- product spec tabs ---------------- */
  var check = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5l4 4 8-9"/></svg>';

  function points(list) {
    return '<ul class="spec-points">' + list.map(function (t) {
      return '<li>' + check + '<span>' + t + '</span></li>';
    }).join('') + '</ul>';
  }

  function shell(active, main) {
    var nav = ['Timetable', 'Academics', 'Library', 'Question papers', 'Parent connect'];
    return '<div class="app">' +
      '<div class="app-bar"><i></i><i></i><i></i><span>paperhint · Greenfield Public School</span></div>' +
      '<div class="app-body">' +
        '<div class="app-side"><b>School</b>' +
          nav.map(function (n) {
            return '<i class="' + (n === active ? 'on' : '') + '">' + n + '</i>';
          }).join('') +
        '</div>' +
        '<div class="app-main">' + main + '</div>' +
      '</div>' +
    '</div>';
  }

  var SLOTS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  var TT = [
    ['Math c1', 'Sci c2', 'Eng', 'Math c1', 'Sci c2'],
    ['Eng', 'Math c1', 'Hist c3', 'Eng', 'Math c1'],
    ['Sci c2', 'Eng', 'Math c1', 'Art c3', 'Eng'],
    ['Hist c3', 'PE', 'Sci c2', 'Eng', 'Lab c2'],
    ['Lib', 'Hist c3', 'PE', 'Sci c2', 'Hist c3']
  ];

  function ttGrid() {
    var out = '<div class="tt-grid">';
    out += SLOTS.map(function (d) { return '<s>' + d + '</s>'; }).join('');
    TT.forEach(function (row) {
      row.forEach(function (cell) {
        var parts = cell.split(' ');
        out += '<s class="' + (parts[1] || '') + '">' + parts[0] + '</s>';
      });
    });
    return out + '</div>';
  }

  function bars(rows) {
    return rows.map(function (r) {
      return '<div class="bar-row"><em>' + r[0] + '</em>' +
        '<div class="bar"><i data-w="' + r[1] + '%"></i></div>' +
        '<u>' + r[1] + '%</u></div>';
    }).join('');
  }

  var PANELS = [
    {
      tab: 'Timetable',
      title: 'Timetables that build themselves',
      copy: 'Feed in teachers, subjects, rooms and periods. Paperhint resolves the clashes, respects every teacher load rule, and publishes to the school calendar in one action.',
      list: [
        'Clash-free generation across sections, rooms and labs',
        'Teacher workload and free-period balancing',
        'Substitutions in a tap when a teacher is away',
        'Two-way sync with the school calendar'
      ],
      app: function () {
        return shell('Timetable',
          '<h4>Class VIII-B · Week 32 <u>Auto-generated</u></h4>' + ttGrid());
      }
    },
    {
      tab: 'Academics',
      title: 'Every mark, mapped to mastery',
      copy: 'Assessments, marks and grades live in one academic record. Paperhint turns raw scores into per-student, per-topic mastery that teachers can actually teach against.',
      list: [
        'Full academic record from admission to graduation',
        'Topic-level mastery, not just totals',
        'Class, section and cohort comparisons',
        'Report cards generated from live data'
      ],
      app: function () {
        return shell('Academics',
          '<h4>Class VIII-B · Term 2 mastery <u>Live</u></h4>' +
          bars([['Algebra', 86], ['Geometry', 72], ['Optics', 64], ['Cells', 91], ['Civics', 78]]));
      }
    },
    {
      tab: 'Library',
      title: 'A digital library of everything taught',
      copy: 'Class notes, textbooks, worksheets and reference material — digitised, tagged by class and chapter, and searchable by every teacher and student who should see it.',
      list: [
        'Notes and books organised by class and chapter',
        'Teacher knowledge base that compounds each year',
        'Visibility controls per class, section or student',
        'Search across everything the school has ever taught'
      ],
      app: function () {
        return shell('Library',
          '<h4>Class VIII · Science <u>128 items</u></h4>' +
          '<div class="lib-grid">' +
            '<figure><div></div><figcaption>Ch 4 · Light</figcaption></figure>' +
            '<figure><div></div><figcaption>Ch 5 · Cells</figcaption></figure>' +
            '<figure><div></div><figcaption>Lab manual</figcaption></figure>' +
          '</div>');
      }
    },
    {
      tab: 'Question papers',
      title: 'Question papers in minutes, not evenings',
      copy: 'Teachers build papers from their own knowledge base — pick chapters, weightage and difficulty, and Paperhint drafts the paper, the blueprint and the answer key.',
      list: [
        'Blueprint-driven papers with weightage control',
        'Drawn from the school’s own notes and question bank',
        'Difficulty mix and marking scheme handled',
        'Teaching strategy suggested from past performance'
      ],
      app: function () {
        return shell('Question papers',
          '<h4>Term 2 · Science · 80 marks <u>Draft ready</u></h4>' +
          '<div class="q-line"><b>Q1</b>Light — reflection, 5 MCQ<span>5m</span></div>' +
          '<div class="q-line"><b>Q2</b>Cells — label and explain<span>12m</span></div>' +
          '<div class="q-line"><b>Q3</b>Optics — numerical, stepped<span>15m</span></div>' +
          '<div class="q-line"><b>Q4</b>Long answer — photosynthesis<span>20m</span></div>');
      }
    },
    {
      tab: 'Parent connect',
      title: 'Parents told, without a single reminder call',
      copy: 'Marks, homework and performance overviews shared by teachers trigger an email to the right parents automatically. No group chats, no missed notes in a diary.',
      list: [
        'Email triggers for marks, homework and overviews',
        'Teachers publish once — the right parents are notified',
        'Performance summaries in plain language',
        'A full trail of what was shared and when'
      ],
      app: function () {
        return shell('Parent connect',
          '<h4>Outbox · today <u>4 sent</u></h4>' +
          '<div class="feed-item"><i>M</i><div><b>Term 2 marks published</b>Class VIII-B · 38 parents notified</div></div>' +
          '<div class="feed-item"><i>H</i><div><b>Homework · Science Ch 5</b>Due Friday · 38 parents notified</div></div>' +
          '<div class="feed-item"><i>P</i><div><b>Performance overview</b>Shared by R. Iyer · 12 parents</div></div>' +
          '<div class="feed-item"><i>A</i><div><b>Attendance note</b>2 parents · follow-up flagged</div></div>');
      }
    }
  ];

  function animateBars(scope) {
    (scope || document).querySelectorAll('.bar-row .bar i[data-w]').forEach(function (el) {
      var w = el.getAttribute('data-w');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.style.width = w; });
      });
    });
  }

  function initSpec() {
    var tabsWrap = document.querySelector('.spec-tabs');
    var panel = document.querySelector('.spec-panel');
    if (!tabsWrap || !panel) return;

    var copyEl = panel.querySelector('.spec-copy');
    var visualEl = panel.querySelector('.spec-visual');

    function render(i) {
      var d = PANELS[i];
      copyEl.innerHTML = '<h3>' + d.title + '</h3><p>' + d.copy + '</p>' + points(d.list);
      visualEl.innerHTML = d.app();
      animateBars(visualEl);
    }

    tabsWrap.innerHTML = PANELS.map(function (d, i) {
      return '<button class="spec-tab' + (i === 0 ? ' active' : '') +
        '" type="button" data-i="' + i + '">' + d.tab + '</button>';
    }).join('');

    animateBars(visualEl);

    tabsWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.spec-tab');
      if (!btn || btn.classList.contains('active')) return;

      tabsWrap.querySelectorAll('.spec-tab').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var i = +btn.getAttribute('data-i');
      var app = visualEl.querySelector('.app');

      if (app && !reduceMotion) {
        app.classList.add('switching');
        setTimeout(function () { render(i); }, 220);
      } else {
        render(i);
      }
    });
  }

  /* ---------------- testimonial deck ----------------
     PLACEHOLDER quotes — replace with real teacher quotes before launch. */
  var TESTIMONIALS = [
    { q: 'The timetable used to eat my first two weeks of every term. Now it is done before the staff meeting ends.', n: 'Placeholder Name', r: 'Vice Principal · Placeholder School', g: '#0B8A5C' },
    { q: 'I build a paper from my own notes in about ten minutes. The blueprint and the answer key come with it.', n: 'Placeholder Name', r: 'Science, Grade VIII · Placeholder School', g: '#7C5CFF' },
    { q: 'I can see exactly which topic a class lost marks on, and reteach that instead of guessing.', n: 'Placeholder Name', r: 'Mathematics · Placeholder School', g: '#FF8A3D' },
    { q: 'Parents stopped calling to ask how their child is doing. They already know before they ask.', n: 'Placeholder Name', r: 'Class Teacher · Placeholder School', g: '#0B8A5C' },
    { q: 'Every note I have ever written is in one library, tagged by chapter. Nothing gets lost between years.', n: 'Placeholder Name', r: 'English · Placeholder School', g: '#7C5CFF' }
  ];

  function initDeck() {
    var deck = document.querySelector('.deck');
    var nav = document.querySelector('.deck-nav');
    if (!deck) return;

    deck.innerHTML = TESTIMONIALS.map(function (t, i) {
      var spark = '<svg class="t-spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" fill="currentColor"/></svg>';
      return '<article class="t-card" data-pos="' + i + '">' + spark +
        '<div><div class="quote-mark">“</div><blockquote>' + t.q + '</blockquote></div>' +
        '<div class="t-foot">' +
          '<div class="t-ava" style="background:' + t.g + '">' + t.n.charAt(0) + '</div>' +
          '<div><b>' + t.n + '</b><span>' + t.r + '</span></div>' +
        '</div>' +
      '</article>';
    }).join('');

    if (nav) {
      nav.innerHTML = TESTIMONIALS.map(function (t, i) {
        return '<button class="deck-dot' + (i === 0 ? ' on' : '') +
          '" type="button" data-i="' + i + '" aria-label="Testimonial ' + (i + 1) + '"></button>';
      }).join('');
    }

    var cards = Array.prototype.slice.call(deck.querySelectorAll('.t-card'));
    var top = 0;
    var timer = null;

    function paint() {
      cards.forEach(function (c, i) {
        var pos = (i - top + cards.length) % cards.length;
        c.classList.remove('leaving');
        c.setAttribute('data-pos', Math.min(pos, 4));
      });
      if (nav) {
        nav.querySelectorAll('.deck-dot').forEach(function (d, i) {
          d.classList.toggle('on', i === top);
        });
      }
    }

    function advance() {
      var leaving = cards[top];
      leaving.classList.add('leaving');
      top = (top + 1) % cards.length;
      setTimeout(paint, 480);
    }

    function goTo(i) {
      if (i === top) return;
      top = i;
      paint();
    }

    function start() {
      if (reduceMotion) return;
      stop();
      timer = setInterval(advance, 5200);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    paint();
    start();

    deck.addEventListener('mouseenter', stop);
    deck.addEventListener('mouseleave', start);
    deck.addEventListener('click', function () { stop(); advance(); start(); });

    if (nav) {
      nav.addEventListener('click', function (e) {
        var dot = e.target.closest('.deck-dot');
        if (!dot) return;
        stop();
        goTo(+dot.getAttribute('data-i'));
        start();
      });
    }
  }


  /* ---------------- bowl band: mixed-type marquee + cursor lift ----------------
     The hero subcopy rides the invisible bowl curve as a slow seamless
     marquee. Keywords are Merriweather italic (tspan.kw), connectives
     Geist medium. On fine pointers, words near the cursor lift off the
     curve, scale up and warm to emerald with a smoothstep falloff.
     NOTE: dy inside a textPath is cumulative, so every word writes the
     DELTA from the previous word's lift (self-compensating baseline). */
  var SVGNS = 'http://www.w3.org/2000/svg';

  var BOWL_TOKENS = [
    ['Timetables,', 1], ['academics,', 0], ['a', 0], ['digital', 1], ['library,', 1],
    ['question', 1], ['papers', 1], ['and', 0], ['parent', 1], ['updates', 1], ['\u2014', 0],
    ['Paperhint', 0], ['digitises', 0], ['every', 0], ['resource', 0], ['a', 0], ['school', 0],
    ['runs', 0], ['on,', 0], ['and', 0], ['gives', 0], ['admins,', 0], ['teachers,', 0],
    ['students', 0], ['and', 0], ['parents', 0], ['exactly', 0], ['the', 0], ['slice', 0],
    ['that', 0], ['belongs', 0], ['to', 0], ['them', 0], ['\u00B7', 0]
  ];

  function buildBand(tp) {
    var text = tp.parentNode;
    var svg = text.ownerSVGElement;
    var ref = tp.getAttribute('href') || tp.getAttribute('xlink:href');
    var path = ref && document.querySelector(ref);
    if (!svg || !path) return true; /* unbuildable, don't retry */

    var total = path.getTotalLength();
    var speed = parseFloat(tp.getAttribute('data-speed')) || 24;

    function makeUnit() {
      var frag = document.createDocumentFragment();
      BOWL_TOKENS.forEach(function (t) {
        var el = document.createElementNS(SVGNS, 'tspan');
        el.setAttribute('class', t[1] ? 'bw bserif' : 'bw');
        el.textContent = t[0] + ' ';
        frag.appendChild(el);
      });
      return frag;
    }

    /* one unit first, to measure */
    tp.textContent = '';
    tp.appendChild(makeUnit());
    var u = tp.getComputedTextLength();
    if (!u || u <= 0) { tp.textContent = tp.getAttribute('data-text') || ''; return false; } /* hidden now (e.g. .hero-arc on desktop) — retry on resize */

    var reps = Math.ceil((total + u) / u) + 1;
    for (var r = 1; r < reps; r++) tp.appendChild(makeUnit());

    /* per-word metadata: arc start is pure font metrics, path-independent */
    var words = [];
    var chars = 0;
    Array.prototype.forEach.call(tp.querySelectorAll('tspan'), function (el) {
      words.push({
        el: el,
        start: tp.getSubStringLength(0, chars),
        width: el.getComputedTextLength(),
        lift: 0,
        active: false
      });
      chars += el.textContent.length;
    });

    if (reduceMotion) return true; /* static band: full text, no marquee, no hover */

    var BASE = parseFloat(getComputedStyle(text).fontSize) || 24;
    var R = 110, LIFT = -8, SCALE = 0.24;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var cursor = null;

    if (canHover) {
      window.addEventListener('pointermove', function (e) {
        cursor = { x: e.clientX, y: e.clientY };
      }, { passive: true });
      document.documentElement.addEventListener('mouseleave', function () { cursor = null; });
    }

    var t0 = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      var offset = -(((t - t0) / 1000 * speed) % u);
      tp.setAttribute('startOffset', offset);

      if (canHover) {
        var ctm = cursor ? svg.getScreenCTM() : null;
        var prevLift = 0;
        for (var i = 0; i < words.length; i++) {
          var w = words[i];
          var target = 0;
          if (cursor && ctm) {
            var arc = w.start + offset + w.width / 2;
            if (arc >= 0 && arc <= total) {
              var pt = path.getPointAtLength(arc);
              var sx = ctm.a * pt.x + ctm.c * pt.y + ctm.e;
              var sy = ctm.b * pt.x + ctm.d * pt.y + ctm.f;
              var dx = sx - cursor.x, dyv = sy - cursor.y;
              var d = Math.sqrt(dx * dx + dyv * dyv);
              if (d < R) { var k = 1 - d / R; target = k * k * (3 - 2 * k); }
            }
          }
          w.lift += (target - w.lift) * 0.18;
          if (w.lift < 0.004 && target === 0) w.lift = 0;

          var liftPx = LIFT * w.lift;
          var delta = liftPx - prevLift;
          prevLift = liftPx;

          if (Math.abs(liftPx) > 0.01 || Math.abs(delta) > 0.01) {
            w.el.setAttribute('dy', delta.toFixed(2));
            w.el.setAttribute('font-size', (BASE * (1 + SCALE * w.lift)).toFixed(2));
            w.el.style.fill = w.lift > 0.25 ? 'var(--emerald)' : '';
            w.active = true;
          } else if (w.active) {
            w.el.removeAttribute('dy');
            w.el.removeAttribute('font-size');
            w.el.style.fill = '';
            w.active = false;
          }
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* build every band (big bowl + the narrow-viewport arc); a band that is
     display:none at load (so unmeasurable) is retried when the viewport
     crosses the breakpoint. */
  function initBowlBand() {
    var pending = Array.prototype.slice.call(document.querySelectorAll('.bowl-marquee textPath'));
    if (!pending.length) return;

    function attempt() {
      pending = pending.filter(function (tp) { return buildBand(tp) === false; });
    }
    attempt();

    if (pending.length) {
      var timer = null;
      window.addEventListener('resize', function () {
        if (!pending.length) return;
        clearTimeout(timer);
        timer = setTimeout(attempt, 200);
      });
    }
  }

  function bootMarquee() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initBowlBand);
    } else {
      initBowlBand();
    }
  }

  /* ---------------- scroll reveal ---------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        animateBars(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }


  /* ---------------- hero email capture ---------------- */
  function initHeroCapture() {
    var form = document.querySelector('form.hero-capture');
    if (!form) return;
    var input = form.querySelector('input[type="email"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        form.classList.add('invalid');
        input.focus();
        return;
      }
      form.classList.remove('invalid');
      location.href = 'contact.html?type=demo&email=' + encodeURIComponent(v);
    });
    input.addEventListener('input', function () { form.classList.remove('invalid'); });
  }

  /* ---------------- contact form ---------------- */
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 4200);
  }

  function initContact() {
    var form = document.querySelector('form.contact-form');
    if (!form) return;

    /* preselect the enquiry type from ?type= */
    var params = new URLSearchParams(location.search);
    var type = params.get('type');
    if (type) {
      var radio = form.querySelector('.etype input[value="' + CSS.escape(type) + '"]');
      if (radio) radio.checked = true;
    }
    /* hero capture hands the email over via ?email= */
    var email = params.get('email');
    var emailField = document.getElementById('f-email');
    if (email && emailField) emailField.value = email;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      /* Front-end only for now — no endpoint wired up yet. */
      form.reset();
      var first = form.querySelector('.etype input');
      if (first) first.checked = true;
      toast('Thanks — we’ll be in touch within one working day.');
    });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    initNeat();
    initSpec();
    initDeck();
    initReveal();
    initContact();
    initHeroCapture();
    bootMarquee();
    /* reserved: initGravity() — Matter.js #gravity-layer (fixed overlay, z-index 60)
       will be slotted in here later; nothing decorative owns the viewport floor. */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
