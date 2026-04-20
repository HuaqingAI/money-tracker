-- 000_configure_database.sql
-- Database-level configuration that must run before everything else.
--
-- Purpose: expose secrets from the container environment to subsequent SQL
-- scripts via PostgreSQL GUCs (ALTER DATABASE ... SET ...). Once set, any
-- new session opened against this database can read the value through
-- current_setting('app.<name>').
--
-- The supabase/postgres image runs initdb scripts using psql with the env
-- inherited from the container, so env-var substitution happens at the shell
-- level via psql's `\set` + `:variable` mechanism. We rely on `current_setting`
-- only AFTER the ALTER DATABASE SET has committed.
--
-- Required env vars (must be set on the `db` service in docker-compose.yml):
--   ENCRYPTION_KEY           — pgp_sym_encrypt / pgp_sym_decrypt key
--   AUTHENTICATOR_PASSWORD   — password for the PostgREST `authenticator` role

\set encryption_key `echo "$ENCRYPTION_KEY"`
\set authenticator_password `echo "$AUTHENTICATOR_PASSWORD"`

do $$
begin
  if :'encryption_key' is null or :'encryption_key' = '' then
    raise exception 'ENCRYPTION_KEY environment variable is not set — refusing to initialise database';
  end if;
  if :'authenticator_password' is null or :'authenticator_password' = '' then
    raise exception 'AUTHENTICATOR_PASSWORD environment variable is not set — refusing to initialise database';
  end if;
end $$;

-- Persist the values as database-scoped GUCs, readable via current_setting()
-- from every future session. Uses dynamic SQL so the literal is safely quoted.
select format(
  'alter database %I set app.encryption_key = %L',
  current_database(),
  :'encryption_key'
) \gexec

select format(
  'alter database %I set app.authenticator_password = %L',
  current_database(),
  :'authenticator_password'
) \gexec
