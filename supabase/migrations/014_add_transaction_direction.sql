-- Migration 014: add transaction direction semantics for expense aggregation

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'billing'
      and t.typname = 'transaction_direction'
  ) then
    create type billing.transaction_direction as enum (
      'expense',
      'income',
      'refund',
      'closed'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'billing'
      and t.typname = 'direction_confidence'
  ) then
    create type billing.direction_confidence as enum (
      'high',
      'medium',
      'low'
    );
  end if;
end $$;

alter table billing.transactions
  add column if not exists direction billing.transaction_direction not null default 'expense';

alter table billing.transactions
  add column if not exists direction_confidence billing.direction_confidence not null default 'low';

create index if not exists idx_transactions_monthly_expense_direction
  on billing.transactions(user_id, transaction_at, status, direction)
  where status in ('confirmed', 'pending_confirmation')
    and direction = 'expense';

create index if not exists idx_transactions_recent_visible
  on billing.transactions(user_id, transaction_at desc)
  where status in ('confirmed', 'pending_confirmation');

comment on type billing.transaction_direction is
  'Business direction for transaction facts. direction=expense is the only source for expense aggregation.';

comment on type billing.direction_confidence is
  'Confidence that the transaction direction was explicitly known from source data or user input.';

comment on column billing.transactions.direction is
  'Business direction. Only direction=expense participates in monthly expense aggregations; amount sign is cash-flow compatibility only.';

comment on column billing.transactions.direction_confidence is
  'Direction source confidence: high explicit source/user input, medium rule-derived, low fallback compatibility.';
