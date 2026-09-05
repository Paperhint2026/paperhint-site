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
    /* The grand intro: the whole case for this role in two moves — what a
       week actually contains, then what Paperhint is inside it. It replaces
       the old scene + Monday-to-Friday beats, which read as a diary. */
    intro: {
      statement: 'A teaching week has about six hours of teaching in it, and a great deal else.',
      turn: 'Now the else is already done when you get there.',
      answer: 'Notes for the next chapter. A paper to set. Forty answer sheets in a bag. A register to record, homework to follow up, parents to tell. Paperhint is an assistant at your desk that carries all of it alongside you — so the hours in front of a class are the ones you spend preparing for.',
    },
    needs: ['Headline and standfirst', 'Closing line', 'A product screenshot per beat',
            'A quote from a real teacher, for this page'],
    cta: { heading: 'Let’s give your teachers their week back',
           sub: 'Tell us how a teaching week runs in your school today, and we’ll show you the same week running in Paperhint.' },
    nav: 'Teachers',
    kicker: 'FOR TEACHERS',
    h1: ['Walk in ready. Every ', 'c', 'lass.'],                /* DRAFT */
    sub: 'An assistant at your desk that prepares the next class, marks to your rubric and follows through with home — so the hours go to teaching.',  /* DRAFT */
    title: 'Paperhint for Teachers — An Assistant at Your Desk',
    description: 'What a teacher gets from Paperhint: attendance recorded, notes and papers prepared for your syllabus, answer sheets marked to your rubric, homework followed through to parents — so the hours go to teaching.',
    stopsTitle: 'What is ready when you get there',
    stops: [
      ['A class you can walk into', 'Notes for the next chapter, drafted for your syllabus and ready to teach with — simpler for a weaker section, or extended with a diagram, if you ask.'],
      ['Next week\u2019s paper, set', 'Pick chapters, weightage and difficulty. Paper, blueprint and answer key come back drafted for your syllabus.'],
      ['Every sheet marked the same way', 'Each answer checked against its question and scored on your rubric, identically for every student. You review and approve.'],
      ['A record that builds itself', 'Every result recorded to the student, exam over exam, so a class’s history is one grid rather than a stack of mark lists.'],
      ['Home already told', 'Homework reaches parents the moment it is set, and an absence the same day it is read from the register.'],
    ],
    /* the 4-up divided row, Amplemarket's "and more" shelf. Direction only —
       no dates, and it must never read as available. */
    soon: [
      ['Your timetable', 'The day\u2019s periods in front of you, with a nudge before each class.'],
      ['Cover and swap', 'Borrow a period from another teacher, or cover one, by asking.'],
      ['The period log', 'Say how the class went; the recap writes itself and the portion is tracked.'],
      ['The syllabus tracker', 'How much of the portion is actually covered, per class, as you go.'],
    ],
    keepsTitle: 'What stays yours',
    keeps: [
      'Nothing is final until you approve it. Every mark passes your desk.',
      'Your library is private until you choose to share it.',
      'Exams stay on pen and paper. You print as you always have.',
      'Anything it cannot read confidently is flagged for you, not guessed.',
      'Being built next: your own timetable with a nudge before each class, borrowing and covering periods, and a log of each session that writes your recap and tracks the portion.',
    ],
    close: 'Everything above is one assistant, at the desk you already work at. A phone and a browser, nothing to migrate.',
  },

  schools: {
    story: 'admin',
    intro: {
      statement: 'A school year is assembled by hand every June, and held together by memory for the ten months after it.',
      turn: 'Now the year runs, and the office plans it.',
      answer: 'Last year\u2019s lists become this year\u2019s. Every section needs a teacher. Books have to reach the right departments, registers have to be kept, and every message home is typed by somebody. Paperhint runs the structure, the staffing and the follow-through from one place \u2014 so the office plans the year instead of assembling it.',
    },
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
    h1: ['Run the school, not the ', 's', 'preadsheet'],        /* DRAFT */
    sub: 'Classes, sections, students, teachers and who teaches what — set up once and run from one place, with an assistant to drive it in plain language.',  /* DRAFT */
    title: 'Paperhint for Schools — Run the Year From One Place',
    description: 'What the school office gets from Paperhint: classes and sections set up once, allotments worked out for you, the year migrated in one move, notifications home configured rather than typed, and every class and mark sheet in one picture.',
    stopsTitle: 'What the office can run from here',
    stops: [
      ['Every section staffed', 'Who teaches which subject in which section, assigned and swapped on one board, with staffing gaps flagged before term starts.'],
      ['One place for everyone', 'Classes and sections with their subject sets, the student directory with admissions and transfers, and the staff directory — together rather than in four files.'],
      ['The day’s roll, already in', 'The register the school already keeps, scanned rather than keyed in, with absences out to parents the same day and missing registers visible to you.'],
      ['One shelf for the whole school', 'Subjects, books and materials curated once, flowing to every teacher in that department and seeding what they draft from.'],
      ['An office that answers back', 'Ask for the change in plain language — move a student to another section, find who teaches what — instead of working through forms.'],
      ['Home told automatically', 'Homework, marks and same-day absences reach parents off the back of the work itself, not a message typed into a group.'],
    ],
    soon: [
      ['School calendar', 'The year\u2019s terms, holidays and events in one place.'],
      ['Timetable', 'Build the timetable for every class and section, and change it mid-term.'],
      ['Period cover', 'Reallot a period when a teacher is away, without rebuilding the grid.'],
      ['The school dashboard', 'Every class logged and every mark sheet monitored, in one view.'],
    ],
    keepsTitle: 'What we do, not you',
    keeps: [
      'We set the school up alongside your office, in one sitting. Nothing gets migrated by you.',
      'School data is scoped to your account, and nothing is visible outside your school’s email.',
      'One licence per enrolled student covers admins, teachers, students and parents.',
      'Founding schools’ ways of working land on the roadmap, and we build custom modules for how you actually run.',
      'Being built next: the school calendar and timetable, period cover, term report cards, and one dashboard for how the school is doing.',
    ],
    close: 'Two roles today, teachers and the office. It is being built toward a school that runs end to end in one place.',
  },

  parents: {
    story: 'parent',
    intro: {
      statement: 'You usually hear about school late \u2014 the test after it happened, the homework once it is already overdue.',
      turn: 'Now you hear on the day it happens.',
      answer: 'The noticeboard is at the school. The group message arrives when a teacher finds a moment to write it. Paperhint sends it from the school itself, on the day: homework the moment it is set, an absence the day the register is read, marks when the teacher has checked and shared them.',
    },
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
    description: 'What parents get from Paperhint: homework the moment it is assigned, marks when the teacher shares them, and an absence the same day — sent by the school automatically, not typed into a group.',
    stopsTitle: 'What reaches you, and when',
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
    intro: {
      statement: 'A paper comes back with a number in red at the top, and the number is all it tells you.',
      turn: 'Now the paper tells you what actually happened.',
      answer: 'Not which questions cost you the marks, not whether the person beside you was read the same way, not whether the thing you got wrong is the thing you got wrong last term. Paperhint scores every answer against the same rubric for the whole class, a teacher approves it, and the result joins a record that builds exam over exam.',
    },
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
