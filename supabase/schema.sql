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
