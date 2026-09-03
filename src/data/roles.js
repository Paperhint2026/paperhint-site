/* The role pages.
 *
 * The narrative itself is NOT duplicated here: scene, turn and chapters are
 * read from api/chat-content.js, the same approved copy the chat panel tells.
 * Change a story there and both the panel and the page change together.
 *
 * What this file adds is the page around the story — the headline, what the
 * role stops doing, what stays theirs, and the SEO metadata. Every claim in
 * it comes from docs/feature-list.md. Nothing here promises anything that
 * isn't shipped.
 *
 * The founder's own application narrative replaces `h1`, `sub` and `close`
 * when it lands; they are marked DRAFT so they are easy to find.
 */

import { STORIES } from '../../api/chat-content.js';

/* '<b>Monday.</b> You photograph…' → { label: 'Monday.', text: 'You photograph…' } */
function beats(bullets) {
  return (bullets || []).map(b => {
    const m = String(b).match(/^<b>(.*?)<\/b>\s*(.*)$/);
    return m ? { label: m[1], text: m[2] } : { label: null, text: String(b) };
  });
}

const PAGES = {
  teachers: {
    story: 'teacher',
    needs: ['Headline and standfirst', 'Closing line', 'A product screenshot per beat',
            'A quote from a real teacher, for this page'],
    cta: { heading: 'Let’s take the marking off your desk',
           sub: 'Tell us how correction works in your school today, and we’ll show you the same class running in Paperhint.' },
    nav: 'Teachers',
    kicker: 'FOR TEACHERS',
    h1: ['The week, without the ', 'p', 'aperwork'],           /* DRAFT */
    sub: 'Correction, question papers, notes and homework — the work that fills your evenings, done by Friday afternoon.',  /* DRAFT */
    title: 'Paperhint for Teachers — Marking, Question Papers and Notes',
    description: 'How Paperhint works at a teacher’s desk: answer sheets marked to your rubric, question papers and notes drafted for your syllabus, homework that reaches parents on its own.',
    stopsTitle: 'What leaves your evenings',
    stops: [
      ['Marking a class by hand', 'Every answer is checked against its question and scored on your rubric, the same way for every student. You review and approve.'],
      ['Writing the paper from scratch', 'Pick chapters, weightage and difficulty. Paper, blueprint and answer key come back drafted for your syllabus.'],
      ['Starting notes on a blank page', 'Notes drafted for the syllabus, ready to teach with. Simpler for a weaker section, or extended with a diagram.'],
      ['Chasing parents about homework', 'They are told the moment it is assigned. No group message to write.'],
      ['Retyping the attendance register', 'The paper register you already keep, scanned rather than keyed in.'],
    ],
    keepsTitle: 'What stays yours',
    keeps: [
      'Nothing is final until you approve it. Every mark passes your desk.',
      'Your library is private until you choose to share it.',
      'Exams stay on pen and paper. You print as you always have.',
      'Anything it cannot read confidently is flagged for you, not guessed.',
    ],
    close: 'A phone and a browser. No scanners, no new hardware, and nothing to migrate.',
  },

  schools: {
    story: 'admin',
    needs: ['Headline and standfirst', 'Closing line',
            'A screenshot of the allotment board and the admin portal',
            'A quote from a real school office or principal, for this page'],
    cta: { heading: 'We set the school up alongside your office',
           sub: 'Tell us how your year runs today, and we’ll show you the same year in Paperhint. Nothing gets migrated by you.' },
    second: 'principal',                       /* the case for the school, below */
    /* A principal is not a separate product and has no interface of their
       own: the same portal, with permissions between a teacher's and the
       office's. Said plainly here so the page never implies otherwise. */
    secondTitle: 'From the principal’s desk',
    secondNote: 'There is no separate principal interface. It is the same portal a teacher and the office use, with permissions that sit between the two.',
    nav: 'Schools',
    kicker: 'FOR SCHOOLS',
    h1: ['The office stops ', 'k', 'eying things in'],          /* DRAFT */
    sub: 'Allotments, rollover, attendance and records in one portal, and a licence that covers everyone in the building.',  /* DRAFT */
    title: 'Paperhint for Schools — Admin Portal, Allotments and Attendance',
    description: 'How Paperhint works in the school office: teacher allotments worked out for you, year-end rollover in one move, attendance from the paper register, and classes, sections and students in one portal.',
    stopsTitle: 'What the office stops doing by hand',
    stops: [
      ['Rebuilding the year in spreadsheets', 'A whole class is promoted in one move at year end. The year that ended is archived, not lost.'],
      ['Working out who teaches what', 'Allotments are proposed for you and kept on one board. Cover a period by asking, in plain language.'],
      ['Sending books round the department', 'Attach a book to a subject once and it reaches every teacher who teaches it.'],
      ['Keying in the attendance register', 'The register the school already uses, scanned. Absences reach parents the same day.'],
      ['Keeping four lists of the same people', 'Classes, sections, students, teachers and subjects in one portal.'],
    ],
    keepsTitle: 'What we do, not you',
    keeps: [
      'We set the school up alongside your office, in one sitting. Nothing gets migrated by you.',
      'School data is scoped to your account, and nothing is visible outside your school’s email.',
      'One licence per enrolled student covers admins, teachers, students and parents.',
      'Founding schools’ ways of working land on the roadmap, and we build custom modules for how you actually run.',
    ],
    close: 'Day one changes nothing about how your school operates. It starts from the paper you already produce.',
  },

  parents: {
    story: 'parent',
    needs: ['Headline and standfirst', 'Closing line',
            'An example of what a parent actually receives',
            'A quote from a real parent, for this page'],
    cta: { heading: 'Ask your school about Paperhint',
           sub: 'If you would rather hear from school on the day than at the end of term, this is the page to send them.' },
    nav: 'Parents',
    kicker: 'FOR PARENTS',
    h1: ['You hear it the ', 'd', 'ay it happens'],             /* DRAFT */
    sub: 'Homework, marks and absences reach you from the school, on the day, without you asking.',  /* DRAFT */
    title: 'Paperhint for Parents — Homework, Marks and Attendance Updates',
    description: 'What parents get from Paperhint: homework the moment it is assigned, marks when the teacher shares them, and an absence the same day it is read from the register.',
    stopsTitle: 'What reaches you',
    stops: [
      ['Homework', 'The moment it is assigned, not the evening it is due.'],
      ['Marks', 'When the teacher has checked and shared them.'],
      ['Absences', 'The same day, read from the attendance register.'],
    ],
    keepsTitle: 'What it is not',
    keeps: [
      'There is no app to install. It reaches you where the school already writes to you.',
      'It is the school’s teachers sharing their own work, not a scoreboard.',
      'Nothing about your child is visible outside the school.',
    ],
    close: 'The teacher decides what is shared and when. Paperhint only carries it.',
  },

  students: {
    story: null,                               /* no approved narrative yet */
    nav: 'Students',
    kicker: 'FOR STUDENTS',
    h1: ['Your work, ', 'r', 'ecorded properly'],               /* DRAFT */
    sub: 'Every paper you sit is marked the same way as everyone else’s, approved by your teacher, and kept on a record that builds across the year.',  /* DRAFT */
    title: 'Paperhint for Students — Results, Records and Shared Notes',
    description: 'What students get from Paperhint: every paper marked on the same rubric, approved by a teacher before it reaches them, a record that builds exam over exam, and the notes their teachers share.',
    needs: ['The real narrative — this one is a stand-in', 'Headline and standfirst',
            'What a student actually sees on their record', 'Whether students get their own login',
            'A quote from a real student, for this page'],

    /* DRAFT. Stand-in narrative, written to be replaced. Every sentence is
       held to docs/feature-list.md: marking on the teacher's rubric, the
       teacher's approval, the record built exam over exam, notes shared with
       the class, exams staying on paper, and unreadable answers being flagged
       rather than guessed. Nothing here claims a student sees homework or
       attendance, because the feature list does not say they do. */
    scene: 'A paper comes back with a number in red at the top. It does not tell you which questions cost you the marks, whether the person next to you was marked the same way, or whether the thing you got wrong is the same thing you got wrong last term.',
    turn: 'What changes on your side of the desk:',
    beats: [
      { label: 'The paper you sit does not change.',
        text: 'Same hall, same pen, same paper. Exams stay exactly as they are — nothing about how you sit them is different.' },
      { label: 'Everyone is marked the same way.',
        text: 'Each answer is checked against its own question and scored on your teacher’s rubric, applied the same way across the whole class. Not the first ten papers one way and the last ten at eleven at night.' },
      { label: 'Anything unclear goes to your teacher.',
        text: 'Handwriting it cannot read confidently is flagged for a person to look at rather than guessed at. Nobody loses a mark to a bad scan.' },
      { label: 'A teacher still decides.',
        text: 'Your teacher reads through, changes anything they disagree with, and approves it. No mark reaches you that a teacher has not signed off.' },
      { label: 'It goes on your record.',
        text: 'Every evaluation is recorded to you, exam over exam, so a subject builds into a picture across the year instead of a stack of loose papers in a bag.' },
    ],
    stopsTitle: 'What you can look at',
    stops: [
      ['Your results', 'Each evaluation once your teacher has checked and approved it.'],
      ['The same subject over time', 'Exam over exam, rather than one paper at a time.'],
      ['Notes your teachers shared', 'Whatever they chose to share with your class, in the same place as your results.'],
    ],
    keepsTitle: 'Worth being clear about',
    keeps: [
      'Nothing reaches you until your teacher has reviewed and approved it.',
      'Exams stay on pen and paper. Nothing changes about how you sit them.',
      'Anything the marking cannot read confidently is flagged for your teacher, never guessed.',
      'Your record sits inside your school’s account and is not visible outside it.',
    ],
    close: 'A marked paper stops being a number in red and starts being a record you can actually read.',  /* DRAFT */
    cta: { heading: 'Show this to your school',
           sub: 'If your teachers are still carrying answer sheets home at the weekend, send them this page.' },
  },
};

/* The page and the story, resolved into one object the template can render. */
export const ROLES = Object.fromEntries(Object.entries(PAGES).map(([key, page]) => {
  const s = page.story ? STORIES[page.story] : null;
  const second = page.second ? STORIES[page.second] : null;
  return [key, {
    key,
    ...page,
    scene: page.scene || (s && s.intro) || '',
    turn: page.turn || (s && s.lead) || '',
    beats: page.beats || beats(s && s.bullets),
    storyClose: s && s.close,
    second: second ? {
      intro: second.intro,
      lead: second.lead,
      beats: beats(second.bullets),
      close: second.close,
    } : null,
  }];
}));

export const ORDER = ['teachers', 'schools', 'students', 'parents'];
