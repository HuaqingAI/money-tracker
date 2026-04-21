-- Migration 006: RLS policies
--
-- Performance: always wrap auth.uid() in (select ...) to enable plan cache.
-- Scope: TO authenticated (never anon) unless the row is explicitly public.
--
-- service_role bypasses RLS globally (BYPASSRLS attribute granted in
-- 008_create_service_roles.sql). We still declare explicit service_role
-- policies on tables whose writes MUST come from the backend so that intent
-- is obvious from the policy file, and so that if BYPASSRLS is ever revoked
-- the writes still succeed.

-- =====================================================================
-- auth.user_profiles — owner read/write
-- =====================================================================
create policy user_profiles_select_own on auth.user_profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy user_profiles_insert_own on auth.user_profiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy user_profiles_update_own on auth.user_profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy user_profiles_delete_own on auth.user_profiles
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- =====================================================================
-- auth.subscriptions — owner reads; all writes restricted to service_role.
-- =====================================================================
create policy subscriptions_select_own on auth.subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy subscriptions_write_service on auth.subscriptions
  for all to service_role
  using (true)
  with check (true);

-- =====================================================================
-- billing.categories — system rows readable by everyone; user rows owned
-- =====================================================================
create policy categories_select_system_or_own on billing.categories
  for select to authenticated
  using (is_system = true or (select auth.uid()) = user_id);

create policy categories_insert_own on billing.categories
  for insert to authenticated
  with check (is_system = false and (select auth.uid()) = user_id);

create policy categories_update_own on billing.categories
  for update to authenticated
  using (is_system = false and (select auth.uid()) = user_id)
  with check (is_system = false and (select auth.uid()) = user_id);

create policy categories_delete_own on billing.categories
  for delete to authenticated
  using (is_system = false and (select auth.uid()) = user_id);

-- =====================================================================
-- billing.transactions — full CRUD scoped to owner
-- =====================================================================
create policy transactions_select_own on billing.transactions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy transactions_insert_own on billing.transactions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy transactions_update_own on billing.transactions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy transactions_delete_own on billing.transactions
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- =====================================================================
-- billing.category_rules — full CRUD scoped to owner.
-- INSERT/UPDATE additionally verify the referenced category_id is either a
-- system category or owned by the same user. Without this check, a user who
-- guesses another user's custom category UUID could leak a rule into it.
-- =====================================================================
create policy category_rules_select_own on billing.category_rules
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy category_rules_insert_own on billing.category_rules
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from billing.categories c
      where c.id = category_id
        and (c.is_system = true or c.user_id = (select auth.uid()))
    )
  );

create policy category_rules_update_own on billing.category_rules
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from billing.categories c
      where c.id = category_id
        and (c.is_system = true or c.user_id = (select auth.uid()))
    )
  );

create policy category_rules_delete_own on billing.category_rules
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- =====================================================================
-- billing.csv_parse_rules — authenticated reads active rules only; all writes
-- restricted to service_role (hot-update admin path).
-- =====================================================================
create policy csv_parse_rules_select_active on billing.csv_parse_rules
  for select to authenticated
  using (is_active = true);

create policy csv_parse_rules_write_service on billing.csv_parse_rules
  for all to service_role
  using (true)
  with check (true);

-- =====================================================================
-- analytics.monthly_summaries — owner reads; writes restricted to service_role
-- (month-end job computes aggregates).
-- =====================================================================
create policy monthly_summaries_select_own on analytics.monthly_summaries
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy monthly_summaries_write_service on analytics.monthly_summaries
  for all to service_role
  using (true)
  with check (true);
