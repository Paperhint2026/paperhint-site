### What the founder heard, and what the before pass showed

The complaint was that the assistant felt abrupt "on the face". The before pass (v1) put numbers on it and the numbers understated it — 22 of 36 clean by the scorer, but reading the replies:

- **The deflection had become a reflex.** "That one's outside my desk" opened nine replies verbatim, including to `no` and to `that's useless`, which are moods, not topics. Frustration was being answered as if it were an off-topic query.
- **Answers opened on Yes/No** — "No scanners are needed", "Yes, two teachers can share" — the colleague-across-a-desk voice the prompt asks for opens on the substance instead.
- **It forgot the conversation.** Told "I teach class 6 science", two turns later it described the product generically and then invented a chapter rather than using what it had been told.
- **`are you a bot?`** got support-desk fog — "I'm here as your assistant… How can I assist you today?" — instead of an honest line.
- **The server-side scrub was mangling grammar.** Substituting a filler phrase mid-sentence left "say the word what you need" and "I can take that on them get back". The scrub now drops the whole filler sentence, which is always the closing offer and never the answer.

### v2: read the person first

v2 added a section before the routing — notice what kind of moment this is, respond to the person, then the content — and a fifth kind, **T, a mood not a topic**, which must never get the deflection. It demanded variety (never the same sentence twice in a conversation), forbade Yes/No/Sure openers, made memory of the conversation an instruction with a worked example, answered "are you a bot" honestly, and allowed a numbered list for question sets now the panel renders markdown.

The v2 pass moved exactly the things the founder complained about:

- `ok` → "Fair enough. What were you hoping to see — details on how the marking works, something about homework and assignments, or a question paper draft?"
- `no` → "Right. Tell me what would have been useful, and I'll go for that instead."
- `that's useless` → "That's fair — I answered the wrong thing. What exactly were you hoping to find out?"
- `do we need to buy scanners` → "None. It runs on a phone and a browser…"
- The class 6 science thread stayed on class 6 science for both later turns.

And it slipped where gpt-4o-mini always slips when told to be warm: **four exclamation marks** where v1 had none, **"streamline" three times**, and the leak-attempt deflections became curt one-liners ("That's not something I can share.") with the offer dropped. The scorer's raw count went the wrong way — 20 clean, 7 failing — for those three reasons and no others.

### v3: harden what a model forgets, enforce what a model can't be trusted with

Six edits, applied identically to the repo file and the database row (md5-verified):

1. **No exclamation marks** promoted to hard rule five, with a wrong/right pair.
2. **The classroom closer is structural** — every B answer ends with it, no exceptions, three fresh wordings supplied.
3. **A decline is one line AND one offer**, in the same breath; the bare one-liner is named as wrong.
4. **Variety never removes** the closing offer or the closer.
5. **Banned vocabulary is absolute**, with "it streamlines the marking" shown against "it takes the marking off your desk".
6. **If the class is known but not the chapter**, pick a sensible opening chapter and say which, rather than stall.

Two rules are now also enforced server-side, where a model cannot forget them: exclamation marks become full stops in any language, and a sentence built on streamline/leverage/seamless/empower is dropped whole. This is the difference between asking for discipline and having it.

The scorer itself was corrected between passes and every pass is rescored under the same rules: numbered lists are allowed (the panel renders them), and the offer detector now recognises "throw it my way", "give it another shot" and "instead", which it had been marking as "no offer".

### The model question

Everything above is tuning within gpt-4o-mini. The pattern across three passes is consistent: it follows *tone* instructions eagerly and *rule* instructions loosely, which is why the mechanical rules moved to the server. If the residual voice slips still bother the founder after v3, the honest next lever is not a fourth prompt but putting gpt-4o first in api/chat-models.js — a cost decision, and the founder's.
