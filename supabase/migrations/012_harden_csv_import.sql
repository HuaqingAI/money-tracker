-- Migration 012: harden CSV import idempotency and rule rotation

alter table billing.transactions
  add column if not exists external_transaction_id text;

alter table billing.transactions
  add column if not exists import_dedupe_key text;

create unique index if not exists uq_transactions_import_dedupe
  on billing.transactions(user_id, source, import_dedupe_key);

create or replace function billing.upsert_csv_parse_rule(
  p_platform text,
  p_version text,
  p_rule_config jsonb,
  p_is_active boolean default true
)
returns billing.csv_parse_rules
language plpgsql
security definer
set search_path = billing, public
as $$
declare
  updated_row billing.csv_parse_rules;
begin
  if p_is_active then
    update billing.csv_parse_rules
    set
      is_active = false,
      updated_at = now()
    where platform = p_platform
      and is_active = true;
  end if;

  insert into billing.csv_parse_rules (
    platform,
    version,
    rule_config,
    is_active,
    updated_at
  )
  values (
    p_platform,
    p_version,
    p_rule_config,
    p_is_active,
    now()
  )
  on conflict (platform, version) do update
  set
    rule_config = excluded.rule_config,
    is_active = excluded.is_active,
    updated_at = excluded.updated_at
  returning * into updated_row;

  return updated_row;
end;
$$;

comment on column billing.transactions.external_transaction_id is 'Provider transaction/order id for CSV import idempotency';
comment on column billing.transactions.import_dedupe_key is 'Stable import idempotency key for CSV rows';
