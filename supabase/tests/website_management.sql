-- Execute in a disposable Postgres database with the migration and test auth users.
-- These statements use synthetic identities only. Roll back all fixtures.
begin;
insert into msa_private.environments(environment,key_hash)
select s, sha256(convert_to('test-'||s,'UTF8')) from unnest(array['preview','production']) s;
create function pg_temp.check_access(op text, args jsonb, expected text, env text default 'preview') returns void
language plpgsql as $$
declare r jsonb;
begin
  r:= public.msa_management('test-'||env,op,jsonb_build_object('expected_environment',env)||args);
  if coalesce(r->>'error',r->>'role') is distinct from expected then
    raise exception 'Unexpected result for %: expected %, got %',op,expected,r;
  end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","session_id":"10000000-0000-0000-0000-000000000001"}',true);
select pg_temp.check_access('owner_session','{}','owner');
select pg_temp.check_access('session','{}','owner');
select pg_temp.check_access('administrator','{"email":"yunusaalkamel@gmail.com","status":"removed"}','invalid_administrator');
select pg_temp.check_access('add','{"email":"test@example.org","status":"active"}','owner');
select pg_temp.check_access('control','{"control":"maintenance","enabled":true,"expected_environment":"production"}','configuration');
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000002","session_id":"10000000-0000-0000-0000-000000000002"}',true);
select pg_temp.check_access('session','{}','administrator');
select pg_temp.check_access('publish','{}','administrator');
select pg_temp.check_access('session','{}','unauthorized','production');
select pg_temp.check_access(op,'{}','owner_only') from unnest(array['overview','control','health','administrator','owner_session']) op;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","session_id":"10000000-0000-0000-0000-000000000001"}',true);
select pg_temp.check_access('control',jsonb_build_object('control',c,'enabled',false),'owner') from unnest(array['uploads_enabled','publishing_enabled']) c;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000002","session_id":"10000000-0000-0000-0000-000000000002"}',true);
select pg_temp.check_access('publish','{}','publishing_paused');
select pg_temp.check_access('image','{}','uploads_paused');
do $$
declare s text; owner_claims text := '{"sub":"00000000-0000-0000-0000-000000000001","session_id":"10000000-0000-0000-0000-000000000001"}';
admin_claims text:=current_setting('request.jwt.claims'); r jsonb;
begin
  foreach s in array array['disabled','removed','active'] loop
    perform set_config('request.jwt.claims',owner_claims,true);
    perform pg_temp.check_access('administrator',jsonb_build_object('email','test@example.org','status',s),'owner');
    perform set_config('request.jwt.claims',admin_claims,true);
    perform pg_temp.check_access('session','{}',case s when 'disabled' then 'disabled' when 'removed' then 'unauthorized' else 'administrator' end);
  end loop;
  perform set_config('request.jwt.claims',owner_claims,true);
  perform pg_temp.check_access('control','{"control":"admins_enabled","enabled":false}','owner');
  perform pg_temp.check_access('control','{"control":"maintenance","enabled":true}','owner');
  perform pg_temp.check_access('publish','{}','maintenance');
  perform pg_temp.check_access('owner_session','{}','owner');
  perform set_config('request.jwt.claims',admin_claims,true);
  perform pg_temp.check_access('session','{}','admins_paused');
  perform set_config('request.jwt.claims',owner_claims,true);
  perform pg_temp.check_access('control','{"control":"maintenance","enabled":false}','owner');
  perform pg_temp.check_access('publish','{}','owner');
  r:=public.msa_management('test-preview','overview','{"expected_environment":"preview"}');
  if jsonb_array_length(r->'administrators')<>1 or r->'controls' ? 'key_hash' or jsonb_array_length(r->'activity')<10 then raise exception 'Incorrect overview';end if;
  if has_schema_privilege('authenticated','msa_private','USAGE') or has_function_privilege('anon','public.msa_management(text,text,jsonb)','EXECUTE') then raise exception 'Unexpected direct privileges';end if;
end $$;
rollback;
