-- Migration 007: maintain updated_at columns via BEFORE UPDATE trigger
--
-- DEFAULT now() on an updated_at column only fires on INSERT. Without a
-- trigger, every UPDATE leaves the column frozen at the insert timestamp,
-- silently breaking cache invalidation, audit trails, and sync ordering.
--
-- The trigger function lives in the public schema so it can be referenced by
-- triggers in auth / billing / analytics without cross-schema visibility
-- issues.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Attach to every table that has an updated_at column.

drop trigger if exists trg_user_profiles_set_updated_at on auth.user_profiles;
create trigger trg_user_profiles_set_updated_at
  before update on auth.user_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_transactions_set_updated_at on billing.transactions;
create trigger trg_transactions_set_updated_at
  before update on billing.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_csv_parse_rules_set_updated_at on billing.csv_parse_rules;
create trigger trg_csv_parse_rules_set_updated_at
  before update on billing.csv_parse_rules
  for each row execute function public.set_updated_at();

drop trigger if exists trg_monthly_summaries_set_updated_at on analytics.monthly_summaries;
create trigger trg_monthly_summaries_set_updated_at
  before update on analytics.monthly_summaries
  for each row execute function public.set_updated_at();
