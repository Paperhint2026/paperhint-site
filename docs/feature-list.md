# Paperhint — feature list
Plain titles + descriptions of everything in the product as discussed
(source of truth: docs/product-brief.md). Voice: outcome-led, AI in the
details, no roadmap promises.

## At the teacher's desk

**Answer-sheet evaluation** — Photograph answer sheets with the mobile
app. Every answer is checked against its question and scored on the
teacher's rubric, the same way for every student. The teacher reviews,
adjusts and approves; each result lands on that student's record.

**Question papers** — Pick chapters, weightage and difficulty; the
paper, blueprint and answer key are drafted for the syllabus, with the
teacher's notes and subject books tuning every question.

**Homework & assignments** — Homework drafted for what was taught
today. Parents are notified the moment it's assigned.

**Teaching notes** — Notes drafted for the syllabus, ready to teach
with — rewritten simpler for a weaker section, extended with diagrams,
edited in a small note editor, or pasted in from the teacher's own work.

**Teacher's copilot** — A chat interface at the teacher's desk: prepare
notes, work through teaching tasks, ask for what you need in plain
language.

**Personal library** — Everything a teacher makes or uploads lands in
their own repository, private by default.

**Shared library** — Share a note and it's visible to everyone on the
school's email — any class, any department. One teacher's notes become
every teacher's shelf.

## In the school office

**Attendance scanning** — Attendance marked on the paper register the
school already uses, scanned in; the day's roll is recorded and
absences reach parents. Manual entry works too. (Live today.)

**Resource planning & allotment** — Automation works out which teacher
is allotted to each class and section, kept in one clean interface,
with an office copilot handling changes in plain language.

**Admin portal** — Classes, sections, students, teachers and subjects
managed in one place ("model base management"). Full CRUD per module,
with the office copilot able to drive any of it conversationally:

- **Teachers** —
  *Create*: add a teacher with school email, department and subjects;
  their library is seeded from the department's subject books.
  *Read*: staff directory; a teacher's profile shows their allotments,
  subjects and shared-library contributions.
  *Update*: change department, subjects or allotments; reset access.
  *Delete*: deactivate on exit — their allotments free up for
  re-allotment, their shared notes stay on the school shelf.
- **Classes (grades)** —
  *Create*: open a grade/classroom with its subject set.
  *Read*: class overview — sections, strength, subjects, teachers.
  *Update*: reconfigure subjects or structure mid-year.
  *Delete*: archive at year end; batch migration promotes the whole
  class to the next grade in one move.
- **Sections** —
  *Create*: add sections under a class (VI-A, VI-B, …).
  *Read*: section roster with its allotted teachers and timetable slot.
  *Update*: move students between sections; swap the allotted teacher.
  *Delete*: merge or close a section, students reassigned first.
- **Students** —
  *Create*: admit a student — roll number, section, parent contacts.
  *Read*: student profile — evaluations exam over exam, attendance,
  homework trail.
  *Update*: section changes, corrections, parent contact updates.
  *Delete*: transfer out — the academic record is archived, not lost.
- **Subjects & books** —
  *Create*: add a subject to a class and attach its books/materials;
  they flow to every department teacher's library.
  *Read*: see which departments and teachers a subject serves.
  *Update*: swap in a new edition — libraries pick it up.
  *Delete*: retire a subject at year rollover.
- **Allotments (resource planning)** —
  *Create*: automation proposes teacher-to-class/section allotments;
  the office confirms.
  *Read*: one allotment board — who teaches what, where, when.
  *Update*: swaps and period covers, by hand or by asking the copilot.
  *Delete*: release an allotment when a teacher or section changes.

**Batch migration** — Promote a whole class to the next grade in one
move at year end; absorb the fresh batch cleanly.

**Subjects & books** — Books and materials attached to each subject
flow automatically to every teacher in that department, seeding their
libraries and tuning drafted content.

## Around the classroom

**Student records** — Every evaluation is recorded to the student,
exam over exam, building a performance record. Students see their
results and the notes shared with them.

**Parent notifications** — Parents hear the moment homework is
assigned, when marks are shared, and same-day when an absence is read
from the attendance sheet.

## Platform facts (not features, but part of the pitch)

- Runs on a phone and a browser — no scanners, no new hardware.
- Works from the paper the school already produces; day one changes
  nothing about how the school operates.
- School data is scoped to the school's account; teacher libraries are
  private until shared; nothing visible outside the school's email.
- One licence per enrolled student covers admins, teachers, students
  and parents.

## Deliberately NOT promised (roadmap)
- Analytics dashboards / performance insights
- Tuition-lite version
