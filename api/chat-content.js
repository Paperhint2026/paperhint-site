/* Authored chat content: the role stories and the follow-up suggestions.
 *
 * This file is the source of truth in the repo, and the fallback. On first
 * read it seeds the chat_stories and chat_followups tables, after which the
 * database is authoritative and the copy can be changed without a deploy.
 * The widget no longer carries any of it — it asks /api/chat-config.
 *
 * Bullets may use <b>, <i>, <em>, <strong> and <br>. The widget strips
 * everything else, so a row in the database cannot inject script even
 * though only staff can write to those tables.
 */

export const STORIES = {
  teacher: {
    chip: 'I’m a teacher',
    ask: 'I’m a teacher — how does Paperhint help me?',
    intro: 'It’s Sunday evening. Forty-odd answer sheets from Friday’s test are still in the bag, tomorrow’s notes aren’t written, and next week’s question paper is a blank page. None of that is teaching — it’s the work around teaching.',
    lead: 'Here’s the same week with Paperhint:',
    bullets: [
      '<b>Monday.</b> You photograph the answer sheets with your phone. Every answer is checked against its question and scored on your rubric — the same way for every student. You read through, adjust what you disagree with, approve.',
      '<b>Tuesday.</b> You ask for notes on the next chapter. They come back drafted for your syllabus — simpler for the weaker section if you ask, with a board-style diagram if you want one.',
      '<b>Wednesday.</b> Homework goes out in a minute, and parents know the moment it’s assigned. No group message to write.',
      '<b>Thursday.</b> Next week’s paper: you pick chapters, weightage and difficulty. Paper, blueprint and answer key come back for your syllabus.',
      '<b>Friday.</b> Attendance is the same paper register you already keep — scanned, not retyped.'
    ],
    close: 'The marks land on each student’s record as you approve them. Nothing goes out without you signing off.'
  },
  admin: {
    chip: 'I run the school office',
    ask: 'I run the school office — what changes for me?',
    intro: 'It’s the week before the new academic year. Last year’s lists have to become this year’s, every section needs a teacher, and last term’s registers are still stacked on the desk.',
    lead: 'What the office stops doing by hand:',
    bullets: [
      '<b>Rolling the year over.</b> A whole class is promoted to the next grade in one move; the year that ended is archived, not lost.',
      '<b>Staffing every section.</b> Allotments — who teaches which class and section — are worked out for you and kept in one place. Cover a period by asking, in plain language.',
      '<b>Subjects and books.</b> Attach a book to a subject once; it reaches every teacher in that department.',
      '<b>Attendance.</b> The paper register the school already uses, scanned in — absences reach parents the same day.',
      '<b>People and structure.</b> Classes, sections, students, teachers and subjects in one portal instead of four spreadsheets.'
    ],
    close: 'Nothing gets migrated by you — we set the school up alongside your office, in one sitting.'
  },
  principal: {
    chip: 'I’m a principal',
    ask: 'I’m a principal — why would my school do this?',
    intro: 'You have bought software before. It was configured in June, fed until August, and quietly abandoned by October — because it asked teachers to do a second job in a second place.',
    lead: 'Paperhint works the other way round:',
    bullets: [
      '<b>It reads the paper you already produce.</b> Answer sheets, attendance registers, written exams. Day one changes nothing about how your school runs.',
      '<b>It gives time back to teachers first.</b> Correction, paper setting and notes — the work that eats their evenings. That’s why it actually gets used.',
      '<b>Exams stay on paper.</b> This isn’t a digital examination portal. You print as you always have.',
      '<b>One licence per student</b> covers admins, teachers, students and parent access — priced with founding schools rather than off a rate card.',
      '<b>Your school shapes it.</b> Founding schools’ ways of working land on the roadmap, and we build custom modules for how you actually run.'
    ],
    close: 'A phone and a browser. No scanners, no new hardware.'
  },
  parent: {
    chip: 'I’m a parent',
    ask: 'I’m a parent — what would I see?',
    intro: 'Most of what you learn about school arrives late — the test that happened last week, the homework you hear about at bedtime, the absence nobody mentioned.',
    lead: 'With Paperhint in the school:',
    bullets: [
      '<b>Homework, when it’s set.</b> You hear the moment a teacher assigns it — not the night before it’s due.',
      '<b>Absences, the same day.</b> Read straight from the attendance sheet, no phone call needed.',
      '<b>Marks, when the teacher shares them.</b> Each evaluation is recorded to your child, exam over exam.',
      '<b>Nothing to install.</b> Updates come to where you already are.'
    ],
    close: 'Paperhint is bought by your school, not by you — if you’d like them to see it, we’re happy to talk to them.'
  }
};

export const FOLLOWUPS = [
  [/evaluat|mark|answer sheet|rubric|correct|grade/i, [
    'What does the teacher approve?', 'Does it use our own rubric?', 'What about handwriting it can’t read?']],
  [/pric|cost|licen|pilot|founding/i, [
    'What does a pilot involve?', 'What’s included per student?', 'Arrange a callback']],
  [/attendance|register/i, [
    'Can we keep the paper register?', 'Do parents hear about absences?']],
  [/note|copilot|librar/i, [
    'Can notes match our syllabus?', 'Who else sees a shared note?', 'Can I paste my own notes?']],
  [/question paper|blueprint|answer key|exam|test/i, [
    'Can I set the weightage?', 'Does it make the answer key?', 'Do we still print papers?']],
  [/parent|notif|whatsapp/i, [
    'What exactly do parents get?', 'Do parents need an app?']],
  [/admin|section|allot|migrat|portal|year/i, [
    'How does year-end rollover work?', 'Who manages the allotments?']],
  [/homework|assign/i, [
    'When do parents hear about it?', 'Can it follow what I taught today?']],
];
export const FOLLOW_DEFAULT = ['How does the marking work?', 'What does it cost?', 'Arrange a callback'];
