# Paperhint — the module map, and how it hangs together

*Converted from `paperhint-modules.pdf` (dev handoff, 3 Sept 2026) so it is
searchable and versioned. Status tags are the founder's, verified against the
live app: **DONE** live today · **TWEAK** built, needs change · **MOVE** built,
wrong place · **BUILD** not started.*

## The one line, from the handoff

> An AI ecosystem that makes the whole school work faster — an assistant for
> every role, so teachers teach more and offices run themselves. Two roles
> today (Teacher, Admin); the destination is the digital school.

---

## The correlation: it is a loop, not a list

The modules are not a feature grid. They are one cycle that turns every day,
and each turn leaves data behind that makes the next turn better.

```
   PLAN                    TEACH                   PREPARE
   A1 Academic year        T1 My Schedule          T10 Knowledge (sources)
   A2 School Calendar  →   T7 Recap Card       →   T9  Teaching Notes
   A3 Timetable            T8 Attendance           T13 Question Papers
   A8 Allotments           T4 PERIOD LOG           T12 Homework
        ↑                       │                       │
        │                       ▼                       ▼
   SEE  │                  MEASURE                  ASSESS
   A14 KPI Dashboard  ←    T5 Syllabus Tracker  ←   T14 Grading
   A13 Report Cards        T6 Teacher KPI           T15 Results
```

**T4 Period Log is the spine.** The founder's own note says so, and the
dependency graph proves it: T5, T6, T7, T12 and P2-1 all read from it, and A14
aggregates it school-wide. A teacher saying what she covered is the single
input that makes the syllabus tracker tick, the recap card write itself, the
homework know what was taught today, her KPI exist, and the school's dashboard
mean anything.

**Three chains worth naming:**

1. **The day chain.** A2 → A3 → T1 → (T7 recap, T8 attendance) → T4 log.
   Nothing in the teaching day works until the calendar and timetable exist —
   which is why A2 and A3 unlock T1, T2, T4 and A10 all at once.
2. **The paper chain.** T10 sources → T9 notes / T13 papers → T14 grading →
   T15 results → A13 report cards → A14 dashboard. This chain is almost
   entirely built already.
3. **The people chain.** A8 allotments → A3 timetable → T2 period exchange →
   A10 office cover. Borrowing a period, going on leave and finding cover are
   one mechanism seen from two sides.

**The flywheel:** logs → KPIs → the dashboard the office plans from → next
term's calendar and allotments. The school gets better at running itself
because teaching left a trace.

---

## Where the AI sits — and why it is not a feature

Ask Hint appears twice in the list (T3 teacher, A16 office) but that
understates it. It is three different things at once:

**1. The interface.** A16's examples — *"move Ramya to 7B"*, *"who can cover
8A Science on Friday?"* — are admin modules driven in plain language. The
founder's note is "wire it to each admin action as it lands". The assistant is
how modules are operated, not a module beside them.

**2. The capture device — the important one.** T4's note: the period log is
captured *through* Ask Hint chat, "never as loose chat" but as a structured
record. So the assistant is how the school's most valuable data gets created.
A teacher will not fill in a form after every period. She will tell someone
how it went. That difference is the entire reason the flywheel can turn.

**3. The engine.** T9 notes, T13 papers and T14 grading are generated work.
P2-3 remedial "can begin as an Ask Hint capability" — new capabilities can
ship inside the assistant before they earn a screen.

**So the pitch shape is:** the assistant runs the school's day, and everything
else is the surface it acts on. Not "Paperhint has an AI assistant".

---

## What is shipped, and what is not

This matters for the website more than anything else in the document.

**Live today (DONE/TWEAK):** Ask Hint both sides · Knowledge sources · personal
and shared libraries · teaching notes (through chat) · homework and assignments
· question papers · grading · results · attendance (mobile scan) and its
oversight · classes and sections · subjects and books · students · teachers ·
allotments · school setup.

**Ships by first onboarding (BUILD):** My Schedule · Period Exchange ·
**Period Log** · Syllabus Tracker · Teacher KPI · Recap Card · School Calendar
· **Timetable** · Leave & Substitution · **Notifications & Circulars** · Exam
Manager · **Report Cards** · **Reports & KPI Dashboard** · batch migration
flow. *Founder, 2026-09-05: everything in this column is live by the time the
first school is onboarded, so the site may show it as the product.*

**Phase 2 — after the core day loop, NOT shown on the site:** P2-1 Classwork /
Quick Quiz · P2-2 PTM One-pager · P2-3 Remedial Follow-up.

Two observations:

- The **paper chain is real today**; the **day chain barely exists**. The
  product a school can use this term is: prepare, set, mark, record. The
  timetable, the log and the dashboard are the next build.
- Several things the site currently implies are in the BUILD column — see the
  honesty note in `docs/positioning.md`.

## Future roles — direction, not build

Committee member (syllabus structure, rubrics, teaching methods) · student
portal (an AI study companion over the student's own notes and logs) · parent
portal (beyond notifications). Everything built now should let these plug into
the same data later. That is the digital school.
