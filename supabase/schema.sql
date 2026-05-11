create extension if not exists "pgcrypto";

create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  website text,
  category text,
  positioning text,
  services_offered text,
  target_customers text,
  strengths text,
  weaknesses text,
  notes text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists intelligence_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_url text,
  source_type text default 'manual',
  publication_date date,
  author text,
  raw_content text,
  tags text[] default '{}',
  competitor_id uuid references competitors(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists ai_summaries (
  id uuid primary key default gen_random_uuid(),
  intelligence_item_id uuid references intelligence_items(id) on delete cascade,
  executive_summary text,
  key_takeaways text[] default '{}',
  risks text[] default '{}',
  opportunities text[] default '{}',
  relevance_to_plcp text,
  created_at timestamptz default now()
);

create table if not exists swot_analyses (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references competitors(id) on delete cascade,
  strengths text[] default '{}',
  weaknesses text[] default '{}',
  opportunities text[] default '{}',
  threats text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  activity_type text not null,
  description text not null,
  created_at timestamptz default now()
);

create table if not exists plcp_profile (
  id uuid primary key default gen_random_uuid(),
  core_services text[] default '{}',
  differentiators text[] default '{}',
  pricing_position text,
  operational_strengths text[] default '{}',
  weaknesses text[] default '{}',
  target_customer_profile text,
  strategic_goals text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists positioning_analyses (
  id uuid primary key default gen_random_uuid(),
  analysis jsonb not null,
  created_at timestamptz default now()
);

create table if not exists generated_insights (
  id uuid primary key default gen_random_uuid(),
  query text,
  insights text[] default '{}',
  recommended_actions text[] default '{}',
  created_at timestamptz default now()
);

create index if not exists competitors_tags_idx on competitors using gin(tags);
create index if not exists intelligence_tags_idx on intelligence_items using gin(tags);
create index if not exists intelligence_competitor_idx on intelligence_items(competitor_id);
