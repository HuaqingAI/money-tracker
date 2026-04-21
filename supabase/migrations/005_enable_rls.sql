-- Migration 005: enable row level security on all app tables

alter table auth.user_profiles   enable row level security;
alter table auth.subscriptions   enable row level security;

alter table billing.categories       enable row level security;
alter table billing.transactions     enable row level security;
alter table billing.category_rules   enable row level security;
alter table billing.csv_parse_rules  enable row level security;

alter table analytics.monthly_summaries enable row level security;
