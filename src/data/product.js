/* The product page, and the per-role product stories.
 *
 * Each feature carries the audience that actually touches it, so a role page
 * can tell the product through that person's eyes rather than sending
 * everyone to one shared catalogue. A feature is only tagged for someone the
 * feature list actually says it reaches: students are not tagged on homework
 * or attendance, because it says those reach parents.
 *
 * Every feature and every sentence is lifted from docs/feature-list.md, which
 * is derived from docs/product-brief.md — the source of truth. Nothing is
 * invented here and nothing is promised that isn't shipped: the roadmap items
 * that file marks as deliberately unpromised (analytics dashboards,
 * performance insights, a tuition-lite version) do not appear at all.
 *
 * The headline, standfirst and closing line are marked DRAFT and are the
 * parts the founder's own narrative replaces.
 */

export const PRODUCT = {
  kicker: 'THE PRODUCT',
  h1: ['Everything a school ', 'd', 'oes in a week'],            /* DRAFT */
  sub: 'An assistant at the teacher’s desk and another in the office — preparing, remembering and following through, so the hours go to teaching.',  /* DRAFT */
  title: 'Paperhint — Complete School Software for Teachers and Schools',
  description: 'Everything Paperhint carries: attendance, answer-sheet evaluation, question papers, teaching notes, homework, shared libraries, allotments, the admin portal, student records and parent notifications — so a school runs faster.',

  /* the one claim that frames all the others */
  opening: 'A teaching week is a stack of jobs that are not teaching. Attendance, homework, notes for the next class, papers to set, sheets to mark, parents to tell, a period to cover.',
  introTurn: 'Now they arrive done.',
  /* the second half of the grand intro: what Paperhint is inside that week */
  introAnswer: 'Paperhint carries them. An assistant at the teacher\u2019s desk and another in the office, preparing the next class, marking every sheet the same way, telling parents itself and holding the year\u2019s records in one place \u2014 so a school moves at a pace hand-work never reached.',

  groups: [
    {
      id: 'copilot',
      title: 'The copilot',
      lead: 'Ask for the work in plain language, at the desk where you are already standing.',
      features: [
        ['Teacher’s copilot', 'A chat interface at the teacher’s desk: prepare notes, work through teaching tasks, ask for what you need in plain language. Everything further down this page can be reached by asking for it.', ['teachers']],
        ['Office copilot', 'The same thing on the other side of the building. Allotment changes and every module of the admin portal can be driven by asking, in plain language, instead of working through forms.', ['schools']],
      ],
    },
    {
      id: 'desk',
      title: 'At the teacher’s desk',
      lead: 'The jobs that fill a teaching week, carried alongside you.',
      features: [
        ['Answer-sheet evaluation', 'Photograph answer sheets with the mobile app. Every answer is checked against its question and scored on the teacher’s rubric, the same way for every student. The teacher reviews, adjusts and approves; each result lands on that student’s record.', ['teachers', 'students']],
        ['Question papers', 'Pick chapters, weightage and difficulty; the paper, blueprint and answer key are drafted for the syllabus, with the teacher’s notes and subject books tuning every question.', ['teachers']],
        ['Teaching notes', 'Notes drafted for the syllabus, ready to teach with — rewritten simpler for a weaker section, extended with diagrams, edited in a small note editor, or pasted in from the teacher’s own work.', ['teachers', 'students']],
        ['Homework and assignments', 'Homework drafted for what was taught today. Parents are notified the moment it’s assigned.', ['teachers', 'parents']],
        ['Personal library', 'Everything a teacher makes or uploads lands in their own repository, private by default.', ['teachers']],
        ['Shared library', 'Share a note and it’s visible to everyone on the school’s email — any class, any department. One teacher’s notes become every teacher’s shelf.', ['teachers']],
      ],
    },
    {
      id: 'office',
      title: 'In the school office',
      lead: 'The things that do not scale by hand: the lists, the allotments, the year itself.',
      features: [
        ['Attendance scanning', 'Attendance marked on the paper register the school already uses, scanned in; the day’s roll is recorded and absences reach parents. Manual entry works too.', 'Live today', ['schools', 'parents']],
        ['Resource planning and allotment', 'Automation works out which teacher is allotted to each class and section, kept in one clean interface, with an office copilot handling changes in plain language.', ['schools']],
        ['Admin portal', 'Classes, sections, students, teachers and subjects managed in one place, with create, read, update and delete for each module. The office copilot can drive all of it.', ['schools']],
        ['Batch migration', 'Promote a whole class to the next grade in one move at year end; absorb the fresh batch cleanly.', ['schools']],
        ['Subjects and books', 'Books and materials attached to each subject flow automatically to every teacher in that department, seeding their libraries and tuning drafted content.', ['schools', 'teachers']],
      ],
    },
    {
      id: 'classroom',
      title: 'Around the classroom',
      lead: 'What reaches the student and the people at home.',
      features: [
        ['Student records', 'Every evaluation is recorded to the student, exam over exam, building a performance record. Students see their results and the notes shared with them.', ['students', 'teachers', 'parents']],
        ['Parent notifications', 'Parents hear the moment homework is assigned, when marks are shared, and same-day when an absence is read from the attendance sheet.', ['parents', 'teachers']],
      ],
    },
  ],

  factsTitle: 'What it runs on',
  facts: [
    ['A phone and a browser', 'The hardware every school already has. No scanners, nothing to install in a room.'],
    ['Day one changes nothing', 'A teacher keeps the register, the notes and the way they already work — Paperhint starts there, so Monday needs no new habit.'],
    ['Your school’s own account', 'Data is scoped to your school; teacher libraries stay private until shared, and nothing is visible outside your school’s email.'],
    ['One licence per student', 'It covers admins, teachers, students and parents — everyone in the building.'],
  ],

  close: 'Two roles today, teachers and the office. The direction is a school that runs end to end in one place.',  /* DRAFT */

  cta: {
    heading: 'See it on your own answer sheets',
    sub: 'Send us a paper your school actually set, and we’ll show you the same class marked, recorded and shared.',
  },

  needs: ['Headline, standfirst and closing line',
          'A screenshot per feature group, and one of the copilot in use',
          'What the copilot can actually be asked for, beyond notes and teaching tasks',
          'Whether the copilot deserves its own page (it is the core feature)'],
};

