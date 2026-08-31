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
    var btn = e.target.closest && (e.target.closest('.theme-btn') || e.target.closest('.menu-theme'));
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
  function bandBox(wrap) {
    var box = wrap.getBoundingClientRect();
    var W = Math.round(box.width);
    /* the under-sweep has to pass below the last line of the lockup */
    var anchor = document.querySelector('.hero-note') || document.querySelector('.hero-capture');
    if (!anchor) {
      var lock = wrap.parentNode.querySelector('.hero-content');
      anchor = lock ? lock.lastElementChild : null;
    }
    var drop = parseFloat(wrap.getAttribute('data-drop')) || 66;
    var H = anchor ? Math.round(anchor.getBoundingClientRect().bottom - box.top + drop) : Math.round(W * 0.5);
    return { W: W, H: Math.max(300, Math.min(H, 1100)) };
  }

  /* enters upper-left, sweeps under the lockup, curls a loop in the right
     margin, exits top-right — so it frames the content instead of crossing it */
  function loopPath(W, H) {
    function X(n) { return (n * W).toFixed(1); }
    function Y(n) { return (n * H).toFixed(1); }
    return 'M ' + X(-0.04) + ' ' + Y(0.16) +
           ' C ' + X(0.005) + ' ' + Y(0.46) + ', ' + X(0.05) + ' ' + Y(0.75) + ', ' + X(0.17) + ' ' + Y(0.87) +
           ' C ' + X(0.33) + ' ' + Y(1.0) + ', ' + X(0.63) + ' ' + Y(1.0) + ', ' + X(0.79) + ' ' + Y(0.90) +
           ' C ' + X(0.89) + ' ' + Y(0.84) + ', ' + X(0.972) + ' ' + Y(0.73) + ', ' + X(0.95) + ' ' + Y(0.59) +
           ' C ' + X(0.932) + ' ' + Y(0.46) + ', ' + X(0.80) + ' ' + Y(0.47) + ', ' + X(0.818) + ' ' + Y(0.60) +
           ' C ' + X(0.836) + ' ' + Y(0.72) + ', ' + X(0.955) + ' ' + Y(0.69) + ', ' + X(1.005) + ' ' + Y(0.50) +
           ' C ' + X(1.03) + ' ' + Y(0.41) + ', ' + X(1.035) + ' ' + Y(0.34) + ', ' + X(1.045) + ' ' + Y(0.24);
  }

  function sweepPath(W, H) {
    /* narrow screens: the same character of curve, without the curl */
    function X(n) { return (n * W).toFixed(1); }
    function Y(n) { return (n * H).toFixed(1); }
    return 'M ' + X(-0.05) + ' ' + Y(0.22) +
           ' C ' + X(0.03) + ' ' + Y(0.62) + ', ' + X(0.10) + ' ' + Y(0.86) + ', ' + X(0.30) + ' ' + Y(0.90) +
           ' C ' + X(0.55) + ' ' + Y(0.95) + ', ' + X(0.72) + ' ' + Y(0.72) + ', ' + X(0.84) + ' ' + Y(0.50) +
           ' C ' + X(0.93) + ' ' + Y(0.33) + ', ' + X(0.99) + ' ' + Y(0.22) + ', ' + X(1.05) + ' ' + Y(0.10);
  }

  /* one band = one <svg> holding the curve, the ribbon strokes and the text */
  function bandTokens(wrap) {
    var raw = wrap.getAttribute('data-words');
    if (!raw) return BOWL_TOKENS;
    return raw.split(/\s+/).filter(Boolean).map(function (w) {
      var kw = w.length > 2 && w.charAt(0) === '*' && w.charAt(w.length - 1) === '*';
      return [kw ? w.slice(1, -1) : w, kw ? 1 : 0];
    });
  }

  function Band(wrap) {
    var svg   = wrap.querySelector('svg');
    var text  = wrap.querySelector('.bowl-marquee');
    var tp    = text && text.querySelector('textPath');
    var path  = svg && svg.querySelector('.bowl-line');
    var bands = svg ? svg.querySelectorAll('.ribbon-line, .ribbon-echo, .bowl-band, .bowl-band-echo') : [];
    if (!svg || !tp || !path) return null;

    var compact = function () { return innerWidth < 960; };
    var speed = parseFloat(tp.getAttribute('data-speed')) || 24;
    var words = [], total = 0, unitLen = 0, baseSize = 18;

    function layout() {
      var g = bandBox(wrap);
      if (!g.W) return false;                       /* hidden — nothing to draw */
      var H, d;
      if (compact()) {
        /* phones: the band lives BELOW the lockup, never across it */
        var hero = wrap.parentNode;
        var anchor = document.querySelector('.hero-note');
        var top = anchor
          ? Math.round(anchor.getBoundingClientRect().bottom - hero.getBoundingClientRect().top + 18)
          : 420;
        wrap.style.top = top + 'px';
        H = Math.max(110, Math.round(g.W * 0.3));
        d = sweepPath(g.W, H);
      } else {
        wrap.style.top = '';
        H = g.H;
        d = loopPath(g.W, H);
      }

      /* headroom above and below so the 42px stroke never gets shaved */
      var PADY = 56;
      svg.setAttribute('viewBox', '0 ' + (-PADY) + ' ' + g.W + ' ' + (H + PADY * 2));
      svg.setAttribute('width', g.W);
      svg.setAttribute('height', H + PADY * 2);
      svg.style.marginTop = (-PADY) + 'px';
      path.setAttribute('d', d);
      for (var i = 0; i < bands.length; i++) bands[i].setAttribute('d', d);

      total = path.getTotalLength();
      for (var b = 0; b < bands.length; b++) {
        bands[b].style.setProperty('--len', Math.ceil(bands[b].getTotalLength()));
      }
      baseSize = parseFloat(getComputedStyle(text).fontSize) || 18;
      return fill();
    }

    var TOKENS = bandTokens(wrap);

    function unit() {
      var frag = document.createDocumentFragment();
      for (var i = 0; i < TOKENS.length; i++) {
        var t = document.createElementNS(SVGNS, 'tspan');
        if (TOKENS[i][1]) t.setAttribute('class', 'kw');
        t.textContent = TOKENS[i][0] + ' ';
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

  function initBowlBand() {
    var bands = [];
    document.querySelectorAll('.hero-ribbon').forEach(function (wrap) {
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




  /* ---------------- ask-paperhint chat (placeholder + adapter seam) ----------------
     The UI is final; the brain is swappable. Wire a real backend by replacing
     window.PaperhintChat.adapter with an async (question, history) => reply. */
  var CANNED = [
    [/pric|cost|fee|plan/i, 'Pricing is per enrolled student per year \u2014 Starter \u20b949, School \u20b939 (most schools), District custom. One licence covers admins, teachers, students and parents. Details on the pricing page.'],
    [/parent|email|notif/i, 'When a teacher publishes marks, homework or an overview, the right parents get an email automatically \u2014 no app to install, no group chats.'],
    [/timetable|schedule|clash/i, 'Feed in teachers, subjects, rooms and periods \u2014 Paperhint generates a clash-free timetable and syncs it to the school calendar. Substitutions take one tap.'],
    [/paper|question|exam|test/i, 'Teachers build question papers from their own notes library \u2014 pick chapters, weightage and difficulty, and the paper, blueprint and answer key are drafted together.'],
    [/demo|start|onboard|migrat/i, 'Book a demo from the button above \u2014 we set up one of your classes beforehand so you see your school, not a sample one. Migration is included on School and District plans.']
  ];

  window.PaperhintChat = {
    adapter: function (question) {
      /* PLACEHOLDER brain: canned matches + a graceful fallback.
         Replace with: return fetch(YOUR_ENDPOINT, {...}).then(r => r.json())... */
      return new Promise(function (resolve) {
        setTimeout(function () {
          for (var i = 0; i < CANNED.length; i++) {
            if (CANNED[i][0].test(question)) return resolve(CANNED[i][1]);
          }
          resolve('Good question \u2014 I\u2019m a placeholder for now, so I\u2019d rather not guess. Drop it in the contact form and a person will answer within a working day.');
        }, 650 + Math.random() * 500);
      });
    }
  };



  /* ---------------- parallax layers ----------------
     Elements with data-plx drift by (distance from viewport centre x factor):
     positive lags the scroll (background), negative leads it (foreground). */
  function initParallax() {
    var els = document.querySelectorAll('[data-plx]');
    if (!els.length || reduceMotion) return;
    var items = Array.prototype.map.call(els, function (el) {
      return { el: el, f: parseFloat(el.getAttribute('data-plx')) || 0 };
    });
    var queued = false;
    function frame() {
      queued = false;
      var mid = innerHeight / 2;
      items.forEach(function (it) {
        var r = it.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        var d = (r.top + r.height / 2) - mid;
        var base = it.el.classList.contains('cr-gang') ? 'translateX(-50%) ' : '';
        it.el.style.transform = base + 'translateY(' + (d * it.f).toFixed(1) + 'px)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(frame); }
    }, { passive: true });
    frame();
  }

  /* ---------------- mobile menu ---------------- */
  function initNavMenu() {
    var nav = document.querySelector('.nav');
    var burger = nav && nav.querySelector('.nav-burger');
    if (!nav || !burger) return;
    var menu = nav.querySelector('.nav-menu');
    function setOpen(open) {
      nav.classList.toggle('menu-open', open);
      if (menu) menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    }
    burger.addEventListener('click', function () {
      setOpen(!nav.classList.contains('menu-open'));
    });
    nav.querySelectorAll('.nav-menu a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('menu-open') && !nav.contains(e.target)) setOpen(false);
    });
  }

  function initChat() {
    var root = document.getElementById('ask-paperhint');
    if (!root) return;
    var pill = root.querySelector('.chat-pill');
    var panel = root.querySelector('.chat-panel');
    var log = root.querySelector('.chat-log');
    var form = root.querySelector('.chat-form');
    var input = form.querySelector('input');

    pill.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      pill.setAttribute('aria-expanded', String(open));
      if (open) input.focus();
    });

    function add(kind, text) {
      var el = document.createElement('div');
      el.className = 'chat-msg ' + kind;
      el.textContent = text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      return el;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      input.value = '';
      add('me', q);
      var typing = add('bot typing', 'thinking\u2026');
      window.PaperhintChat.adapter(q).then(function (reply) {
        typing.classList.remove('typing');
        typing.textContent = reply;
        log.scrollTop = log.scrollHeight;
      });
    });
  }


  /* ---------------- animated favicon ----------------
     The tab icon is the rosette, redrawn on a canvas and swapped into
     <link rel="icon"> so it spins in sync with the in-page marks.
     Chrome/Edge/Firefox animate; Safari ignores swaps and keeps the
     static icon — a clean fallback. Throttled to ~8fps and only while
     the angle is actually changing. */
  var ROSETTE_D = 'M13.0084 1.3766C13.7737 2.14565 14.2463 3.15379 14.3544 4.22631C15.3798 2.58856 15.6072 1.73351 15.6072 1.73351C16.6106 2.46619 17.2834 3.56947 17.4774 4.80065C17.6467 5.87486 17.4395 6.96965 16.8996 7.90118C18.6871 7.18196 19.3711 6.62453 19.3711 6.62453C19.7544 7.81004 19.6534 9.10001 19.0903 10.2107C18.599 11.1797 17.791 11.943 16.8095 12.3777C18.6762 12.8518 19.5556 12.8049 19.5556 12.8049C19.1723 13.9904 18.3361 14.9743 17.231 15.5402C16.2668 16.034 15.1667 16.1742 14.1183 15.9461C15.3513 17.4323 16.0902 17.9139 16.0902 17.9139C15.0867 18.6465 13.8348 18.9486 12.6097 18.7536C11.5408 18.5835 10.5688 18.0471 9.85413 17.2432C9.98239 19.1739 10.2985 20 10.2985 20C9.0582 20 7.86867 19.5048 6.99163 18.6234C6.2264 17.8544 5.75375 16.8462 5.64567 15.7737C4.62023 17.4115 4.39286 18.2665 4.39286 18.2665C3.38941 17.5338 2.71668 16.4305 2.52265 15.1994C2.35335 14.1252 2.56059 13.0304 3.10043 12.0989C1.31296 12.8181 0.628921 13.3755 0.628921 13.3755C0.245639 12.19 0.346658 10.9 0.909756 9.78937C1.40106 8.82031 2.20902 8.05702 3.19058 7.6223C1.32385 7.14827 0.444435 7.19517 0.444435 7.19517C0.827718 6.00966 1.66391 5.02572 2.76905 4.45982C3.7333 3.96606 4.83338 3.82582 5.88173 4.05395C4.64875 2.56773 3.90986 2.08618 3.90986 2.08618C4.9133 1.3535 6.16527 1.05143 7.39032 1.24643C8.4592 1.41657 9.4312 1.95295 10.1459 2.75678C10.0177 0.826064 9.70151 0 9.70151 0C10.9418 2.42706e-07 12.1314 0.495178 13.0084 1.3766Z';

  function makeFaviconSpinner() {
    var link = document.querySelector('link[rel="icon"]');
    if (!link || typeof Path2D === 'undefined' || reduceMotion) return null;
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var path = new Path2D(ROSETTE_D);
    var last = -1e9, lastT = 0;

    return function (deg, now) {
      if (Math.abs(deg - last) < 5 || now - lastT < 120) return;  /* ~8fps, only on change */
      last = deg; lastT = now;
      ctx.clearRect(0, 0, 64, 64);
      ctx.save();
      ctx.translate(32, 32);
      ctx.rotate(deg * Math.PI / 180);
      ctx.scale(3.2, 3.2);          /* the path lives in a 20x20 box */
      ctx.translate(-10, -10);
      ctx.fillStyle = '#0B8A5C';
      ctx.fill(path);
      ctx.restore();
      try { link.href = canvas.toDataURL('image/png'); } catch (_) {}
    };
  }

  /* ---------------- nav choreography ----------------
     Boot: the bar is born as the rosette with the mark spinning inside, then
     opens and its contents fade in. Scrolling down folds it back into the
     rosette; scrolling up, or hovering the rosette, opens it again. */
  function initNavShrink() {
    var inner = document.querySelector('.nav-inner');
    if (!inner) return;

    var folded = false, wantFolded = false, booted = false;
    var mark = inner.querySelector('.brand .mark svg');

    /* the boot entrance animation holds its final keyframe (fill:both), which
       would override the spin transition — release it once it has played */
    if (mark) {
      mark.addEventListener('animationend', function (e) {
        if (e.animationName === 'markSpin' && inner.classList.contains('nav-arrive')) {
          inner.classList.remove('nav-arrive');   /* hand the mark to the scroll spin */
        }
      });
    }

    function fold() {
      /* measure BEFORE the class flips: how far the mark must glide to sit at
         the bar's centre once it has collapsed */
      /* the folded bar is a square of its own height, centred on the page;
         inside it the mark must land dead-centre. The bar's width collapse
         moves the brand's in-flow position too, so the glide is computed in
         the FOLDED box's coordinates: half the box, minus the padding and
         half the mark that precede it. */
      /* folded chip = the same --cap as the open bar's end-caps */
      var cap = parseFloat(getComputedStyle(inner).getPropertyValue('--cap')) || 70;
      if (mark) {
        /* exact: where the mark's centre sits inside the bar right now vs
           where the folded box's centre will be */
        var mr = mark.getBoundingClientRect();
        var ir = inner.getBoundingClientRect();
        var markCentreInBar = (mr.left + mr.width / 2) - ir.left;
        inner.style.setProperty('--brand-x',
          (cap / 2 - markCentreInBar).toFixed(1) + 'px');
      }
      inner.classList.add('nav-shrink');
      folded = true;
    }
    function unfold() {
      inner.classList.remove('nav-shrink');
      folded = false;
    }

    /* the mark turns WITH the scroll: clockwise going down, back going up —
       lerped every frame so it trails the page like it has momentum */
    if (mark && !reduceMotion) {
      var spinners = [mark];
      var footMark = document.querySelector('footer .brand .mark svg');
      if (footMark) spinners.push(footMark);
      var favicon = makeFaviconSpinner();
      var rot = 0;
      (function spinLoop(now) {
        var target = scrollY * 0.4;               /* 0.4° per scrolled px */
        rot += (target - rot) * 0.09;             /* soft pursuit */
        if (Math.abs(target - rot) > 0.05) {
          var t = 'rotate(' + rot.toFixed(2) + 'deg)';
          for (var i = 0; i < spinners.length; i++) spinners[i].style.transform = t;
          if (favicon) favicon(rot, now || 0);
        }
        requestAnimationFrame(spinLoop);
      })(0);
    }

    /* boot: the collapsed rosette drops in from above with the mark spinning
       at centre; on release the bar exhales open while the mark spins once
       more on its way back to the left */
    if (!reduceMotion) {
      /* .nav-shrink/.nav-boot ship in the markup so the very first painted
         frame is already the collapsed rosette — here we only refine the
         measured values and arm the release */
      fold();
      var release = function () {
        setTimeout(function () {
          inner.classList.remove('nav-boot');
          booted = true;
          /* if the user already scrolled away during boot, stay folded */
          if (scrollY > 240) { wantFolded = true; return; }
          inner.classList.add('nav-arrive');   /* one decelerating turn during the glide */
          unfold();
        }, 1500); /* the drop lands (~1.1s) and the spin gets a beat to read */
      };
      if (document.readyState === 'complete') release();
      else window.addEventListener('load', release, { once: true });
      /* safety: never stay locked shut */
      setTimeout(function () {
        if (!booted) { inner.classList.remove('nav-boot'); unfold(); booted = true; }
      }, 4200);
    } else {
      inner.classList.remove('nav-boot');
      unfold();
      booted = true;
    }

    /* scroll: down folds, up opens — with real hysteresis so trackpad
       jitter and momentum wiggle can never make the bar oscillate */
    var lastY = scrollY, run = 0, lastFlip = 0;
    window.addEventListener('scroll', function () {
      if (!booted) return;
      var dy = scrollY - lastY; lastY = scrollY;
      if (Math.abs(dy) < 3) return;                    /* ignore jitter */
      run = (dy > 0) === (run > 0) ? run + dy : dy;    /* direction-consistent run */

      if (scrollY < 160) wantFolded = false;           /* always open near the top */
      else if (run > 220)  wantFolded = true;          /* a real downward run */
      else if (run < -260) wantFolded = false;         /* a real upward run */

      var now = performance.now();
      if (wantFolded !== folded && now - lastFlip > 700 && !inner.matches(':hover')) {
        lastFlip = now;
        run = 0;
        wantFolded ? fold() : unfold();
      }
    }, { passive: true });

    /* hover the rosette: peek open; leave: fold back if it should be folded */
    inner.addEventListener('pointerenter', function () {
      if (booted && folded) unfold();
    });
    inner.addEventListener('pointerleave', function () {
      if (booted && wantFolded && !folded) fold();
    });
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
    /* every major block takes part — auto-tag the ones the markup missed */
    ['.trust', '.foot-grid > div', '.faq details', '.contact-grid > *',
     '.c-step', '.deck-nav', '.testi-grid > *'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.classList.contains('reveal') && !el.closest('.reveal')) {
          el.classList.add('reveal');
        }
      });
    });

    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        /* stagger: nth revealed sibling in the same parent waits its turn */
        var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) {
          return c.classList && c.classList.contains('reveal');
        });
        var k = sibs.indexOf(el);
        if (k > 0) {
          el.style.transitionDelay = (k * 90) + 'ms';
          el.addEventListener('transitionend', function h() {
            el.style.transitionDelay = '';           /* don't lag later hovers */
            el.removeEventListener('transitionend', h);
          });
        }
        el.classList.add('in');
        animateBars(el);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.12 });

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
    initNavShrink();
    initChat();
    initNavMenu();
    initParallax();
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
