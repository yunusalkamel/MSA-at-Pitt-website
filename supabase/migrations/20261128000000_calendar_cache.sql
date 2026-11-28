create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

create table if not exists public.calendar_cache (
  id text primary key default 'main' check (id = 'main'),
  payload jsonb,
  fetched_at timestamptz,
  last_error text,
  next_attempt_at timestamptz,
  last_attempt_at timestamptz,
  failures integer not null default 0,
  lease_token uuid,
  lease_until timestamptz
);
alter table public.calendar_cache enable row level security;
revoke all on public.calendar_cache from anon, authenticated;
grant all on public.calendar_cache to service_role;
insert into public.calendar_cache (id) values ('main') on conflict do nothing;

create or replace function public.claim_calendar_sync(manual boolean default false)
returns setof public.calendar_cache language sql security definer set search_path = '' as $$
  update public.calendar_cache
  set lease_token = gen_random_uuid(), lease_until = now() + interval '3 minutes', last_attempt_at = now()
  where id='main' and (lease_until is null or lease_until < now())
    and (next_attempt_at is null or next_attempt_at <= now() or (manual and failures=0))
    and (last_attempt_at is null or last_attempt_at < now() - interval '30 seconds')
  returning *;
$$;
revoke all on function public.claim_calendar_sync(boolean) from public, anon, authenticated;
grant execute on function public.claim_calendar_sync(boolean) to service_role;

create or replace function public.complete_calendar_sync(token uuid, result jsonb default null, failure text default null)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if failure is null and (result is null or result->>'stage' is distinct from 'success' or jsonb_typeof(result->'events') is distinct from 'array') then
    raise exception 'Invalid calendar snapshot';
  end if;
  update public.calendar_cache set
    payload = case when failure is null then result else payload end,
    fetched_at = case when failure is null then now() else fetched_at end,
    last_error = left(failure,500),
    failures = case when failure is null then 0 else least(failures+1,10) end,
    next_attempt_at = now() + case when failure is null then interval '15 minutes'
      else interval '15 minutes' * least(power(2,least(failures,3)),8) end,
    lease_token = null, lease_until = null
  where id='main' and lease_token=token;
  return found;
end;
$$;
revoke all on function public.complete_calendar_sync(uuid,jsonb,text) from public, anon, authenticated;
grant execute on function public.complete_calendar_sync(uuid,jsonb,text) to service_role;

-- The release installs calendar_sync_secret in Vault and in the Edge Function secrets.
-- An absent secret skips the HTTP request until setup is complete.
select cron.schedule('msa-calendar-sync','*/15 * * * *',$job$
  select net.http_post(
    url := 'https://hvoiytjyimcyvpamsbay.supabase.co/functions/v1/sync-calendar',
    headers := jsonb_build_object('Content-Type','application/json','x-calendar-sync',decrypted_secret),
    body := '{}'::jsonb, timeout_milliseconds := 120000
  ) from vault.decrypted_secrets where name='calendar_sync_secret' limit 1;
$job$);
