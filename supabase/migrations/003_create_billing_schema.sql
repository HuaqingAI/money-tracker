-- Migration 003: billing schema — transactions, categories, parse rules

-- billing.categories: system-preset + user-custom categories
create table if not exists billing.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  icon        text,
  sort_order  integer not null default 0,
  is_system   boolean not null default true,
  user_id     uuid references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint chk_user_category check (
    (is_system = true and user_id is null) or
    (is_system = false and user_id is not null)
  )
);

create index if not exists idx_categories_user_id on billing.categories(user_id);
create index if not exists idx_categories_is_system on billing.categories(is_system);

-- billing.transactions: core ledger table with AI-confirmation state machine
--
-- amount_cents is BIGINT: a single transaction can exceed the 32-bit signed
-- INTEGER range (~¥21.4M in cents) for real-estate, corporate reimbursement,
-- or bulk-import cases. BIGINT is safe up to ~¥92 quadrillion.
--
-- category_id uses ON DELETE SET NULL so a user can delete a custom category
-- without orphaning its historical transactions (UX: the transaction remains
-- visible as "uncategorised").
create table if not exists billing.transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  amount_cents    bigint not null,
  status          text not null check (status in ('pending_confirmation', 'confirmed', 'rejected')),
  category_id     uuid references billing.categories(id) on delete set null,
  source          text,
  merchant        text,
  description     text,
  transaction_at  timestamptz not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_transactions_user_id on billing.transactions(user_id);
create index if not exists idx_transactions_category_id on billing.transactions(category_id);
create index if not exists idx_transactions_status on billing.transactions(status);
create index if not exists idx_transactions_transaction_at on billing.transactions(transaction_at desc);

comment on column billing.transactions.amount_cents is 'Integer cents (bigint) — never floats. Display / 100';
comment on column billing.transactions.status is 'AI flow: pending_confirmation -> (confirmed|rejected) by user';

-- billing.category_rules: keyword-based classification learned from user actions
--
-- Unique (user_id, keyword) prevents duplicate rules that would make
-- classification non-deterministic when the same keyword is seen. AI and
-- user-created rules collide on this key and must use ON CONFLICT upsert.
create table if not exists billing.category_rules (
  id           uuid primary key default gen_random_uuid(),
  keyword      text not null,
  category_id  uuid not null references billing.categories(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  hit_count    integer not null default 0,
  source       text not null check (source in ('ai', 'user')),
  created_at   timestamptz not null default now(),
  constraint uq_category_rules_user_keyword unique (user_id, keyword)
);

create index if not exists idx_category_rules_user_id on billing.category_rules(user_id);
create index if not exists idx_category_rules_keyword on billing.category_rules(keyword);

-- billing.csv_parse_rules: hot-swappable CSV import rule definitions
--
-- Unique (platform, version) prevents duplicate active rules for the same
-- platform/version pair. Rotation happens by flipping is_active on the old
-- row then inserting a new (platform, version) pair.
create table if not exists billing.csv_parse_rules (
  id           uuid primary key default gen_random_uuid(),
  platform     text not null,
  version      text not null,
  rule_config  jsonb not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint uq_csv_parse_rules_platform_version unique (platform, version)
);

create index if not exists idx_csv_parse_rules_platform on billing.csv_parse_rules(platform);
create index if not exists idx_csv_parse_rules_is_active on billing.csv_parse_rules(is_active);

comment on column billing.csv_parse_rules.rule_config is 'JSONB parse spec — enables hot-update without code deploy';
