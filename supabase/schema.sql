create table if not exists public.access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null unique,
  source text not null default 'kiwify',
  status text not null default 'active',
  order_id text,
  product_id text,
  customer_name text,
  purchased_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kiwify_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique,
  event_type text,
  email text,
  order_id text,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

create index if not exists access_grants_email_idx
on public.access_grants (lower(email));

create index if not exists access_grants_user_id_idx
on public.access_grants (user_id);

create index if not exists kiwify_events_email_idx
on public.kiwify_events (lower(email));

alter table public.access_grants enable row level security;
alter table public.kiwify_events enable row level security;

drop policy if exists "Users can read their own access grant" on public.access_grants;
create policy "Users can read their own access grant"
on public.access_grants
for select
to authenticated
using (
  user_id = auth.uid()
  or lower(email) = lower((auth.jwt() ->> 'email'))
);

drop policy if exists "No client access to kiwify events" on public.kiwify_events;
create policy "No client access to kiwify events"
on public.kiwify_events
for select
to authenticated
using (false);

create table if not exists public.ai_hair_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  image_url text,
  diagnosis_json jsonb not null,
  ai_result_json jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.ai_hair_analyses
add column if not exists email text;

create index if not exists ai_hair_analyses_user_created_at_idx
on public.ai_hair_analyses (user_id, created_at desc);

create index if not exists ai_hair_analyses_email_created_at_idx
on public.ai_hair_analyses (lower(email), created_at desc);

alter table public.ai_hair_analyses enable row level security;

drop policy if exists "Users can read their own AI hair analyses" on public.ai_hair_analyses;
create policy "Users can read their own AI hair analyses"
on public.ai_hair_analyses
for select
to authenticated
using (
  user_id = auth.uid()
  or lower(email) = lower((auth.jwt() ->> 'email'))
);

create table if not exists public.chronograms (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  diagnosis_json jsonb not null,
  plan_json jsonb not null,
  current_day integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chronograms_email_created_at_idx
on public.chronograms (lower(email), created_at desc);

create index if not exists chronograms_user_created_at_idx
on public.chronograms (user_id, created_at desc);

alter table public.chronograms enable row level security;

drop policy if exists "Users can read their own chronograms" on public.chronograms;
create policy "Users can read their own chronograms"
on public.chronograms
for select
to authenticated
using (
  user_id = auth.uid()
  or lower(email) = lower((auth.jwt() ->> 'email'))
);

create table if not exists public.treatment_logs (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  chronogram_id uuid references public.chronograms(id) on delete cascade,
  treatment_type text not null,
  scheduled_day integer not null,
  status text not null check (status in ('realizado', 'pulado')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists treatment_logs_email_created_at_idx
on public.treatment_logs (lower(email), created_at desc);

create index if not exists treatment_logs_chronogram_idx
on public.treatment_logs (chronogram_id, created_at desc);

alter table public.treatment_logs enable row level security;

drop policy if exists "Users can read their own treatment logs" on public.treatment_logs;
create policy "Users can read their own treatment logs"
on public.treatment_logs
for select
to authenticated
using (lower(email) = lower((auth.jwt() ->> 'email')));

grant usage on schema public to anon, authenticated, service_role;

grant all privileges on table public.access_grants to service_role;
grant all privileges on table public.kiwify_events to service_role;
grant all privileges on table public.ai_hair_analyses to service_role;
grant all privileges on table public.chronograms to service_role;
grant all privileges on table public.treatment_logs to service_role;

grant select on table public.access_grants to authenticated;
grant select on table public.ai_hair_analyses to authenticated;
grant select on table public.chronograms to authenticated;
grant select on table public.treatment_logs to authenticated;

insert into storage.buckets (id, name, public)
values ('hair-analysis-images', 'hair-analysis-images', false)
on conflict (id) do nothing;

drop policy if exists "Users can read their own hair analysis images" on storage.objects;
create policy "Users can read their own hair analysis images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'hair-analysis-images'
  and split_part(name, '/', 1) = auth.uid()::text
);
