-- AI classification cache for Google Calendar events.
-- Avoids calling Gemini on every page load for the same event.
-- Cache key: (google_event_id, google_event_updated) — refreshes automatically when an event is edited in Google Calendar.

create table if not exists calendar_event_ai_tags (
  id                   uuid        primary key default gen_random_uuid(),
  google_event_id      text        not null,
  google_event_updated text        not null default '',
  title                text,
  audience             text        not null,
  categories           text[]      not null,
  is_signature         boolean     not null default false,
  confidence           numeric     not null default 0,
  tag_source           text        not null default 'ai',
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Unique index on (id, updated) so upsert works cleanly.
-- If google_event_updated changes (event was edited), the old row stays and a new one is inserted.
create unique index if not exists calendar_event_ai_tags_event_updated_idx
  on calendar_event_ai_tags(google_event_id, google_event_updated);

-- RLS: edge functions use the service role key which bypasses RLS,
-- so there's no need for RLS policies here. Enable RLS to prevent
-- accidental client-side access from the anon/publishable key.
alter table calendar_event_ai_tags enable row level security;