/* [label, text] | [label, text, badge] | [label, text, roles] |
   [label, text, badge, roles] — read it once, here, rather than at each
   call site. */
function shape(f) {
  var badge = typeof f[2] === 'string' ? f[2] : null;
  var roles = Array.isArray(f[3]) ? f[3] : (Array.isArray(f[2]) ? f[2] : []);
  return { label: f[0], text: f[1], badge: badge, roles: roles };
}

export const FEATURES = PRODUCT.groups.flatMap(g =>
  g.features.map(f => ({ ...shape(f), group: g.id, groupTitle: g.title }))
);

/* ---------------------------------------------------------------------------
   WHERE THE WEEK GOES — the one section on the site that carries real
   numbers, because these are somebody else's and they are citable.

   OECD TALIS 2024, Table 3.16, full-time lower-secondary teachers, OECD
   average: a 41-hour working week of which 22.7 hours is teaching. The rest —
   18.3 hours, 45%% of the week — is everything around it, and the three
   largest named components are preparation (7.4), marking and correcting
   (4.6) and administrative work (3.0).

   THE CAVEAT IS PART OF THE SECTION, not a footnote to be dropped: India does
   not take part in TALIS. This is the OECD average and the page says so. We
   do not have an Indian figure and must not imply one.

   The three components are also, exactly, the three things Paperhint carries,
   which is why the section belongs on the product page and not on a role page.
   --------------------------------------------------------------------------- */
export const WEEK = {
  kicker: 'Where the week goes',
  title: 'Teaching is 22.7 hours of a 41-hour week.',
  turn: 'The other 18 are the reason we built this.',
  total: 41,
  teaching: 22.7,
  parts: [
    { h: 7.4, label: 'Preparing lessons', ours: 'Notes and question papers, drafted for your syllabus' },
    { h: 4.6, label: 'Marking and correcting', ours: 'Answer sheets scored on your rubric, from a photo' },
    { h: 3.0, label: 'Administrative work', ours: 'Attendance, records and the messages home' },
  ],
  rest: 'The remaining hours go to parents, counselling, teamwork and duties — the parts of the job that should be a person.',
  source: 'OECD TALIS 2024, Table 3.16 — full-time lower-secondary teachers, OECD average. India does not take part in TALIS, so this is the international picture, not an Indian one.',
  sourceHref: 'https://www.oecd.org/en/publications/results-from-talis-2024_90df6235-en.html',
};

