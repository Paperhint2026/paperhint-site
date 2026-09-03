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
  h1: ['Ask for it in plain ', 'l', 'anguage'],                  /* DRAFT */
  sub: 'A copilot at the teacher’s desk and another in the office. Everything below is work you can ask for instead of doing by hand.',  /* DRAFT */
  title: 'Paperhint — Complete School Software for Teachers and Schools',
  description: 'Everything in Paperhint: answer-sheet evaluation, question papers, teaching notes, homework, shared libraries, attendance, allotments, the admin portal, student records and parent notifications.',

  /* the one claim that frames all the others */
  opening: 'It works from the paper a school already produces. Day one changes nothing about how the school operates, and exams stay on pen and paper.',
  openingMore: 'What changes is how the work gets asked for.',

  groups: [
    {
      id: 'copilot',
      title: 'The copilot',
      lead: 'The way the work gets asked for, rather than another place to click.',
      features: [
        ['Teacher’s copilot', 'A chat interface at the teacher’s desk: prepare notes, work through teaching tasks, ask for what you need in plain language. Everything further down this page can be reached by asking for it.', 'Core', ['teachers']],
        ['Office copilot', 'The same thing on the other side of the building. Allotment changes and every module of the admin portal can be driven by asking, in plain language, instead of working through forms.', ['schools']],
      ],
    },
    {
      id: 'desk',
      title: 'At the teacher’s desk',
      lead: 'The work that fills a teacher’s evenings.',
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
      lead: 'The lists, the allotments and the year itself.',
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

  factsTitle: 'What it asks of the school',
  facts: [
    ['Nothing new to buy', 'Runs on a phone and a browser. No scanners, no new hardware.'],
    ['Nothing to change on day one', 'It works from the paper the school already produces.'],
    ['Nothing leaves the school', 'School data is scoped to the school’s account; teacher libraries are private until shared; nothing is visible outside the school’s email.'],
    ['One licence', 'One licence per enrolled student covers admins, teachers, students and parents.'],
  ],

  close: 'A teacher photographs a stack of answer sheets. Everything else on this page follows from that.',  /* DRAFT */

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

/* what one person would actually use, in the order the product page tells it */
export function featuresFor(role) {
  return FEATURES.filter(f => f.roles.indexOf(role) > -1);
}
