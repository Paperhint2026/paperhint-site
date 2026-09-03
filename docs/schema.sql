-- Paperhint — the whole database.
--
-- Safe to run more than once. Every table has RLS enabled with no policies,
-- deliberately: the browser key reaches nothing, and the site reads and
-- writes with the service role key, which bypasses RLS and lives only in
-- Vercel's environment. Supabase's linter reports that as INFO; it is the
-- design, not an oversight.
--
--   SUPABASE_URL
--   SUPABASE_SERVICE_ROLE_KEY     server-only, never shipped to a browser

-- ---------------------------------------------------------------- events
-- One row per event: a question asked in the chat panel, a callback request,
-- a contact form enquiry, or a fault the site reported about itself.
--
-- A few fields are lifted into columns so they can be indexed and queried.
-- The whole event is also kept in `data`, so nothing is lost to a schema that
-- has moved on and new fields need no migration.

create table if not exists public.enquiry_events (
  id       bigint generated always as identity primary key,
  at       timestamptz not null default now(),
  kind     text        not null,      -- question | callback | contact | bug
  sid      text,                      -- visit id, ties one person's events together
  email    text,
  page     text,
  city     text,
  country  text,
  data     jsonb       not null
);

create index if not exists enquiry_events_at_idx      on public.enquiry_events (at desc);
create index if not exists enquiry_events_kind_at_idx on public.enquiry_events (kind, at desc);
create index if not exists enquiry_events_sid_idx     on public.enquiry_events (sid);
create index if not exists enquiry_events_email_idx   on public.enquiry_events (email);
create index if not exists enquiry_events_data_idx    on public.enquiry_events using gin (data);

-- ------------------------------------------------------- the assistant
-- The instructions, versioned, so the voice can change without a deploy.
-- api/chat-prompt.js is version 1 and the fallback; the code seeds this
-- table from the file on first run.

create table if not exists public.ai_prompts (
  id         bigint generated always as identity primary key,
  key        text        not null,             -- 'chat_system'
  version    integer     not null default 1,
  body       text        not null,
  note       text,
  active     boolean     not null default false,
  created_at timestamptz not null default now(),
  unique (key, version)
);

-- One active version per key, enforced here rather than by remembering to
-- switch the old one off.
create unique index if not exists ai_prompts_one_active
  on public.ai_prompts (key) where active;

-- Facts the assistant may state. Separate from the prompt so the voice and
-- the facts change independently. Pulled into a reply by keyword overlap
-- against `tags`; weight 9 and up is always included, whatever was asked.

create table if not exists public.ai_knowledge (
  id         bigint generated always as identity primary key,
  topic      text        not null,
  content    text        not null,
  tags       text[]      not null default '{}',
  weight     integer     not null default 0,
  active     boolean     not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists ai_knowledge_active_idx on public.ai_knowledge (active, weight desc);
create index if not exists ai_knowledge_tags_idx   on public.ai_knowledge using gin (tags);

-- --------------------------------------------------------- panel content
-- The role stories shown as chips, and the follow-up suggestions offered
-- under an answer. api/chat-content.js is the seed and the fallback.
--
-- Bullets may use <b> <i> <em> <strong> <br>; the widget strips everything
-- else and drops all attributes, so a row here cannot inject script.

create table if not exists public.chat_stories (
  id         bigint generated always as identity primary key,
  key        text        not null unique,      -- teacher | admin | principal | parent
  chip       text        not null,
  ask        text        not null,
  intro      text        not null,
  lead       text,
  bullets    jsonb       not null default '[]'::jsonb,
  close      text,
  weight     integer     not null default 0,   -- chip order, high to low
  active     boolean     not null default true,
  updated_at timestamptz not null default now()
);

-- A null pattern is the default set, used when nothing matches.
create table if not exists public.chat_followups (
  id          bigint generated always as identity primary key,
  pattern     text,                            -- case-insensitive regex
  suggestions text[]      not null,
  weight      integer     not null default 0,
  active      boolean     not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists chat_stories_active_idx   on public.chat_stories (active, weight desc);
create index if not exists chat_followups_active_idx on public.chat_followups (active, weight desc);

-- ---------------------------------------------------------------- locks
alter table public.enquiry_events enable row level security;
alter table public.ai_prompts     enable row level security;
alter table public.ai_knowledge   enable row level security;
alter table public.chat_stories   enable row level security;
alter table public.chat_followups enable row level security;

-- search_path pinned: a mutable one lets a caller shadow what this resolves to.
create or replace function public.touch_updated_at() returns trigger
  language plpgsql
  security invoker
  set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ai_knowledge_touch on public.ai_knowledge;
create trigger ai_knowledge_touch before update on public.ai_knowledge
  for each row execute function public.touch_updated_at();

drop trigger if exists chat_stories_touch on public.chat_stories;
create trigger chat_stories_touch before update on public.chat_stories
  for each row execute function public.touch_updated_at();

drop trigger if exists chat_followups_touch on public.chat_followups;
create trigger chat_followups_touch before update on public.chat_followups
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- views
-- For reading the log by hand in the SQL editor. security_invoker matters:
-- without it a view runs with its creator's rights and reads straight past
-- the RLS above, which would let the public key read every enquiry.

create or replace view public.questions_asked as
select at,
       data->>'text'  as question,
       data->>'model' as answered_by,
       data->>'promptVersion' as prompt_version,
       city, country, page, sid
from public.enquiry_events
where kind = 'question'
order by at desc;

create or replace view public.callbacks as
select at,
       data->>'name'    as name,
       email,
       data->>'school'  as school,
       data->>'role'    as role,
       data->>'enquiry' as enquiry,
       data->>'text'    as message,
       (data->>'mailed')::boolean as mail_sent,
       city, country
from public.enquiry_events
where kind in ('callback', 'contact')
order by at desc;

create or replace view public.faults as
select data->>'message' as message,
       data->>'fault'   as type,
       data->>'file'    as file,
       count(*)         as occurrences,
       min(at)          as first_seen,
       max(at)          as last_seen
from public.enquiry_events
where kind = 'bug'
group by 1, 2, 3
order by occurrences desc, last_seen desc;

alter view public.questions_asked set (security_invoker = on);
alter view public.callbacks       set (security_invoker = on);
alter view public.faults          set (security_invoker = on);
