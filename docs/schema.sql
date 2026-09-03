-- Paperhint enquiry log.
-- Paste this into the Supabase SQL editor and run it once.
--
-- One row per event: a question asked in the chat panel, a callback request,
-- a contact form enquiry, or a fault the site reported about itself.
--
-- A few fields are lifted into their own columns so they can be indexed and
-- queried in SQL. The whole event is also kept in `data`, so nothing is ever
-- lost to a schema that has moved on, and new fields need no migration.

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

-- Nobody reaches this table with a browser key. The site writes and reads it
-- with the service role key, which bypasses RLS and lives only in Vercel's
-- environment. Enabling RLS with no policy is the point: anon and authenticated
-- get nothing, so a leaked public key exposes nothing.
alter table public.enquiry_events enable row level security;

-- Handy views for reading it by hand in the SQL editor.

create or replace view public.questions_asked as
select at,
       data->>'text'  as question,
       data->>'model' as answered_by,
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
