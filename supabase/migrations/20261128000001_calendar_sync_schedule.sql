-- Align successful refreshes with cron ticks so runtime does not turn a 15-minute schedule into 30 minutes.
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
    next_attempt_at = case when failure is null then
      date_bin(interval '15 minutes',now(),timestamptz '2000-01-01') + interval '15 minutes'
      else now() + interval '15 minutes' * least(power(2,least(failures,3)),8) end,
    lease_token = null, lease_until = null
  where id='main' and lease_token=token;
  return found;
end;
$$;
revoke all on function public.complete_calendar_sync(uuid,jsonb,text) from public, anon, authenticated;
grant execute on function public.complete_calendar_sync(uuid,jsonb,text) to service_role;