/* ---------------------------------------------------------------------------
   THE SCOPE ROW — Mercury's divided row, but not their numbers.
   A count is only interesting if the reader already cares: "15 things it
   does" told nobody anything, and on a role page it was noise. So the row
   names the four things the product actually covers, in words, and it appears
   on /product only — where knowing the scope is the point of the page.
   --------------------------------------------------------------------------- */
export const SCOPE = [
  { k: 'The copilot', label: 'At the teacher\u2019s desk and in the office \u2014 asked, not filled in.' },
  { k: 'Prepare', label: 'Notes, question papers and homework, drafted for your syllabus.' },
  { k: 'Assess', label: 'Answer sheets marked to your rubric, recorded to each student.' },
  { k: 'Run the school', label: 'Records, allotment, attendance and the year itself.' },
];

/* Which mini-visual leads each essential tile. The tile is visual-first —
   the panel is the tile and the words sit under it — so every essential
   names the composition that carries it. Renderers live in Tiles.astro. */
export const TILE_VISUAL = {
  'Answer sheets, marked while you sleep': 'sheets',
  'Next week\u2019s paper, already drafted': 'paper',
  'A copilot at your desk that prepares the class': 'chat',
  'Your school\u2019s shelf, not your own folder': 'library',
  'Homework set, and home already told': 'notify',
  'An office that runs on asking': 'portal',
  'Every section staffed, and covered': 'allot',
  'The register you already keep, recorded': 'register',
  'A new academic year in one move': 'year',
  'The school\u2019s voice to every home': 'notify',
};

/* ---------------------------------------------------------------------------
   THE SCATTER — what the work looks like today, before the argument for the
   product is made. Ramp's "systems that never spoke" move: name the number of
   disconnected places one ordinary task currently touches, and let the reader
   count them. Each tile is a real place a school's work lives right now, and
   the `gap` is what falls through between it and the next one.
   --------------------------------------------------------------------------- */
export const SCATTER = {
  teachers: {
    title: 'Six places, one week',
    lead: 'This is what setting a week of homework and marking one test looks like today.',
    tiles: [
      { name: 'The staffroom WhatsApp group', gap: 'typed again for every section' },
      { name: 'A stack of guides and last year\u2019s papers', gap: 'the paper gets assembled by hand' },
      { name: 'Notes on a personal laptop', gap: 'nobody else in the department sees them' },
      { name: 'Forty answer sheets in a bag', gap: 'read across two evenings, differently by the end' },
      { name: 'A mark list in a notebook', gap: 'never becomes a record of the year' },
      { name: 'The attendance register', gap: 'retyped later, if anyone gets to it' },
    ],
    close: 'None of them know about each other. Every join between them is a teacher\u2019s evening.',
  },
  schools: {
    title: 'Nothing in the building talks to anything else',
    lead: 'This is what starting one academic year looks like today.',
    tiles: [
      { name: 'Last year\u2019s lists, in a spreadsheet', gap: 'rebuilt by hand every June' },
      { name: 'A wall chart of allotments', gap: 'true until the first teacher is absent' },
      { name: 'Registers stacked on the office desk', gap: 'a term of attendance nobody can total' },
      { name: 'Books ordered per department', gap: 'and never reach half the teachers' },
      { name: 'Mark sheets from every section', gap: 'no picture of the school until results day' },
      { name: 'Parents told by whoever remembers', gap: 'or told at the end of term' },
    ],
    close: 'The office spends the year holding the joins together, and the year is never quite visible.',
  },
};

/* ---------------------------------------------------------------------------
   THE ESSENTIALS — five for a teacher, five for a school.
   The founder's brief for these: rank what is scattered today and needed now.
   The test for a place on this list is not "is it a feature" but "plug this
   in and the day is materially better, and the thing they leave the product
   to do stops existing." Each one therefore carries what it replaces
   (`today`) before what it does — the argument is the contrast.
   The full fifteen still live in PRODUCT.groups; this is the front of it.
   --------------------------------------------------------------------------- */
