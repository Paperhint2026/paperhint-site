# Paperhint, as I understand it

*Synthesized from everything you've told me — read this as my working
model. Anything wrong here will be wrong on the website, so mark it up
freely.*

---

## The essence, in one line

**Paperhint is an AI teaching assistant that reads the paper a school
already produces** — answer sheets, syllabi, attendance sheets, notes —
**and gives teachers back the hours they spend producing and marking it.**

The name carries the thesis: the paper itself starts giving hints.

---

## The shift in perspective

The site I built until today told an ERP story: *"digitise every
resource a school runs on."* Your context flips the centre of gravity:

| | Old story | True story |
|---|---|---|
| Hero of the product | The school's records | **The teacher's evenings** |
| Core verb | *organise* | ***evaluate & create*** |
| AI's role | absent | **the engine** |
| Timetables, academics, calendar | the headline | the supporting cast |

---

## The teacher's loop (the actual product)

Everything primary lives on one flywheel:

```
        ┌──────────────  THE LIBRARY  ──────────────┐
        │   my own notes · references · repository   │
        │   private by default · shareable publicly  │
        └──────┬──────────────────────────▲──────────┘
               │ fuels                     │ enriches
               ▼                           │
   AI CREATES: teaching notes ── question papers ── homework
               │                    │            │
               │ I teach with       │ exam day   │ creation instantly
               ▼                    ▼            ▼ NOTIFIES PARENTS
            the class          students write   parents make it happen
                                    │
                                    ▼
                     📱 MOBILE APP: photograph & upload
                                    │
                                    ▼
        AI EVALUATION: whole PDF analysed, each answer marked
        right/wrong against its question, scored by RUBRIC —
        mechanical, automatic
                                    │
                                    ▼
                    scores & insight, back to the teacher
```

Key properties of the loop:

- **The library is the fuel.** Papers, homework and notes are generated
  from the teacher's *own* material (plus admin-provided subject books) —
  not from a generic model's imagination. That's the productivity claim
  *and* the trust claim.
- **The mobile app is deliberately narrow**: a capture device. Photograph
  answer sheets, upload. (Attendance rides the same gesture — mark the
  paper sheet as always, scan it in; or manage manually in-app.)
- **The rubric is the credibility.** Scoring isn't vibes; it's a rubric
  applied mechanically, the same way for every student.
- **Sharing is a community layer**: a teacher's notes can be published
  for anyone, from any class, to use.

## Teacher's Copilot (the conversational face)

A chat interface where teachers work conversationally — ask for notes,
prepare materials, get help — plus a small note editor to write or paste
notes straight into the library. The copilot is how "AI embedded, not on
the face" feels in practice: a colleague you talk to, not a feature badge.

## The people around the loop

- **Teachers** — the primary user. Evaluate, create, teach, share.
- **Admins / the School portal** — the enablers. They build the school's
  structure: **teacher · classroom · section · student · subject
  management**. Crucially, admins attach subject books/materials to each
  subject, which flow to every teacher in that department — seeding the
  libraries the AI draws from.
- **Parents** — the completion engine. The moment homework is created
  they're notified ("this is what your kid was assigned") — today via a
  WhatsApp-style template, heading toward direct teacher↔parent
  connection. Parents make homework happen at home.
- **Students** — write on paper as they always have; the system reads it.
  They receive scored, rubric-consistent feedback faster.

## Supporting cast

Timetables, academic records, calendar — the school OS. Useful, real,
sellable — but the *reason to buy* is the loop above. Mission framing:
**an application on every desk**, making schools operate more advanced.

---

## Shipping vs. roadmap

Everything in the loop and modules above **ships now**. Evaluations are
recorded per student, so results naturally accumulate exam over exam.
The performance **dashboard** and **intelligent insights** (student and
class views, "focus here" guidance) are the stated direction — not yet
figured out, and deliberately **not promised on the site**. My current
copy claims "mastery analytics" in places; the content pass strips that
down to what ships.

## What this means for the website (pending your go)

1. **Hero** — sub-copy leads with AI evaluation + creation; the "NEW"
   chip announces answer-sheet evaluation. (Open: keep "Run the *w*hole
   school on one page" as the headline, or lead with the evaluation claim?)
2. **Feature cards** — reordered: Evaluation (flagship, with a marked-
   sheet visual) · Question papers · Homework → parent ping · Notes +
   Library · the School portal & modules.
3. **Roles folder** — Teachers become the first tab; Admins reframed as
   the portal that seeds everyone else; Parents copy rewritten around
   homework notifications; Students around faster, fairer scores.
4. **Ribbon words, trust row, chat answers, About letter details, SEO
   metadata** — all re-anchored on evaluation/creation vocabulary
   ("AI answer sheet evaluation", "AI question paper generator").

## Positioning rule

AI-driven, never AI-on-the-face: outcomes lead, AI shows in the details.
The hero stays outcome-led; the word "AI" earns its few appearances.

## Business reality

Garage stage, designer+tech team. Pilot a few contact schools first, then
a silent LinkedIn launch. Pricing unmodelled — needs ≥50% margin over the
full cost base (servers, data, security, onboarding, maintenance) — so
the site keeps pricing in pilot posture, not hard numbers.

## Still open (your calls)

3. Public note-sharing: live at launch, or roadmap?
4. Attendance scanning: LIVE (answered).
