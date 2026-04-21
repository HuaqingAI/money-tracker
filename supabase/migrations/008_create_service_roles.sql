-- 008_create_service_roles.sql
-- Create the PostgREST service roles (authenticator, anon, authenticated,
-- service_role) and grant them the minimum privileges needed for RLS-guarded
-- access to billing / analytics.
--
-- `authenticator` is the login role PostgREST connects as; it assumes one of
-- anon / authenticated / service_role per-request based on the JWT claim.
-- Its password comes from app.authenticator_password, which was exported by
-- 000_configure_database.sql from the AUTHENTICATOR_PASSWORD env var.

do $$
declare
  v_pwd text;
begin
  -- `false` (missing_ok) → raise if the GUC isn't set, which means 000 never ran.
  v_pwd := current_setting('app.authenticator_password');

  if v_pwd is null or v_pwd = '' then
    raise exception 'app.authenticator_password is empty — 000_configure_database.sql must run first';
  end if;

  -- anon: unauthenticated requests
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;

  -- authenticated: logged-in users
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;

  -- service_role: backend admin (bypasses RLS)
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;

  -- authenticator: login role PostgREST uses; may SET ROLE to the three above.
  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    execute format('create role authenticator noinherit login password %L', v_pwd);
  else
    execute format('alter role authenticator with password %L', v_pwd);
  end if;

  grant anon, authenticated, service_role to authenticator;
end $$;

-- Schema usage
grant usage on schema billing    to anon, authenticated, service_role;
grant usage on schema analytics  to anon, authenticated, service_role;
grant usage on schema auth       to authenticated, service_role;

-- authenticated: CRUD on billing / analytics. Row isolation enforced by RLS.
grant select, insert, update, delete on all tables in schema billing   to authenticated;
grant select, insert, update, delete on all tables in schema analytics to authenticated;
grant select on all tables in schema billing to anon;

-- Keep default privileges aligned so future tables in these schemas inherit
-- the same CRUD grant.
alter default privileges in schema billing
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema analytics
  grant select, insert, update, delete on tables to authenticated;

-- service_role already BYPASSRLS, but keep explicit grants so the role also
-- works outside the bypass path (logical replication, pg_dump, future audits).
grant select, insert, update, delete on all tables in schema billing   to service_role;
grant select, insert, update, delete on all tables in schema analytics to service_role;
grant select, insert, update, delete on all tables in schema auth      to service_role;