export const ESSENTIALS = [
  {
    who: 'teachers',
    title: 'What a teacher wants',
    lead: 'Five jobs that fill a teaching week and are done by hand tonight.',
    items: [
      {
        tag: 'Evaluation', tint: 'emerald',
        label: 'Answer sheets, marked while you sleep',
        today: 'Today: two evenings, a red pen, and the last ten papers read differently from the first ten.',
        text: 'Photograph the pile after the test. Every answer is scored on your rubric, identically for the fortieth student and the first.',
      },
      {
        tag: 'Question papers', tint: 'violet',
        label: 'Next week’s paper, already drafted',
        today: 'Today: an evening with three guides, last year’s paper and whatever the internet offers.',
        text: 'Pick the chapters, weightage and difficulty. The paper, its blueprint and its answer key come back written for your syllabus.',
      },
      {
        tag: 'Copilot &amp; notes', tint: 'orange',
        label: 'A copilot at your desk that prepares the class',
        today: 'Today: hunting across the internet, gathering, printing, and stacking it by the register.',
        text: 'Ask for the next chapter’s notes in plain language — drafted for your syllabus, rewritten simpler for a weaker section.',
      },
      {
        tag: 'Shared library', tint: 'yellow',
        label: 'Your school’s shelf, not your own folder',
        today: 'Today: the good notes live on one teacher’s laptop and nobody else ever sees them.',
        text: 'Share a note and it reaches everyone on your school’s email, so the next teacher starts from your work, not the internet.',
      },
      {
        tag: 'Homework &amp; home', tint: 'violet',
        label: 'Homework set, and home already told',
        today: 'Today: typing the same message into a WhatsApp group after a full teaching day.',
        text: 'Homework drafted for what you taught today, and every parent notified the moment you assign it.',
      },
    ],
  },
  {
    who: 'schools',
    title: 'What a school wants',
    lead: 'Five things the office does by hand, every year and every day.',
    items: [
      {
        tag: 'Office copilot', tint: 'orange',
        label: 'An office that runs on asking',
        today: 'Today: the work is spread across forms, spreadsheets and the person who knows where things are.',
        text: 'Classes, sections, students and staff in one portal — every module driven by asking, not by finding the right form.',
      },
      {
        tag: 'Allotment', tint: 'emerald',
        label: 'Every section staffed, and covered',
        today: 'Today: a wall chart, a stack of requests, and one person holding the whole timetable in their head.',
        text: 'Who teaches which class and section, worked out for you and changed in plain language when the day changes.',
      },
      {
        tag: 'Attendance', tint: 'yellow',
        label: 'The register you already keep, recorded',
        today: 'Today: paper registers marked in class and retyped by somebody later, if at all.',
        badge: 'Live today',
        text: 'Mark the same paper register you always have, scan it in, and an absence reaches home the day it is read.',
      },
      {
        tag: 'The academic year', tint: 'violet',
        label: 'A new academic year in one move',
        today: 'Today: last year’s lists rebuilt by hand every June, and the year that ended boxed up.',
        text: 'Promote a whole class in one move. The library, the question banks and the records carry forward with it.',
      },
      {
        tag: 'Parent updates', tint: 'emerald',
        label: 'The school’s voice to every home',
        today: 'Today: a teacher types it into a group, or it goes on a noticeboard at the school.',
        text: 'Homework, marks and absences sent by the school itself, to the address you already have — no app, no group message.',
      },
    ],
  },
];

/* A short folder-tab label per feature. The group title cannot do this job on
   a role page — a parent's page showed "At the teacher's desk" on three cards
   in a row — so each feature carries its own noun. */
const TAB = {
  'Answer-sheet evaluation': 'Evaluation',
  'Question papers': 'Question papers',
  'Teaching notes': 'Teaching notes',
  'Homework and assignments': 'Homework',
  'Personal library': 'Your library',
  'Shared library': 'Shared library',
  'Attendance scanning': 'Attendance',
  'Resource planning and allotment': 'Allotment',
  'Admin portal': 'Admin portal',
  'Batch migration': 'The academic year',
  'Subjects and books': 'Subjects & books',
  'Student records': 'Your record',
  'Parent notifications': 'Parent updates',
  'Teacher\u2019s copilot': 'The copilot',
  'Office copilot': 'Office copilot',
};
export function tabFor(f) { return TAB[f.label] || f.groupTitle; }

/* what one person would actually use, in the order the product page tells it */
export function featuresFor(role) {
  return FEATURES.filter(f => f.roles.indexOf(role) > -1);
}
