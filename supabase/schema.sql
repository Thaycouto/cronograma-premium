create table if not exists public.premium_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text unique,
  provider text default 'kiwify',
  active boolean not null default false,
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.premium_access enable row level security;

create policy "Users can read their own premium access"
on public.premium_access
for select
to authenticated
using (
  auth.uid() = user_id
  or lower(email) = lower((auth.jwt() ->> 'email'))
);
