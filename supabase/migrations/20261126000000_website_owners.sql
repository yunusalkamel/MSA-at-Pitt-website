begin;

create table msa_private.owners (
  environment text not null references msa_private.environments,
  email text not null check (email=lower(trim(email))),
  added_at timestamptz not null default now(),
  primary key(environment,email)
);
alter table msa_private.owners enable row level security;
revoke all on table msa_private.owners from public, anon, authenticated;

-- Carry forward the existing owner as data for each provisioned environment.
insert into msa_private.owners(environment,email)
  select environment,'yunusaalkamel@gmail.com' from msa_private.environments;
alter table msa_private.administrators drop constraint administrators_email_check;

create or replace function public.msa_management(env_key text, operation text, payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  cfg msa_private.environments; admin msa_private.administrators;
  actor_email text; sid uuid := (auth.jwt()->>'session_id')::uuid;
  is_owner boolean;
  target text := lower(trim(payload->>'email')); state text := payload->>'status';
  control text := payload->>'control'; enabled boolean; denial text; entry bigint; login_at timestamptz;
  result jsonb; query_text text := left(trim(coalesce(payload->>'search','')),150);
begin
  select * into cfg from msa_private.environments where key_hash=pg_catalog.sha256(convert_to(env_key,'UTF8'));
  if not found or cfg.environment is distinct from payload->>'expected_environment' then return jsonb_build_object('error','configuration'); end if;
  select lower(email) into actor_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
  if actor_email is null or sid is null then return jsonb_build_object('error','identity'); end if;
  if operation in ('add','note','administrator','add_owner','transfer_ownership') then
    perform 1 from msa_private.environments where environment=cfg.environment for update;
  end if;
  select exists(select 1 from msa_private.owners where environment=cfg.environment and email=actor_email) into is_owner;
  select * into admin from msa_private.administrators where environment=cfg.environment and email=actor_email;
  if not is_owner then
    denial := case
      when admin.status='disabled' then 'disabled'
      when admin.status is distinct from 'active' then 'unauthorized'
      when not cfg.admins_enabled then 'admins_paused'
      when operation not in ('session','publish','image','published') then 'owner_only'
      when operation='publish' and not cfg.publishing_enabled then 'publishing_paused'
      when operation='image' and not cfg.uploads_enabled then 'uploads_paused'
    end;
  end if;
  if cfg.maintenance and operation in ('image','publish') then denial := 'maintenance'; end if;
  if denial is not null then
    insert into msa_private.activity(environment,actor,action,subject) values(cfg.environment,actor_email,'denied_'||denial,left(operation,60));
    return jsonb_build_object('error',denial);
  end if;
  select created_at into login_at from auth.sessions where id=sid and user_id=auth.uid();
  insert into msa_private.activity(environment,actor,action,session_id,occurred_at)
    values(cfg.environment,actor_email,'sign_in',sid,coalesce(login_at,now())) on conflict do nothing returning id into entry;
  if entry is not null then update msa_private.administrators set last_sign_in=greatest(last_sign_in,coalesce(login_at,now())) where environment=cfg.environment and email=actor_email; end if;
  if operation in ('add_owner','transfer_ownership') then
    if target is null or target=actor_email or not exists (
      select 1 from auth.users where lower(email)=target and email_confirmed_at is not null
    ) then
      return jsonb_build_object('error','invalid_owner');
    end if;
    insert into msa_private.owners(environment,email) values(cfg.environment,target) on conflict do nothing;
    delete from msa_private.administrators where environment=cfg.environment and email=target;
    if operation='transfer_ownership' then
      delete from msa_private.owners where environment=cfg.environment and email=actor_email;
    end if;
    insert into msa_private.activity(environment,actor,action,subject)
      values(cfg.environment,actor_email,case operation when 'add_owner' then 'owner_added' else 'ownership_transferred' end,target);
  elsif operation in ('add','note','administrator') then
    if target is null or length(target)>254 or target !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' or exists(select 1 from msa_private.owners where environment=cfg.environment and email=target) or (operation <> 'note' and (state is null or state not in ('active','disabled','removed'))) or length(coalesce(payload->>'note',''))>500 then
      return jsonb_build_object('error','invalid_administrator');
    end if;
    if operation='add' then
      insert into msa_private.administrators(environment,email,status,note) values(cfg.environment,target,'active',coalesce(payload->>'note','')) on conflict do nothing;
    elsif operation='note' then
      update msa_private.administrators set note=coalesce(payload->>'note','') where environment=cfg.environment and email=target;
    else
      update msa_private.administrators set status=state where environment=cfg.environment and email=target;
    end if;
    if not found then return jsonb_build_object('error','administrator_conflict'); end if;
    insert into msa_private.activity(environment,actor,action,subject) values(cfg.environment,actor_email,
      case operation when 'add' then 'administrator_added' when 'note' then 'administrator_note_updated' else 'administrator_'||state end,target);
  elsif operation='control' then
    if control is null or control not in ('admins_enabled','publishing_enabled','uploads_enabled','maintenance') or jsonb_typeof(payload->'enabled') is distinct from 'boolean' then return jsonb_build_object('error','invalid_control'); end if;
    enabled := (payload->>'enabled')::boolean;
    execute format('update msa_private.environments set %I=$1 where environment=$2',control) using enabled,cfg.environment;
    insert into msa_private.activity(environment,actor,action,subject) values(cfg.environment,actor_email,control,enabled::text);
  elsif operation='published' then
    insert into msa_private.activity(environment,actor,action,subject) values(cfg.environment,actor_email,'published',left(payload->>'revision',128));
    update msa_private.administrators set last_publish=now() where environment=cfg.environment and email=actor_email;
  elsif operation='overview' then
    select jsonb_build_object(
      'controls',to_jsonb(cfg)-'key_hash'-'environment',
      'owners',coalesce((select jsonb_agg(email order by email) from msa_private.owners where environment=cfg.environment),'[]'),
      'administrators',coalesce((select jsonb_agg(to_jsonb(a)-'environment' order by email) from msa_private.administrators a where environment=cfg.environment),'[]'),
      'activity',coalesce((select jsonb_agg(to_jsonb(t) order by id desc) from (
        select id,occurred_at,actor,action,subject from msa_private.activity where environment=cfg.environment
          and (payload->>'before' is null or id<(payload->>'before')::bigint)
          and (coalesce(payload->>'action','')='' or action=payload->>'action')
          and strpos(lower(concat_ws(' ',actor,action,subject)),lower(query_text))>0
        order by id desc limit 75) t),'[]'),
      'lastPublication',(select occurred_at from msa_private.activity where environment=cfg.environment and action='published' order by id desc limit 1)
    ) into result;
  elsif operation not in ('session','owner_session','health','image','publish') then return jsonb_build_object('error','invalid_operation');
  end if;
  return coalesce(result,'{}') || jsonb_build_object('role',case when is_owner then 'owner' else 'administrator' end,'environment',cfg.environment);
end $$;
revoke all on function public.msa_management(text,text,jsonb) from public,anon;
grant execute on function public.msa_management(text,text,jsonb) to authenticated;
commit;
