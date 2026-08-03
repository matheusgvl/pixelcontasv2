create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received', 'processing', 'processed', 'ignored', 'failed')),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, event_id)
);

create index if not exists webhook_events_company_id_idx on public.webhook_events(company_id);
create index if not exists webhook_events_provider_idx on public.webhook_events(provider);
create index if not exists webhook_events_status_idx on public.webhook_events(status);

alter table public.webhook_events
add column if not exists normalized_payload jsonb not null default '{}'::jsonb;

alter table public.webhook_events
add column if not exists processing_result jsonb not null default '{}'::jsonb;

create unique index if not exists sales_company_origin_external_id_idx
on public.sales(company_id, origin, external_id)
where external_id is not null;

drop trigger if exists webhook_events_set_updated_at on public.webhook_events;
create trigger webhook_events_set_updated_at
before update on public.webhook_events
for each row execute function public.set_updated_at();

alter table public.webhook_events enable row level security;

drop policy if exists "Company members can read webhook events" on public.webhook_events;
create policy "Company members can read webhook events"
on public.webhook_events
for select
using (
  exists (
    select 1
    from public.company_members cm
    where cm.company_id = webhook_events.company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'active'
  )
);
