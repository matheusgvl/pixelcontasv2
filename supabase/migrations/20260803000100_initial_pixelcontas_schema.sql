create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'owner' check (role in ('admin', 'owner', 'accountant', 'operator')),
  avatar_url text,
  active_company_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trade_name text,
  cnpj text not null unique,
  state_registration text,
  municipal_registration text,
  tax_regime text not null,
  cnae_primary text,
  email text,
  phone text,
  address jsonb not null default '{}'::jsonb,
  certificate_status text not null default 'missing' check (certificate_status in ('missing', 'valid', 'expiring', 'expired')),
  settings jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_active_company_id_fkey
  foreign key (active_company_id) references public.companies(id) on delete set null;

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'accountant', 'operator')),
  status text not null default 'active' check (status in ('active', 'invited', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, profile_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  trade_name text,
  document text not null,
  person_type text not null check (person_type in ('PF', 'PJ')),
  state_registration text,
  municipal_registration text,
  email text,
  phone text,
  address jsonb not null default '{}'::jsonb,
  notes text,
  total_invoices integer not null default 0,
  total_spent numeric(14,2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, document)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  code text not null,
  sku text,
  ncm text not null,
  cfop_default text not null,
  unit text not null,
  value numeric(14,2) not null default 0,
  stock numeric(14,3) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  internal_code text not null,
  municipal_code text not null,
  cnae text not null,
  iss_rate numeric(5,2) not null default 0,
  default_value numeric(14,2) not null default 0,
  city text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, internal_code)
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  origin text not null,
  external_id text,
  payment_method text,
  sold_at timestamptz not null default now(),
  gross_value numeric(14,2) not null default 0,
  discount_value numeric(14,2) not null default 0,
  net_value numeric(14,2) not null default 0,
  status text not null default 'paid' check (status in ('pending', 'paid', 'canceled', 'refunded')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  sale_id uuid references public.sales(id) on delete set null,
  number text,
  series text,
  access_key text,
  type text not null check (type in ('NFS-e', 'NF-e', 'NFC-e')),
  issue_date timestamptz not null default now(),
  value numeric(14,2) not null default 0,
  status text not null default 'waiting' check (status in ('authorized', 'processing', 'waiting', 'rejected', 'canceled')),
  origin text not null,
  taxes jsonb not null default '{}'::jsonb,
  observations text,
  nature_of_operation text,
  tax_regime text,
  pdf_url text,
  xml_url text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(14,3) not null default 1,
  unit_value numeric(14,2) not null default 0,
  discount_value numeric(14,2) not null default 0,
  total_value numeric(14,2) not null default 0,
  cnae text,
  ncm text,
  cfop text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.invoice_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  message text not null,
  type text not null check (type in ('info', 'success', 'warning', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.invoice_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  title text not null,
  description text,
  event_date timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.tax_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  invoice_type text not null check (invoice_type in ('NFS-e', 'NF-e', 'NFC-e')),
  tax_regime text not null,
  nature_of_operation text,
  default_iss_rate numeric(5,2),
  default_icms_rate numeric(5,2),
  service_city text,
  settings jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  category text not null check (category in ('infoproduct', 'ecommerce', 'payment', 'marketplace', 'crm', 'api')),
  description text,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'attention', 'syncing')),
  last_sync_at timestamptz,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.automations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  trigger text not null,
  conditions jsonb not null default '{}'::jsonb,
  actions jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'paused')),
  last_execution_at timestamptz,
  total_executions integer not null default 0,
  success_rate numeric(5,2) not null default 100,
  error_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  category text not null check (category in ('invoice', 'bank_statement', 'receipt', 'contract', 'payroll', 'corporate', 'others')),
  competence text not null,
  status text not null default 'pending' check (status in ('sent', 'pending', 'reviewed')),
  sender_name text,
  file_url text,
  file_size text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pending_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  responsible_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  sender_type text not null check (sender_type in ('client', 'accountant', 'system')),
  sender_name text,
  text text not null,
  file jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index company_members_profile_id_idx on public.company_members(profile_id);
create index clients_company_id_idx on public.clients(company_id);
create index products_company_id_idx on public.products(company_id);
create index services_company_id_idx on public.services(company_id);
create index sales_company_id_idx on public.sales(company_id);
create index invoices_company_id_idx on public.invoices(company_id);
create index invoices_client_id_idx on public.invoices(client_id);
create index invoice_items_invoice_id_idx on public.invoice_items(invoice_id);
create index invoice_logs_invoice_id_idx on public.invoice_logs(invoice_id);
create index invoice_events_invoice_id_idx on public.invoice_events(invoice_id);

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger companies_set_updated_at before update on public.companies for each row execute function public.set_updated_at();
create trigger company_members_set_updated_at before update on public.company_members for each row execute function public.set_updated_at();
create trigger clients_set_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();
create trigger sales_set_updated_at before update on public.sales for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger tax_settings_set_updated_at before update on public.tax_settings for each row execute function public.set_updated_at();
create trigger integrations_set_updated_at before update on public.integrations for each row execute function public.set_updated_at();
create trigger automations_set_updated_at before update on public.automations for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();
create trigger pending_tasks_set_updated_at before update on public.pending_tasks for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.sales enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.invoice_logs enable row level security;
alter table public.invoice_events enable row level security;
alter table public.tax_settings enable row level security;
alter table public.integrations enable row level security;
alter table public.automations enable row level security;
alter table public.documents enable row level security;
alter table public.pending_tasks enable row level security;
alter table public.chat_messages enable row level security;
