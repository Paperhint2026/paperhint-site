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


  /* ---------------- bowl band: dynamic curve + liquid mesh warp ----------------
     The curve is COMPUTED from the live hero box (not a hardcoded d), so it
     always frames the lockup and re-draws on resize. The hero subcopy rides it
     as a seamless marquee. Near the cursor each glyph run ripples — per-word
     dy, per-glyph rotate and a size swell driven by a travelling sine field.
     Done with attributes instead of SVG filters: same liquid read, 60fps.
     NOTE: dy inside a textPath is cumulative, so every word writes the DELTA
     from the previous word (self-compensating baseline). */
  var SVGNS = 'http://www.w3.org/2000/svg';

  var BOWL_TOKENS = [
    ['Timetables,', 1], ['academics,', 0], ['a', 0], ['digital', 1], ['library,', 1],
    ['question', 1], ['papers', 1], ['and', 0], ['parent', 1], ['updates', 1], ['\u2014', 0],
    ['Paperhint', 0], ['digitises', 0], ['every', 0], ['resource', 0], ['a', 0], ['school', 0],
    ['runs', 0], ['on,', 0], ['and', 0], ['gives', 0], ['admins,', 0], ['teachers,', 0],
    ['students', 0], ['and', 0], ['parents', 0], ['exactly', 0], ['the', 0], ['slice', 0],
    ['that', 0], ['belongs', 0], ['to', 0], ['them', 0], ['\u00B7', 0]
  ];

  /* ---- the curve, drawn to fit whatever the hero currently is ---- */
  function bowlGeometry(wrap) {
    var box = wrap.getBoundingClientRect();
    var W = Math.round(box.width);
    /* the bowl floor clears the last thing in the lockup */
    var anchor = document.querySelector('.hero-note') || document.querySelector('.hero-capture');
    var H = anchor
      ? Math.round(anchor.getBoundingClientRect().bottom - box.top + 46)
      : Math.round(box.width * 0.36);
    H = Math.max(240, Math.min(H, 720));
    return { W: W, H: H };
  }

  function bowlPath(W, H) {
    var y = H - 12;                       /* the flat of the bowl */
    var xa = W * 0.19, xb = W * 0.81;     /* where the descent flattens out */
    return 'M ' + (-W * 0.02) + ' -10' +
           ' C ' + (W * 0.008) + ' ' + (H * 0.42) + ', ' + (W * 0.055) + ' ' + (H * 0.74) + ', ' + xa + ' ' + y +
           ' C ' + (W * 0.33) + ' ' + (H + 14) + ', ' + (W * 0.67) + ' ' + (H + 14) + ', ' + xb + ' ' + y +
           ' C ' + (W * 0.945) + ' ' + (H * 0.74) + ', ' + (W * 0.992) + ' ' + (H * 0.42) + ', ' + (W * 1.02) + ' -10';
  }

  function arcPath(W, H) {
    return 'M ' + (-W * 0.02) + ' ' + (H - 8) +
           ' Q ' + (W / 2) + ' ' + (-H * 0.55) + ', ' + (W * 1.02) + ' ' + (H - 8);
  }

  /* one band = one <svg> holding the curve, the ribbon strokes and the text */
  function Band(wrap) {
    var svg   = wrap.querySelector('svg');
    var text  = wrap.querySelector('.bowl-marquee');
    var tp    = text && text.querySelector('textPath');
    var path  = svg && svg.querySelector('.bowl-line');
    var bands = svg ? svg.querySelectorAll('.bowl-band, .bowl-band-echo') : [];
    if (!svg || !tp || !path) return null;

    var isArc = wrap.classList.contains('hero-arc');
    var speed = parseFloat(tp.getAttribute('data-speed')) || 24;
    var words = [], total = 0, unitLen = 0, baseSize = 18;

    function layout() {
      var g = bowlGeometry(wrap);
      if (!g.W) return false;                       /* hidden — nothing to draw */
      var H = isArc ? Math.max(70, Math.round(g.W * 0.055)) : g.H;
      var d = isArc ? arcPath(g.W, H) : bowlPath(g.W, H);

      svg.setAttribute('viewBox', '0 0 ' + g.W + ' ' + H);   /* 1 user unit = 1 px */
      svg.setAttribute('width', g.W);
      svg.setAttribute('height', H);
      path.setAttribute('d', d);
      for (var i = 0; i < bands.length; i++) bands[i].setAttribute('d', d);

      total = path.getTotalLength();
      baseSize = parseFloat(getComputedStyle(text).fontSize) || 18;
      return fill();
    }

    function unit() {
      var frag = document.createDocumentFragment();
      for (var i = 0; i < BOWL_TOKENS.length; i++) {
        var t = document.createElementNS(SVGNS, 'tspan');
        if (BOWL_TOKENS[i][1]) t.setAttribute('class', 'kw');
        t.textContent = BOWL_TOKENS[i][0] + ' ';
        frag.appendChild(t);
      }
      return frag;
    }

    function fill() {
      tp.textContent = '';
      tp.appendChild(unit());
      unitLen = tp.getComputedTextLength();
      if (!unitLen || unitLen <= 0) return false;

      var reps = Math.ceil((total + unitLen) / unitLen) + 1;
      for (var r = 1; r < reps; r++) tp.appendChild(unit());

      words = [];
      var chars = 0;
      Array.prototype.forEach.call(tp.querySelectorAll('tspan'), function (el) {
        words.push({ el: el, start: tp.getSubStringLength(0, chars), w: el.getComputedTextLength(), e: 0, on: false });
        chars += el.textContent.length;
      });
      return words.length > 0;
    }

    var ok = layout();

    /* ---- cursor: kept in this band's own user units ---- */
    var cur = null, live = false;
    var canWarp = !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (canWarp) {
      window.addEventListener('pointermove', function (e) {
        var r = svg.getBoundingClientRect();
        if (!r.width) { cur = null; return; }
        var near = e.clientX > r.left - 60 && e.clientX < r.right + 60 &&
                   e.clientY > r.top - 60 && e.clientY < r.bottom + 60;
        cur = near ? { x: (e.clientX - r.left) * (total ? svg.viewBox.baseVal.width / r.width : 1),
                       y: (e.clientY - r.top) * (svg.viewBox.baseVal.height / r.height) } : null;
        if (near) live = true;
      }, { passive: true });
      document.documentElement.addEventListener('mouseleave', function () { cur = null; });
    }

    var R = 150, t0 = null;
    function frame(t) {
      if (!ok) { requestAnimationFrame(frame); return; }
      if (t0 === null) t0 = t;
      var el = (t - t0) / 1000;
      var offset = reduceMotion ? 0 : -((el * speed) % unitLen);
      tp.setAttribute('startOffset', offset.toFixed(1));

      if (canWarp && (cur || live)) {
        var prev = 0, anyOn = false;
        for (var i = 0; i < words.length; i++) {
          var w = words[i], target = 0;
          var arc = w.start + offset + w.w / 2;
          if (cur && arc >= 0 && arc <= total) {
            var pt = path.getPointAtLength(arc);
            var dx = pt.x - cur.x, dy2 = pt.y - cur.y;
            var dist = Math.sqrt(dx * dx + dy2 * dy2);
            if (dist < R) { var k = 1 - dist / R; target = k * k * (3 - 2 * k); }
          }
          /* energy rises fast, ebbs slowly — the wake */
          w.e = target > w.e ? w.e + (target - w.e) * 0.34 : w.e * 0.94;
          if (w.e < 0.004) w.e = 0;

          if (w.e) {
            anyOn = true;
            /* travelling sine field = the liquid ripple */
            var ph = arc * 0.055 + el * 3.4;
            var lift = -10 * w.e * (0.55 + 0.45 * Math.sin(ph));
            var spin = 9 * w.e * Math.sin(ph * 0.8 + 1.1);
            var d = lift - prev; prev = lift;
            w.el.setAttribute('dy', d.toFixed(2));
            w.el.setAttribute('rotate', spin.toFixed(1));
            w.el.setAttribute('font-size', (baseSize * (1 + 0.24 * w.e)).toFixed(2));
            w.el.style.fill = w.e > 0.5 ? 'var(--yellow)' : w.e > 0.1 ? 'var(--emerald)' : '';
            w.on = true;
          } else if (w.on) {
            var d0 = 0 - prev; prev = 0;
            w.el.setAttribute('dy', d0.toFixed(2));
            w.el.removeAttribute('rotate');
            w.el.removeAttribute('font-size');
            w.el.style.fill = '';
            w.on = false;
          }
        }
        if (!anyOn && !cur) live = false;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    return { relayout: function () { ok = layout(); } };
  }

  /* ---------------- looping ribbon (drawn to the live hero box) ---------------- */
  function ribbonPath(W, H) {
    /* normalised waypoints: sweep in from the left, dip, rise, curl a full
       loop on the right, exit top-right — scaled to whatever the hero is */
    function X(n) { return (n * W).toFixed(1); }
    function Y(n) { return (n * H).toFixed(1); }
    return 'M ' + X(-0.03) + ' ' + Y(0.30) +
           ' C ' + X(0.07) + ' ' + Y(0.52) + ', ' + X(0.13) + ' ' + Y(0.80) + ', ' + X(0.26) + ' ' + Y(0.76) +
           ' C ' + X(0.39) + ' ' + Y(0.72) + ', ' + X(0.40) + ' ' + Y(0.40) + ', ' + X(0.51) + ' ' + Y(0.27) +
           ' C ' + X(0.60) + ' ' + Y(0.16) + ', ' + X(0.75) + ' ' + Y(0.20) + ', ' + X(0.755) + ' ' + Y(0.40) +
           ' C ' + X(0.76) + ' ' + Y(0.60) + ', ' + X(0.61) + ' ' + Y(0.66) + ', ' + X(0.555) + ' ' + Y(0.53) +
           ' C ' + X(0.50) + ' ' + Y(0.40) + ', ' + X(0.62) + ' ' + Y(0.29) + ', ' + X(0.76) + ' ' + Y(0.31) +
           ' C ' + X(0.88) + ' ' + Y(0.33) + ', ' + X(0.95) + ' ' + Y(0.22) + ', ' + X(1.03) + ' ' + Y(0.02);
  }

  function initHeroRibbon() {
    var wrap = document.querySelector('.hero-ribbon');
    if (!wrap) return;
    var svg = wrap.querySelector('svg');
    var lines = svg ? svg.querySelectorAll('.ribbon-line, .ribbon-echo') : [];
    if (!svg || !lines.length) return;

    function draw() {
      var W = Math.round(wrap.getBoundingClientRect().width);
      if (!W) return;
      var H = Math.round(Math.min(620, Math.max(340, W * 0.42)));
      var d = ribbonPath(W, H);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);
      for (var i = 0; i < lines.length; i++) {
        lines[i].setAttribute('d', d);
        var len = Math.ceil(lines[i].getTotalLength());
        lines[i].style.setProperty('--len', len);
      }
    }

    draw();
    var t = null;
    window.addEventListener('resize', function () {
      clearTimeout(t); t = setTimeout(draw, 180);
    });
  }

  function initBowlBand() {
    var bands = [];
    document.querySelectorAll('.hero-bowl, .hero-arc').forEach(function (wrap) {
      var b = Band(wrap);
      if (b) bands.push(b);
    });
    if (!bands.length) return;

    var timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        bands.forEach(function (b) { b.relayout(); });
      }, 180);
    });
  }

  function bootMarquee() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initBowlBand);
    } else {
      initBowlBand();
    }
  }


  /* ---------------- role folder: tabs over one shared panel ---------------- */
  var ROLES = {
    admins: {
      lead: 'Run the school A to Z, in one place',
      cta: 'Explore admin tools',
      items: [
        ['Timetables without the clashes', 'Generate a clash-free timetable across every section, room and lab, then publish it to the school calendar in one action.'],
        ['One record per person', 'Teachers, students, sections and the full academic year live in one console instead of eleven spreadsheets.'],
        ['See teacher load at a glance', 'Balance workloads and free periods before term starts, and fill absences in a tap.']
      ]
    },
    teachers: {
      lead: 'Your notes, your papers, your strategy',
      cta: 'Explore teacher tools',
      items: [
        ['Question papers in minutes', 'Build a paper from your own library — blueprint, weightage and answer key come with it.'],
        ['A knowledge base that compounds', 'Notes tagged by class and chapter, reusable every year instead of rewritten every year.'],
        ['Know which topic to reteach', 'Topic-level mastery shows where a class actually lost marks, not just who scored what.']
      ]
    },
    students: {
      lead: 'Know where you stand, and what to read',
      cta: 'Explore the student view',
      items: [
        ['Performance you can actually see', 'Marks become topic-level mastery, shared with you instead of hidden in a register.'],
        ['Every note your teacher shares', 'Class notes, worksheets and books, visible the moment a teacher publishes them.'],
        ['Homework and timetable in one place', 'What is due, what is next, and what changed this week.']
      ]
    },
    parents: {
      lead: 'Told before you have to ask',
      cta: 'See parent updates',
      items: [
        ['Marks arrive by email', 'When a teacher publishes results, the right parents are notified — no group chats.'],
        ['Homework, without the diary', 'Assignments and due dates reach you as they are set.'],
        ['Plain-language overviews', 'Performance summaries written by the teacher who teaches your child.']
      ]
    }
  };

  function initRoleFolder() {
    var folder = document.querySelector('.rolefolder');
    if (!folder) return;
    var tabs = folder.querySelectorAll('.rf-tab');
    var panel = folder.querySelector('.rf-panel');

    function render(key) {
      var d = ROLES[key];
      if (!d) return;
      panel.innerHTML =
        '<div class="rf-lead"><h3>' + d.lead + '</h3>' +
        '<a class="btn btn-ghost" href="contact.html?type=demo">' + d.cta + '</a></div>' +
        '<div class="rf-items">' + d.items.map(function (it) {
          return '<div class="rf-item"><b>' + it[0] + '</b><p>' + it[1] + '</p></div>';
        }).join('') + '</div>';
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) { o.classList.remove('active'); o.setAttribute('aria-selected', 'false'); });
        t.classList.add('active'); t.setAttribute('aria-selected', 'true');
        panel.classList.add('swapping');
        setTimeout(function () {
          render(t.getAttribute('data-role'));
          panel.classList.remove('swapping');
        }, reduceMotion ? 0 : 160);
      });
    });

    render('admins');
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
    initHeroRibbon();
    initRoleFolder();
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
