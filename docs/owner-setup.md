# Owner dashboard setup

The owner is yunusaalkamel@gmail.com. Open `/owner` directly. Administrators use `/admin`. The existing sign-in method applies in Phase 2. A successful authentication alone grants no website permissions.

## Connect a deployment once

1. The migration `supabase/migrations/20261125000000_website_management.sql` installs the private tables and the authenticated permission function. It has already been applied to project `hvoiytjyimcyvpamsbay`. On a fresh Supabase project apply the migration before continuing. Keep the `msa_private` schema outside the Data API's exposed schema list.
2. In Supabase SQL Editor run the statement below for **preview**. It creates the environment and returns a new random key once. Save the returned value directly in Vercel. Keep it out of source control, chat and public frontend variables. Running it again for an existing environment returns no key and preserves its settings.
3. In the Vercel project, open Settings → Environment Variables. Add **MSA_MANAGEMENT_KEY** as a sensitive, server-only variable scoped to **Preview**, with the value from step 2. Keep **SANITY_EDITOR_DATASET** set to **preview** for Preview. Keep the existing Supabase URL, publishable key and Sanity token. Redeploy the draft branch preview.
4. For the current email sign-in, allow the exact preview origin with `/owner` and `/admin` in Supabase Authentication → URL Configuration → Redirect URLs. Keep production's Site URL unchanged. Open the preview through Vercel deployment protection, then sign in as the owner. If already signed in at `/admin`, opening `/owner` on that same origin reuses the session.

```sql
with generated as materialized (
  select 'preview'::text as environment, encode(extensions.gen_random_bytes(32),'hex') as secret
), added as (
  insert into msa_private.environments(environment,key_hash)
  select environment, sha256(convert_to(secret,'UTF8')) from generated
  on conflict (environment) do nothing returning environment
)
select secret as vercel_server_only_value from generated join added using(environment);
```

## Preview acceptance and production rollout

- Open System health. Confirm Preview, Supabase connectivity, Sanity reads, and the Sanity dry-run write validation. Exercise a real preview upload and publish on a disposable preview page to confirm asset and document permissions.
- Give a separate verified account preview administrator access. Test its editor access, deny it the owner dashboard, disable it while it is signed in and confirm its next publish and upload are rejected. Reinstate it and repeat with administrator publishing paused, uploads paused and global access paused. Check the owner can reverse each change. During maintenance both roles lose content writes.
- Check the Activity section for the account, action and time. Sign-in activity is recorded when an authorized session first uses management in that environment. Health checks validate the current connections. The Vercel Analytics line describes public instrumentation. Owner traffic reports are planned in Phase 5.
- Only when ready for a reviewed production rollout, repeat the environment insertion with `'production'`. Scope the **new** key to Vercel **Production** and confirm **SANITY_EDITOR_DATASET=production**. Add the exact production management redirect URLs. Verify the environment assignments before merging. Production and preview authorization lists start independently.
- If the database is unavailable or deployment keys are mismatched, management fails closed. Public content reads do not require management credentials. After a successful Sanity write, any separate activity logging failure is shown as a warning in the editor. Durable history and reconciliation are Phase 4.
