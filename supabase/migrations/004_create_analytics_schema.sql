-- Migration 004: analytics schema — pre-aggregated monthly summaries

create table if not exists analytics.monthly_summaries (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  month               date not null,
  total_cents         bigint not null default 0,
  category_breakdown  jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint uq_monthly_summaries_user_month unique (user_id, month)
);

create index if not exists idx_monthly_summaries_user_id on analytics.monthly_summaries(user_id);
create index if not exists idx_monthly_summaries_user_id_month on analytics.monthly_summaries(user_id, month desc);

comment on column analytics.monthly_summaries.month is 'First-of-month date — normalize to date_trunc(''month'', ...)';
comment on column analytics.monthly_summaries.category_breakdown is 'JSONB: { "<category_id>": { "amount_cents": number, "count": number } }';
