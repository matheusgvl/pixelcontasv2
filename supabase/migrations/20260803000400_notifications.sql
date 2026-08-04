create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null default '',
  type text not null default 'info' check (type in ('error', 'warning', 'success', 'info')),
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_company_id_idx on public.notifications(company_id);
create index if not exists notifications_read_at_idx on public.notifications(read_at);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);

drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

alter table public.notifications enable row level security;

drop policy if exists "Company members can read notifications" on public.notifications;
create policy "Company members can read notifications"
on public.notifications
for select
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = notifications.company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
  )
);

drop policy if exists "Company members can update notifications" on public.notifications;
create policy "Company members can update notifications"
on public.notifications
for update
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = notifications.company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = notifications.company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
  )
);
