/* The product page.
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
  h1: ['Everything the paperwork ', 't', 'ouches'],              /* DRAFT */
  sub: 'One licence covering the teacher’s desk, the school office and the people waiting to hear from both.',  /* DRAFT */
  title: 'Paperhint — Complete School Software for Teachers and Schools',
  description: 'Everything in Paperhint: answer-sheet evaluation, question papers, teaching notes, homework, shared libraries, attendance, allotments, the admin portal, student records and parent notifications.',

  /* the one claim that frames all the others */
  opening: 'It works from the paper a school already produces. Day one changes nothing about how the school operates, and exams stay on pen and paper.',

  groups: [
    {
      id: 'desk',
      title: 'At the teacher’s desk',
      lead: 'The work that fills a teacher’s evenings.',
      features: [
        ['Answer-sheet evaluation', 'Photograph answer sheets with the mobile app. Every answer is checked against its question and scored on the teacher’s rubric, the same way for every student. The teacher reviews, adjusts and approves; each result lands on that student’s record.'],
        ['Question papers', 'Pick chapters, weightage and difficulty; the paper, blueprint and answer key are drafted for the syllabus, with the teacher’s notes and subject books tuning every question.'],
        ['Teaching notes', 'Notes drafted for the syllabus, ready to teach with — rewritten simpler for a weaker section, extended with diagrams, edited in a small note editor, or pasted in from the teacher’s own work.'],
        ['Homework and assignments', 'Homework drafted for what was taught today. Parents are notified the moment it’s assigned.'],
        ['Teacher’s copilot', 'A chat interface at the teacher’s desk: prepare notes, work through teaching tasks, ask for what you need in plain language.'],
        ['Personal library', 'Everything a teacher makes or uploads lands in their own repository, private by default.'],
        ['Shared library', 'Share a note and it’s visible to everyone on the school’s email — any class, any department. One teacher’s notes become every teacher’s shelf.'],
      ],
    },
    {
      id: 'office',
      title: 'In the school office',
      lead: 'The lists, the allotments and the year itself.',
      features: [
        ['Attendance scanning', 'Attendance marked on the paper register the school already uses, scanned in; the day’s roll is recorded and absences reach parents. Manual entry works too.', 'Live today'],
        ['Resource planning and allotment', 'Automation works out which teacher is allotted to each class and section, kept in one clean interface, with an office copilot handling changes in plain language.'],
        ['Admin portal', 'Classes, sections, students, teachers and subjects managed in one place, with create, read, update and delete for each module. The office copilot can drive all of it.'],
        ['Batch migration', 'Promote a whole class to the next grade in one move at year end; absorb the fresh batch cleanly.'],
        ['Subjects and books', 'Books and materials attached to each subject flow automatically to every teacher in that department, seeding their libraries and tuning drafted content.'],
      ],
    },
    {
      id: 'classroom',
      title: 'Around the classroom',
      lead: 'What reaches the student and the people at home.',
      features: [
        ['Student records', 'Every evaluation is recorded to the student, exam over exam, building a performance record. Students see their results and the notes shared with them.'],
        ['Parent notifications', 'Parents hear the moment homework is assigned, when marks are shared, and same-day when an absence is read from the attendance sheet.'],
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
          'A screenshot per feature group',
          'Whether the copilot is one product or two (teacher and office)'],
};
