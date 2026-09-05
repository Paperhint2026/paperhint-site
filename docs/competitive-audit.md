# MagicSchool, and what our pages should be

*Audit of 5 September 2026, answering the founder's two questions: where do we
overlap with magicschool.ai, which of their numbers could we validate — and
does it make sense that all our pages say the same thing.*

---

## 1. Where we overlap, and where we do not

MagicSchool is a **content-generation suite**: 80+ teacher tools, 50+ student
tools, each one a generator with its own page. Paperhint is a **school
operating system with generation inside it**. The overlap is real but narrow,
and it sits entirely in one column of our loop.

### Same job, both products

| MagicSchool | Paperhint | Notes |
|---|---|---|
| AI lesson plan generator | Teaching notes | They plan the lesson, we prepare what you teach from |
| AI rubric generator | Rubric arrives with the question paper | Theirs is standalone; ours is attached to the paper it will mark |
| AI multiple choice quiz generator | Question papers | Ours carries a blueprint and an answer key for a syllabus |
| AI worksheet generator | Homework and assignments | Ours notifies parents on assign; theirs stops at the file |
| Academic content generator | The copilot | Same idea, different framing |
| Student learning insights | Student records | Theirs is inferred, ours is built from approved marks |
| AI instructional coach | The teacher's copilot | Closest single parallel |

### They have, we do not

- **Presentation generator** — a real gap for a teacher who presents
- **Integrations**: Google Docs, Classroom, Canvas. Their "no new systems"
  claim rests on this
- **Compliance as a product**: SOC 2, FERPA/COPPA, a trust centre, "we don't
  train on student data". Ours is one sentence about school-scoped accounts
- **Professional development, certification courses, a community** — a whole
  adoption apparatus
- **A student product** with its own tools, and family resources

### We have, they do not — this is the whole differentiator

Everything **after** the lesson is planned. MagicSchool's product ends when
the artefact is generated; a teacher still marks by hand, still keeps the
register, and the office still runs on spreadsheets.

- **Answer-sheet evaluation from a phone photo, scored on the teacher's own
  rubric.** They generate the rubric. Nobody marks with it.
- **Attendance from the paper register**, scanned, with absences reaching home
- **The admin portal**: classes, sections, students, staff, subjects
- **Resource planning and allotment** — who teaches which section
- **Year rollover** — promote a batch, carry the library and banks forward
- **Parent notifications** sent by the school automatically
- **A shared school library** where one teacher's notes become the department's

**The line this suggests:** MagicSchool helps a teacher make things.
Paperhint runs the teacher's week and the school's year, and makes things
along the way. Their competitor is a blank page. Ours is the whole stack of
jobs around the teaching.

---

## 2. Their numbers — and why we cannot use them yet

Every figure on their site, on every page:

| Figure | Claim |
|---|---|
| 28% | improvement in students meeting literacy grade-level expectations |
| 7–10 hours | time saved per week, on average |
| 88% | of teachers say it helps them reach every learner |
| 186% | (on the principals page) |
| 21% / 47% / 98% / 50% | survey figures repeated site-wide |
| 80+ / 50+ | teacher tools / student tools |
| "#1 AI platform for education" | positioning claim |

**We can validate none of these today, and we should not publish a single one
of them.** They come from surveys and studies of an existing user base.
Paperhint has no users yet. Borrowing the *form* of the row — which is exactly
what my "15 things it already does / 0 new hardware" row did — produces
sentences pretending to be statistics, and the founder was right to kill it.

**What to do instead.** Design the slots and fill them from the first pilot.
The four worth instrumenting from day one, because they are the ones a school
will ask about:

1. **Hours returned per teacher per week** — their 7–10 is the number to beat,
   and answer-sheet evaluation should beat it on its own
2. **Answer sheets marked, and how many the teacher changed** — the second
   half is the trust number, and it is ours alone to claim
3. **Share of parents reached on the day** vs. the group message
4. **Papers set per teacher per term** before and after

Until a pilot produces them, the honest substitute is **scope stated in
words**, which is what /product now does.

---

## 3. "All pages have the same content" — the audit

**Partly a real problem, partly not.** Worth separating.

### Not a problem: repetition is normal

MagicSchool's own pages repeat heavily. Measured across five of their pages,
these blocks are identical on all of them: "Safe, secure AI for schools", the
whole stat set, "Your questions, answered", "Get started with MagicSchool",
the community section. On /tools/rubric-generator they even left "Why
classrooms love our AI for **students**" in place — a copy-paste slip on a
teacher page.

Only the **top third** of their pages differs: the h1 and the first one or two
sections. Trust, proof, FAQ and CTA are deliberately the same everywhere.
So our shared CTA band and shared narrative are fine.

### The real problem: we segmented by USER, they segment by JOB

Their axes:

| Axis | Their pages | Question it answers |
|---|---|---|
| **Buyer** | superintendents, chief academic officers, chief technology officers, principals | "will this survive my objection?" |
| **Outcome** | privacy & security, student success, AI literacy, integrate quickly, AI readiness | "why you?" |
| **Tool** | /tools/lesson-plan, /tools/rubric-generator, /tools/worksheet-generator … | search demand |

Ours: /teachers, /schools, /students, /parents. That is one axis, and two of
the four are people who **neither buy nor search**. Nobody googles "software
that tells me my child's homework". Those two pages exist for completeness,
which is exactly why they read as thin repeats of /product with a different
h1 — my own note last commit was that they "touch too little of the product
to rank five", which was the symptom, not the diagnosis.

### What I would plan

**Keep two role pages.** /teachers (the champion who feels the pain) and
/schools (the buyer who signs). These earn their place.

**Demote /students and /parents.** They are proof that the product reaches the
whole school, not destinations. Fold them into /product as two sections, keep
the URLs alive in the footer, out of the main nav. Neither has search demand
and neither ends in a decision.

**Add the axis we are missing: tool pages.** This is MagicSchool's search
engine and our largest gap. An Indian teacher searches for the artefact, not
the platform:

- `/tools/answer-sheet-evaluation` — nothing of theirs competes here
- `/tools/question-paper-generator` — with blueprint and answer key
- `/tools/teaching-notes`
- `/tools/homework-generator`
- `/tools/rubric-generator` — head-to-head with them
- `/tools/attendance-scanning`

Each one page, each answering one search, each ending at the same demo ask.
They are also the honest kind of page for us right now: a tool page describes
a capability, and every one of those capabilities ships today.

**Add the outcome axis later**, once there is a pilot to point at. It is a
"why us" argument, and "why us" needs evidence we do not yet have.

### Priority

1. Tool pages — new demand, no new claims needed
2. Demote students/parents out of the nav — removes the sameness
3. Compliance and data-handling copy — their strongest page, our thinnest
   sentence, and it is the first thing a school asks
4. Outcome pages, after the first pilot's numbers exist
